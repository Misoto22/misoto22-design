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
  /** What the block is written in, printed on the block itself. */
  lang: string
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
const SNIPPETS = snippetsJson as unknown as Record<string, HighlightedCode>
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
  /** The language the block is written in. Printed on the block. */
  lang: string
}

/** A component's exported type aliases, highlighted at build time. */
export function componentTypes(dir: string): HighlightedCode | undefined {
  return TYPES[dir]
}

/** A template's own source, highlighted at build time. */
export function templateSource(id: string): HighlightedCode | undefined {
  return TEMPLATES_SOURCE[id]
}

/**
 * One standalone snippet: its markup, its raw text and its language.
 *
 * All three come out of the generator together. The raw text used to be read
 * back from `content/snippets.json` on this side, which meant the copy button
 * and the highlighted block were two reads of one file that could disagree
 * about whitespace; and the language was dropped entirely, so no block on the
 * site said what it was written in.
 */
export function snippet(id: string): HighlightedCode {
  const found = SNIPPETS[id]
  if (!found) throw new Error(`snippet "${id}" is not in content/snippets.json`)
  return found
}

/**
 * The steps on the radius ladder, for the landing page's figure band.
 *
 * Counted from the emitted tokens rather than written as a number, because the
 * number on that page was `4` in a string literal and the ladder has since
 * grown a step — which nothing would have caught.
 */
const RADIUS_LADDER = ['radius-xs', 'radius-sm', 'radius', 'radius-lg', 'radius-pill']
export function radiusSteps(): number {
  return RADIUS_LADDER.filter((name) => name in TOKENS).length
}

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
