#!/usr/bin/env node
/**
 * Builds everything this site knows about the design package, from the design
 * package itself.
 *
 * Three inputs, three outputs, no hand-maintained duplicates:
 *
 *   packages/design/src/components/**    → src/generated/props.json
 *   packages/design/src/styles/*.css     → src/generated/tokens.json
 *   apps/docs/src/examples/**            → src/generated/examples.json
 *
 * Examples are the interesting one. Each example is a real `.tsx` file that the
 * site IMPORTS and renders; this script reads the same file's text and stores
 * the displayed snippet. So the code block and the live preview are the same
 * source, and a preview cannot drift from the code printed beneath it — which
 * is the failure mode of every documentation site that keeps the two apart.
 *
 * Run by `predev` and `prebuild`; the output is gitignored.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHighlighter } from 'shiki'
import { extractChangelog } from './extract-changelog.mjs'
import { HIGHLIGHT, WHITE_RESET_DARK, WHITE_RESET_LIGHT } from './shiki-theme.mjs'
import { createRenderer } from './render-markdown.mjs'
import { extractProps } from './extract-props.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const DOCS = join(HERE, '..')
const DESIGN = join(DOCS, '..', '..', 'packages', 'design')
const OUT = join(DOCS, 'src', 'generated')

/**
 * Strips a snippet down to what a reader should copy: the imports come from the
 * package, not from a relative path inside this repository, and the file's
 * scaffolding (`export function Example()`) is not part of the lesson.
 */
function toSnippet(source) {
  const marker = source.indexOf('return (')
  if (marker === -1) {
    // A example that is a plain expression body rather than a block.
    return source.replace(/^import[\s\S]*?\n\n/, '').trim()
  }
  const body = source.slice(marker + 'return ('.length)
  const end = body.lastIndexOf('\n  )')
  const jsx = (end === -1 ? body : body.slice(0, end))
    .split('\n')
    // The JSX sits two levels in inside the example function; unindent it so the
    // snippet reads as something you would paste.
    .map((line) => (line.startsWith('    ') ? line.slice(4) : line))
    .join('\n')
    .trim()

  const imports = source
    .split('\n')
    .filter((line) => line.startsWith('import') && line.includes('@misoto22/design'))
    .join('\n')

  return imports ? `${imports}\n\n${jsx}` : jsx
}

async function main() {
  mkdirSync(OUT, { recursive: true })

  // ─── Fonts ───
  // The package vendors its faces next to its CSS, with relative URLs that only
  // resolve from inside the package. A statically exported Next app serves from
  // `public/`, so the files are copied there and the rules rewritten to
  // absolute paths — one generated file rather than a second hand-kept copy of
  // the weight list.
  const fontsOut = join(DOCS, 'public', 'fonts')
  mkdirSync(fontsOut, { recursive: true })
  cpSync(join(DESIGN, 'src', 'styles', 'fonts'), fontsOut, { recursive: true })
  writeFileSync(
    join(OUT, 'fonts.css'),
    readFileSync(join(DESIGN, 'src', 'styles', 'fonts.css'), 'utf8').replaceAll("'./fonts/", "'/fonts/"),
  )

  // ─── Props ───
  const props = extractProps(join(DESIGN, 'src', 'components'))
  // Placed after the highlighter exists, below — see `highlightTypes`.
  writeFileSync(join(OUT, 'props.json'), JSON.stringify(props, null, 2))

  // ─── Tokens ───
  // Read from the package's own emitted artifact, not parsed here. The parser
  // used to live in this app, which meant the site and the package could
  // disagree about what a token was — and the site would have been the one
  // people believed. `pnpm build:design` produces this file; the docs build
  // depends on it having run.
  const tokens = JSON.parse(readFileSync(join(DESIGN, 'dist', 'tokens.json'), 'utf8'))
  writeFileSync(join(OUT, 'tokens.json'), JSON.stringify(tokens, null, 2))

  // ─── Examples ───
  const highlighter = await createHighlighter({
    // The system's own pair, not GitHub's. See `shiki-theme.mjs`: structure is
    // carried by weight, and the only two hues are the two the system already
    // spends on status. A published theme put seven of them on a page whose
    // argument is that it has none.
    //
    // Two themes because the site has two: Shiki emits both as CSS variables on
    // one markup pass, so switching mode does not re-highlight anything.
    themes: [WHITE_RESET_LIGHT, WHITE_RESET_DARK],
    langs: ['tsx', 'ts', 'css', 'bash', 'json', 'html', 'md'],
  })

  const examplesDir = join(DOCS, 'src', 'examples')
  const examples = {}
  for (const entry of readdirSync(examplesDir).sort()) {
    const dir = join(examplesDir, entry)
    if (!statSync(dir).isDirectory()) continue
    examples[entry] = readdirSync(dir)
      .filter((file) => file.endsWith('.tsx'))
      .sort()
      .map((file) => {
        const source = readFileSync(join(dir, file), 'utf8')
        const snippet = toSnippet(source)
        const id = file.replace(/\.tsx$/, '')
        return {
          id,
          // The leading digits order the files on disk and are not part of the
          // heading — putting the order in the filename keeps it visible in a
          // directory listing instead of hidden in a second registry.
          title: id.replace(/^\d+-/, '').replace(/-/g, ' '),
          snippet,
          lang: 'tsx',
          html: highlighter.codeToHtml(snippet, { lang: 'tsx', ...HIGHLIGHT }),
        }
      })
  }
  writeFileSync(join(OUT, 'examples.json'), JSON.stringify(examples, null, 2))

  // A static import map, because a statically exported Next app cannot resolve
  // a component from a string at runtime. Generated rather than hand-kept: a
  // new example file must appear in the site without anyone editing a barrel,
  // and a deleted one must not leave a dangling import behind.
  const imports = []
  const rows = []
  let index = 0
  for (const [dir, list] of Object.entries(examples)) {
    for (const example of list) {
      const binding = `Example${index}`
      imports.push(`import { Example as ${binding} } from '../examples/${dir}/${example.id}'`)
      rows.push(`  '${dir}/${example.id}': ${binding},`)
      index += 1
    }
  }
  writeFileSync(
    join(OUT, 'example-registry.ts'),
    `/* GENERATED by scripts/generate.mjs — do not edit. */\n` +
      `import type { ComponentType } from 'react'\n` +
      `${imports.join('\n')}\n\n` +
      `export const EXAMPLES: Record<string, ComponentType> = {\n${rows.join('\n')}\n}\n`,
  )

  // ─── Templates ───
  // Same trick as the examples: the page RENDERS the module and the code block
  // is read from the same file, so a template cannot drift from the source
  // printed under it. Templates are long, so only the highlighted markup is
  // stored — the raw text is read back from disk by the copy button's snippet.
  const templatesDir = join(DOCS, 'src', 'templates')
  const templates = {}
  for (const file of readdirSync(templatesDir).filter((name) => name.endsWith('.tsx')).sort()) {
    const source = readFileSync(join(templatesDir, file), 'utf8')
    const id = file.replace(/\.tsx$/, '')
    templates[id] = {
      source,
      lang: 'tsx',
      html: highlighter.codeToHtml(source, { lang: 'tsx', ...HIGHLIGHT }),
    }
  }
  writeFileSync(join(OUT, 'templates.json'), JSON.stringify(templates, null, 2))

  // Static imports, for the same reason the examples need them: a statically
  // exported app cannot resolve a component from a string at runtime.
  writeFileSync(
    join(OUT, 'template-registry.ts'),
    `/* GENERATED by scripts/generate.mjs — do not edit. */\n` +
      `import type { ComponentType } from 'react'\n` +
      Object.keys(templates)
        .map((id) => `import { ${id} } from '../templates/${id}'`)
        .join('\n') +
      `\n\nexport const TEMPLATE_COMPONENTS: Record<string, ComponentType> = {\n` +
      Object.keys(templates)
        .map((id) => `  ${id},`)
        .join('\n') +
      `\n}\n`,
  )

  // ─── Posts ───
  // Markdown rendered here rather than in the browser: a parser, a highlighter
  // and a maths renderer are a few hundred kilobytes to re-derive markup that
  // never changes. What ships is blocks — HTML for the prose, a spec for each
  // diagram, because a diagram is a component and cannot arrive as a string.
  const renderMarkdown = createRenderer({ highlighter })
  const postsDir = join(DOCS, 'src', 'content', 'posts')
  const posts = {}
  for (const file of readdirSync(postsDir).filter((name) => name.endsWith('.md')).sort()) {
    const slug = file.replace(/\.md$/, '')
    posts[slug] = { slug, ...renderMarkdown(readFileSync(join(postsDir, file), 'utf8')) }
  }
  writeFileSync(join(OUT, 'posts.json'), JSON.stringify(posts, null, 2))

  // ─── Changelog ───
  // The PACKAGE's file first — that is the one changesets writes, and the one
  // that ships to npm — then the repository root's, which holds the
  // hand-written pre-changeset history and nothing since. Reading only the root
  // is what froze this page at 0.1.0 while two releases went out.
  writeFileSync(
    join(OUT, 'changelog.json'),
    JSON.stringify(
      extractChangelog([join(DESIGN, 'CHANGELOG.md'), join(DESIGN, '..', '..', 'CHANGELOG.md')]),
      null,
      2,
    ),
  )

  // ─── Search ───
  // One flat index over everything a reader might type. Built here rather than
  // matched at runtime over three separate shapes, so the sidebar's filter and
  // any future search UI ask the same question of the same text.
  const searchIndex = Object.entries(examples).flatMap(([dir, list]) =>
    list.map((example) => ({ dir, id: example.id, snippet: example.snippet })),
  )
  writeFileSync(join(OUT, 'search.json'), JSON.stringify(searchIndex, null, 2))

  // ─── Standalone snippets (installation, usage) ───
  const snippets = {}
  const snippetsFile = join(DOCS, 'src', 'content', 'snippets.json')
  for (const [id, snippet] of Object.entries(JSON.parse(readFileSync(snippetsFile, 'utf8')))) {
    // The language travels with the markup. A code block that does not say what
    // language it is in makes the reader infer it from the syntax, which is the
    // one thing they came to the block to learn.
    snippets[id] = {
      lang: snippet.lang,
      source: snippet.code,
      html: highlighter.codeToHtml(snippet.code, { lang: snippet.lang, ...HIGHLIGHT }),
    }
  }
  writeFileSync(join(OUT, 'snippets.json'), JSON.stringify(snippets, null, 2))

  // ─── Exported type declarations, highlighted ───
  // A component page prints its public type aliases verbatim. They are code, so
  // they get the same treatment as every other snippet rather than a hand-built
  // <pre> that renders in one flat colour.
  const types = {}
  for (const [dir, source] of Object.entries(props)) {
    if (source.exportedTypes.length === 0) continue
    const code = source.exportedTypes
      .map((type) => `export type ${type.name} = ${type.definition}`)
      .join('\n')
    types[dir] = {
      source: code,
      lang: 'tsx',
      html: highlighter.codeToHtml(code, { lang: 'tsx', ...HIGHLIGHT }),
    }
  }
  writeFileSync(join(OUT, 'types.json'), JSON.stringify(types, null, 2))

  const templateCount = Object.keys(templates).length
  const componentCount = Object.keys(props).length
  const exampleCount = Object.values(examples).reduce((n, list) => n + list.length, 0)
  console.log(
    `generate: ${componentCount} components, ${exampleCount} examples, ` +
      `${templateCount} templates, ${Object.keys(posts).length} posts, ` +
      `${Object.keys(tokens).length} tokens → src/generated/`,
  )
}

await main()
