#!/usr/bin/env node
/**
 * The package, written for a reader that does not render CSS.
 *
 * There are two audiences for this package now, and only one of them can open a
 * browser. The second one has usually installed it — which means the version it
 * is writing against is sitting in `node_modules`, while the documentation it
 * would otherwise read is on a website that has moved on. That gap is the whole
 * reason this exists: everything here is generated from the source in the same
 * tarball, so it cannot describe a version the consumer does not have.
 *
 * Three outputs, one input each, no hand-maintained duplicates:
 *
 *   agent/catalog.mjs + src/{components,charts}/**  → dist/agent/<Component>.md
 *   agent/catalog.mjs                      → dist/agent/catalog.json
 *   agent/catalog.mjs                      → dist/agent/index.md
 *
 * The per-component file is the unit an agent actually wants: one fetch, one
 * component, every prop with its type and default, the exported unions, the
 * keyboard contract, and the `@example` blocks off the component's own JSDoc.
 * `index.md` is the cheap half — a name and a line each — so a reader can find
 * the one it needs without paying for the other fifty-one.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractProps } from './extract-props.mjs'
import { AXIS_DEFAULTS, CATALOG, GROUPS, slugOf } from '../agent/catalog.mjs'
import { themeAxes } from './theme-axes.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'dist', 'agent')
const SITE = 'https://ui.misoto22.com'

const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

/** A JSDoc block reflows to one paragraph: the line breaks were for a column. */
const flow = (text) => text?.replace(/\s*\n\s*/g, ' ').trim() ?? ''

function propLines(rows) {
  return rows.map((row) => {
    const head = [
      `- \`${row.name}\``,
      row.required ? '(required)' : '',
      `— \`${row.type.replace(/\s+/g, ' ')}\``,
      row.defaultValue ? `default \`${row.defaultValue}\`` : '',
    ]
      .filter(Boolean)
      .join(' ')
    const note = flow(row.description)
    return note ? `${head}. ${note}` : `${head}.`
  })
}

/** One component, as the whole of what the package knows about it. */
function componentText(entry, source) {
  const slug = slugOf(entry.name)
  const out = [
    `# ${entry.name}`,
    '',
    entry.summary,
    '',
    `- Group: ${entry.group}`,
    `- Import: \`import { ${entry.name} } from '@misoto22/design'\``,
    `- Version: ${version}`,
    `- Docs: ${SITE}/components/${slug}/`,
  ]
  if (entry.related?.length) out.push(`- Related: ${entry.related.join(', ')}`)
  out.push('')

  if (entry.when) out.push('## When to reach for it', '', entry.when, '')

  if (entry.accessibility?.length) {
    out.push('## Accessibility', '', ...entry.accessibility.map((line) => `- ${line}`), '')
  }

  if (entry.keyboard?.length) {
    out.push(
      '## Keyboard',
      '',
      ...entry.keyboard.map((row) => `- ${row.keys.join(' / ')} — ${row.does}`),
      '',
    )
  }

  const examples = []
  for (const part of source?.components ?? []) {
    out.push(`## ${part.name}`, '')
    if (part.description) out.push(flow(part.description), '')
    if (part.props?.length) out.push('### Props', '', ...propLines(part.props), '')
    if (part.passthrough?.length) {
      out.push(`Also accepts: ${part.passthrough.map((name) => `\`${name}\``).join(', ')}.`, '')
    }
    for (const example of part.examples ?? []) examples.push(example)
  }

  if (source?.exportedTypes?.length) {
    out.push(
      '## Types',
      '',
      ...source.exportedTypes.map((type) => `- \`${type.name}\` = \`${type.definition}\``),
      '',
    )
  }

  if (examples.length) {
    out.push('## Examples', '', '```tsx', examples.join('\n'), '```', '')
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n')
}

/**
 * Every exported identifier, pointed at the component that owns it.
 *
 * An agent asking for documentation rarely holds the directory name. It holds
 * the thing it just tried to import — `CardBody`, `TH`, `Toaster`,
 * `ButtonVariant` — which is a part or a type, not a component. Without this,
 * every one of those is a miss, and a miss costs a retry. With it they all
 * resolve, including the near misses the naming rules warn about.
 */
function exportIndex(props) {
  const index = {}
  for (const [name, source] of Object.entries(props)) {
    for (const part of source.components ?? []) index[part.name] = name
    for (const type of source.exportedTypes ?? []) index[type.name] = name
  }
  return index
}

/** One line per axis: the values the CSS defines, then what leaving it off gives. */
function axisLines() {
  return Object.entries(themeAxes()).map(([axis, values]) => {
    const listed = values.map((value) => `\`${value}\``).join(' ')
    return `- \`${axis}\`: ${listed} (unset = ${AXIS_DEFAULTS[axis] ?? 'the default'})`
  })
}

/** The index: every component, one line each, and nothing else. */
function indexText() {
  const out = [
    `# @misoto22/design ${version}`,
    '',
    '> Monochrome design system: portable CSS tokens and accessible React 19',
    '> primitives. Components ship compiled — import them, do not copy them.',
    '',
    "Install: `npm install @misoto22/design`. Styles: `import '@misoto22/design/styles.css'`.",
    '',
    'One component, in full, offline:',
    '',
    '```bash',
    'npx misoto22-design docs <Component>',
    '```',
    '',
    '## Theme axes',
    '',
    'Attributes, independent, and they work on any element — not just the root.',
    'An unset axis is the default.',
    '',
    ...axisLines(),
    '',
    'There is no `data-accent` attribute: `--accent` is a CSS custom property,',
    're-pointed in a stylesheet.',
    '',
    '## Components',
    '',
  ]
  for (const group of GROUPS) {
    const entries = CATALOG.filter((entry) => entry.group === group)
    if (entries.length === 0) continue
    out.push(`### ${group}`, '')
    for (const entry of entries) out.push(`- **${entry.name}** — ${entry.summary}`)
    out.push('')
  }
  return out.join('\n')
}

function main() {
  // Both entries. The charts ship from `@misoto22/design/charts` behind
  // optional peers, but an agent asking what `AreaChart` takes is asking the
  // same question as one asking about `Button`, and a documentation set that
  // answers only half of the package is one an agent cannot rely on.
  const props = {
    ...extractProps(join(ROOT, 'src', 'components')),
    ...extractProps(join(ROOT, 'src', 'charts')),
  }

  const missing = CATALOG.filter((entry) => !props[entry.name])
  if (missing.length > 0) {
    throw new Error(`catalog names no such component directory: ${missing.map((e) => e.name).join(', ')}`)
  }
  const undocumented = Object.keys(props).filter(
    (dir) => !CATALOG.some((entry) => entry.name === dir),
  )
  if (undocumented.length > 0) {
    throw new Error(`component with no catalog entry: ${undocumented.join(', ')}`)
  }

  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  for (const entry of CATALOG) {
    writeFileSync(join(OUT, `${entry.name}.md`), componentText(entry, props[entry.name]))
  }
  writeFileSync(join(OUT, 'index.md'), indexText())

  // The site reads this rather than re-authoring the same prose, the same way
  // it already reads dist/tokens.json rather than re-parsing the stylesheets.
  writeFileSync(
    join(OUT, 'catalog.json'),
    JSON.stringify(
      {
        version,
        groups: GROUPS,
        components: CATALOG.map((entry) => ({ slug: slugOf(entry.name), ...entry })),
        exports: exportIndex(props),
        themeAxes: Object.entries(themeAxes()).map(([axis, values]) => ({
          axis,
          values,
          unset: AXIS_DEFAULTS[axis] ?? null,
        })),
      },
      null,
      2,
    ),
  )

  console.log(`agent docs: ${CATALOG.length} components → dist/agent/`)
}

main()
