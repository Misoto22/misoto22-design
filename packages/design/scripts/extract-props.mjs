/**
 * Reads the design package's own source and emits its prop tables.
 *
 * Hand-written prop tables are the classic way a documentation site starts
 * lying: someone adds a `tone`, ships it, and the table still lists four props.
 * These are parsed from the TypeScript AST at build time, so a prop that is not
 * in the source cannot appear here, and one that is cannot be forgotten.
 *
 * The interesting part is resolution. A component's props type is rarely one
 * interface — it is `CommonProps & Omit<AnchorHTMLAttributes<…>, 'className'>`,
 * or a union of two such things, and the interesting half (`CommonProps`) is
 * usually not exported because it is not meant to be imported. So this walks
 * the type expression, folds in every LOCAL declaration it can reach, and
 * records what it could not follow as a one-line passthrough note rather than
 * flattening 180 rows of `onAnimationStart` into the table.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

/** JSDoc text for a node, with the `@example` / `@default` tags split out. */
function readDoc(node) {
  const jsDoc = node.jsDoc?.[node.jsDoc.length - 1]
  if (!jsDoc) return { description: '', examples: [], defaultValue: undefined }

  const text = (comment) =>
    typeof comment === 'string' ? comment : (comment ?? []).map((part) => part.text ?? '').join('')

  const examples = []
  let defaultValue
  for (const tag of jsDoc.tags ?? []) {
    if (tag.tagName.text === 'example') examples.push(text(tag.comment).trim())
    if (tag.tagName.text === 'default') defaultValue = text(tag.comment).trim()
  }
  return { description: text(jsDoc.comment).trim(), examples, defaultValue }
}

/**
 * Collects `{ propName: 'defaultLiteral' }` from a component's destructured
 * parameter, which is where this codebase actually writes its defaults. A
 * `@default` tag would be a second place to keep in step, and the two would
 * disagree within a month.
 */
function readDestructuredDefaults(fn, source) {
  const defaults = {}

  const readPattern = (pattern) => {
    for (const element of pattern.elements) {
      if (!element.initializer || !ts.isIdentifier(element.name)) continue
      defaults[element.name.text] = element.initializer.getText(source)
    }
  }

  const [param] = fn.parameters ?? []
  if (param && ts.isObjectBindingPattern(param.name)) readPattern(param.name)

  // A component whose props are a discriminated union cannot destructure in the
  // signature — it takes `props` whole and unpacks in the body. Button does
  // exactly that, and reading only the signature reported it as having no
  // defaults at all.
  for (const statement of fn.body?.statements ?? []) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isObjectBindingPattern(declaration.name)) readPattern(declaration.name)
    }
  }

  return defaults
}

function interfaceMembers(node, source) {
  return node.members
    .filter((member) => ts.isPropertySignature(member) && member.name)
    .map((member) => {
      const doc = readDoc(member)
      return {
        name: member.name.getText(source),
        type: member.type ? member.type.getText(source) : 'unknown',
        required: !member.questionToken,
        description: doc.description,
        defaultValue: doc.defaultValue,
      }
    })
}

/**
 * Every type-ish declaration in a file, exported or not, keyed by name — plus
 * whether it was exported, which is what decides if the docs site lists it as
 * part of the public surface.
 */
function collectDeclarations(source) {
  const declarations = new Map()
  source.forEachChild((node) => {
    const exported = Boolean(node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
    if (ts.isInterfaceDeclaration(node)) {
      declarations.set(node.name.text, { kind: 'interface', node, exported })
    } else if (ts.isTypeAliasDeclaration(node)) {
      declarations.set(node.name.text, { kind: 'alias', node, exported })
    }
  })
  return declarations
}

/**
 * Walks a type expression, folding in local declarations and describing what it
 * could not follow.
 *
 * @returns {{ members: object[], passthrough: string[], union: boolean }}
 */
function resolveType(typeNode, declarations, source, seen = new Set()) {
  const members = []
  const passthrough = []
  let union = false

  const visit = (node) => {
    if (!node) return

    if (ts.isParenthesizedTypeNode(node)) return visit(node.type)

    if (ts.isIntersectionTypeNode(node)) {
      node.types.forEach(visit)
      return
    }

    if (ts.isUnionTypeNode(node)) {
      // A discriminated union of shapes — Button's link form vs its button
      // form. Both halves are documented in one table, but a prop that is
      // required in ONE branch is not required of the component: `href` is
      // mandatory only if you are building the link. Resolving each branch
      // separately and intersecting is what stops the table demanding a prop
      // that half the call sites must not pass.
      union = true
      const branches = node.types.map((branch) =>
        resolveType(branch, declarations, source, new Set(seen)),
      )
      const requiredEverywhere = new Set(
        branches[0]?.members.filter((m) => m.required).map((m) => m.name) ?? [],
      )
      for (const branch of branches.slice(1)) {
        const here = new Set(branch.members.filter((m) => m.required).map((m) => m.name))
        for (const name of [...requiredEverywhere]) {
          if (!here.has(name)) requiredEverywhere.delete(name)
        }
      }
      for (const branch of branches) {
        members.push(
          ...branch.members.map((m) => ({ ...m, required: requiredEverywhere.has(m.name) })),
        )
        passthrough.push(...branch.passthrough)
      }
      return
    }

    if (ts.isTypeLiteralNode(node)) {
      members.push(...interfaceMembers(node, source))
      return
    }

    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName.getText(source)
      const args = node.typeArguments ?? []

      // Omit<X, 'a' | 'b'> / Pick<X, …>: follow X, then apply the filter, so a
      // component that deliberately removes a prop does not still list it.
      if ((name === 'Omit' || name === 'Pick') && args[0]) {
        const inner = resolveType(args[0], declarations, source, seen)
        const keys = new Set(
          (args[1]?.getText(source) ?? '')
            .split('|')
            .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean),
        )
        const keep =
          name === 'Omit'
            ? inner.members.filter((m) => !keys.has(m.name))
            : inner.members.filter((m) => keys.has(m.name))
        members.push(...keep)
        passthrough.push(...inner.passthrough)
        return
      }

      const declaration = declarations.get(name)
      if (declaration) {
        // Already folded in by a sibling branch of a union — skip it, rather
        // than falling through and reporting a LOCAL shape as an unfollowed
        // passthrough, which is what listed `CommonProps` beside the DOM bags.
        if (seen.has(name)) return
        seen.add(name)
        if (declaration.kind === 'interface') {
          members.push(...interfaceMembers(declaration.node, source))
          for (const clause of declaration.node.heritageClauses ?? []) {
            clause.types.forEach(visit)
          }
        } else {
          visit(declaration.node.type)
        }
        return
      }

      // Not local — a DOM attribute bag, a Radix component's props, a type
      // parameter. Named, not enumerated.
      passthrough.push(node.getText(source))
      return
    }

    if (ts.isExpressionWithTypeArguments(node)) {
      // A heritage clause entry: `extends HTMLAttributes<HTMLDivElement>`.
      const name = node.expression.getText(source)
      const declaration = declarations.get(name)
      if (declaration) {
        if (seen.has(name)) return
        seen.add(name)
        if (declaration.kind === 'interface') {
          members.push(...interfaceMembers(declaration.node, source))
          for (const clause of declaration.node.heritageClauses ?? []) clause.types.forEach(visit)
        } else {
          visit(declaration.node.type)
        }
        return
      }
      passthrough.push(node.getText(source))
      return
    }
  }

  visit(typeNode)

  // First declaration of a name wins, which is the one carrying the doc comment
  // in every shape this codebase writes.
  const deduped = []
  const byName = new Set()
  for (const member of members) {
    if (byName.has(member.name)) continue
    byName.add(member.name)
    deduped.push(member)
  }

  return { members: deduped, passthrough: [...new Set(passthrough)], union }
}

/** Resolves a props type BY NAME, which is how a component's parameter is written. */
function resolveNamed(name, declarations, source) {
  const declaration = declarations.get(name)
  if (!declaration) return { members: [], passthrough: [], union: false }
  if (declaration.kind === 'interface') {
    const members = interfaceMembers(declaration.node, source)
    const inherited = { members: [], passthrough: [], union: false }
    for (const clause of declaration.node.heritageClauses ?? []) {
      for (const type of clause.types) {
        const resolved = resolveType(type, declarations, source, new Set([name]))
        inherited.members.push(...resolved.members)
        inherited.passthrough.push(...resolved.passthrough)
      }
    }
    const seenNames = new Set(members.map((m) => m.name))
    return {
      members: [...members, ...inherited.members.filter((m) => !seenNames.has(m.name))],
      passthrough: [...new Set(inherited.passthrough)],
      union: false,
    }
  }
  return resolveType(declaration.node.type, declarations, source, new Set([name]))
}

function extractFile(filePath) {
  const text = readFileSync(filePath, 'utf8')
  const source = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const declarations = collectDeclarations(source)

  const components = []
  const exportedTypes = []

  source.forEachChild((node) => {
    const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    if (!exported) return

    if (ts.isTypeAliasDeclaration(node) && !node.name.text.endsWith('Props')) {
      exportedTypes.push({ name: node.name.text, definition: node.type.getText(source) })
      return
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      const doc = readDoc(node)
      const propsTypeName = node.parameters?.[0]?.type?.getText(source)
      const resolved = propsTypeName
        ? resolveNamed(propsTypeName, declarations, source)
        : { members: [], passthrough: [], union: false }
      const defaults = readDestructuredDefaults(node, source)
      for (const member of resolved.members) {
        if (member.defaultValue === undefined && defaults[member.name] !== undefined) {
          member.defaultValue = defaults[member.name]
        }
      }
      components.push({
        name: node.name.text,
        description: doc.description,
        examples: doc.examples,
        propsType: propsTypeName,
        props: resolved.members,
        passthrough: resolved.passthrough,
      })
      return
    }

    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue
        const doc = readDoc(node)
        components.push({
          name: declaration.name.text,
          description: doc.description,
          examples: doc.examples,
          props: [],
          passthrough: [],
          reexport: declaration.initializer?.getText(source),
        })
      }
    }
  })

  return { components, exportedTypes }
}

/**
 * @param {string} componentsDir packages/design/src/components
 * @returns {Record<string, ReturnType<typeof extractFile>>} keyed by directory name
 */
export function extractProps(componentsDir) {
  const out = {}
  for (const entry of readdirSync(componentsDir).sort()) {
    const dir = join(componentsDir, entry)
    if (!statSync(dir).isDirectory()) continue
    const file = join(dir, `${entry}.tsx`)
    try {
      statSync(file)
    } catch {
      continue
    }
    out[entry] = extractFile(file)
  }
  return out
}
