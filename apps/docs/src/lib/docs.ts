import examplesJson from '@/generated/examples.json'
import propsJson from '@/generated/props.json'
import snippetsJson from '@/generated/snippets.json'
import tokensJson from '@/generated/tokens.json'
import templatesJson from '@/generated/templates.json'
import typesJson from '@/generated/types.json'

/**
 * Typed access to what `scripts/generate.mjs` produced.
 *
 * The JSON is imported rather than read at request time — this site is a static
 * export, so every page is built once and the data is inlined by the bundler.
 * The casts here are the boundary: the generator has no types to share, so this
 * is the one file that asserts a shape, and everything downstream is checked.
 */

export interface PropRow {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: string
}

export interface ComponentExport {
  name: string
  description: string
  examples: string[]
  props: PropRow[]
  passthrough: string[]
  propsType?: string
  /** Set when the export is a re-exported primitive rather than a component. */
  reexport?: string
}

export interface ComponentSource {
  components: ComponentExport[]
  exportedTypes: { name: string; definition: string }[]
}

export interface ExampleData {
  id: string
  /** The heading, with the ordering prefix stripped. */
  title: string
  snippet: string
  html: string
}

/** One token, as `@misoto22/design` emits it. */
export interface TokenRecord {
  layer: 'tokens' | 'semantic'
  category: string
  light: string
  /** Absent when the token holds the same value in both themes. */
  dark?: string
  comment?: string
}

export interface TokenEntry {
  name: string
  value: string
  comment?: string
  category: string
}

const PROPS = propsJson as unknown as Record<string, ComponentSource>
const EXAMPLES = examplesJson as unknown as Record<string, ExampleData[]>
const SNIPPETS = snippetsJson as unknown as Record<string, string>
const TYPES = typesJson as unknown as Record<string, HighlightedCode>
const TEMPLATES_SOURCE = templatesJson as unknown as Record<string, HighlightedCode>
const TOKENS = tokensJson as unknown as Record<string, TokenRecord>

export function componentSource(dir: string): ComponentSource {
  return PROPS[dir] ?? { components: [], exportedTypes: [] }
}

export function componentExamples(dir: string): ExampleData[] {
  return EXAMPLES[dir] ?? []
}

export interface HighlightedCode {
  source: string
  html: string
}

/** A component's exported type aliases, highlighted at build time. */
export function componentTypes(dir: string): HighlightedCode | undefined {
  return TYPES[dir]
}

/** A template's own source, highlighted at build time. */
export function templateSource(id: string): HighlightedCode | undefined {
  return TEMPLATES_SOURCE[id]
}

export function snippet(id: string): string {
  const html = SNIPPETS[id]
  if (!html) throw new Error(`snippet "${id}" is not in content/snippets.json`)
  return html
}

/** Raw snippet text, for the copy button — parsed back out of the source file. */
export function snippetSource(id: string): string {
  return SNIPPET_SOURCE[id] ?? ''
}

// The generator highlights the snippets but the raw text is still needed for
// "copy". Read from the same file it highlighted, so the two cannot diverge.
import snippetsSource from '@/content/snippets.json'
const SNIPPET_SOURCE = Object.fromEntries(
  Object.entries(snippetsSource as Record<string, { code: string }>).map(([id, value]) => [
    id,
    value.code,
  ]),
)

/**
 * Tokens for one foundations category, with the dark overrides alongside.
 *
 * Both CSS layers are merged: a reader looking for "colour" does not care
 * whether `--paper` came from the primitive file and `--background` from the
 * semantic one, only that both are colour and both are real.
 */
export function tokensByCategory(category: string): {
  rows: TokenEntry[]
  dark: Map<string, string>
} {
  const rows: TokenEntry[] = []
  const dark = new Map<string, string>()
  for (const [name, record] of Object.entries(TOKENS)) {
    if (record.category !== category) continue
    rows.push({ name, value: record.light, comment: record.comment, category: record.category })
    if (record.dark) dark.set(name, record.dark)
  }
  return { rows, dark }
}

/** How many tokens the system declares, for the landing page's figure band. */
export function tokenCount(): number {
  return Object.keys(TOKENS).length
}
