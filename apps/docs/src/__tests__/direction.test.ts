import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Every hand-written `.tsx` under `src`, which is where this app's class names
 * live — `.ts` here holds copy, and its prose names the physical sides in order
 * to explain the rule.
 *
 * `generated` is skipped: it is build output rebuilt from the design package on
 * every `pnpm generate`, and the package guards its own source.
 */
function sources(): { file: string; text: string }[] {
  const found: { file: string; text: string }[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'generated') walk(path)
      } else if (entry.name.endsWith('.tsx')) {
        found.push({ file: relative(SRC, path), text: readFileSync(path, 'utf8') })
      }
    }
  }
  walk(SRC)
  return found
}

/**
 * Physical direction utilities, and what to write instead.
 *
 * The same table the design package enforces on its own components, applied to
 * the site that documents them. It is duplicated rather than imported because
 * the dependency only runs one way: the package must build and publish without
 * this app present, so its test cannot reach in here, and exporting a rule list
 * from the package would put an internal lint rule into a consumer contract.
 *
 * The docs site makes the same RTL promise the components do — it renders every
 * example, in a shell of its own — so a physical utility in this app breaks the
 * promise just as visibly, and until now nothing said so.
 */
const PHYSICAL: { pattern: RegExp; instead: string }[] = [
  { pattern: /\B-?\bml-(?![a-z])/, instead: 'ms-' },
  { pattern: /\B-?\bmr-(?![a-z])/, instead: 'me-' },
  { pattern: /\bpl-(?![a-z])/, instead: 'ps-' },
  { pattern: /\bpr-(?![a-z])/, instead: 'pe-' },
  { pattern: /(?<![-\w:])left-(?!1\/2)/, instead: 'start-' },
  { pattern: /(?<![-\w:])right-/, instead: 'end-' },
  { pattern: /\bborder-l\b/, instead: 'border-s' },
  { pattern: /\bborder-r\b/, instead: 'border-e' },
  { pattern: /\brounded-l\b/, instead: 'rounded-s' },
  { pattern: /\brounded-r\b/, instead: 'rounded-e' },
  { pattern: /\btext-left\b/, instead: 'text-start' },
  { pattern: /\btext-right\b/, instead: 'text-end' },
]

/** Comments explain the rule and legitimately name the physical sides. */
function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/**
 * A class token split on its variant colons, ignoring the colons inside an
 * arbitrary value — `supports-[display:grid]:` is one variant, not two.
 */
function variants(token: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of token) {
    if (char === '[' || char === '(') depth += 1
    else if (char === ']' || char === ')') depth -= 1
    else if (char === ':' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts
}

type Slide = { variants: string[]; negative: boolean; value: string }

/** The token as an inline-axis movement, or undefined if it does not move. */
function slide(token: string): Slide | undefined {
  const parts = variants(token)
  const utility = parts.pop() ?? ''
  const negative = utility.startsWith('-')
  const value = (negative ? utility.slice(1) : utility).match(/^translate-x-(.+)$/)?.[1]
  // `translate-x-0` does not move, and `-translate-x-1/2` centres — and
  // centring is the same in both directions.
  if (value === undefined || value === '0' || value === '1/2') return undefined
  return { variants: parts, negative, value }
}

/** Variant order is Tailwind's to decide, so compare on a sorted key. */
const key = (moved: Slide): string =>
  `${[...moved.variants].sort().join(':')}|${moved.negative}|${moved.value}`

/** The same movement, under `rtl:`, going the other way. */
function mirror(moved: Slide): Slide {
  const rest = moved.variants.filter((variant) => variant !== 'rtl')
  return {
    variants: moved.variants.includes('rtl') ? rest : ['rtl', ...rest],
    negative: !moved.negative,
    value: moved.value,
  }
}

const show = (moved: Slide): string =>
  `${moved.variants.map((variant) => `${variant}:`).join('')}${moved.negative ? '-' : ''}translate-x-${moved.value}`

/**
 * Every inline-axis movement whose mirror image is missing from the same run of
 * class names.
 *
 * The pairing is per token, not per file. A file-wide `rtl:` search would let
 * one mirrored utility vouch for every other movement in the file, so a second
 * drawer — or a fifth `Sheet` side — could slide the wrong way while the suite
 * stayed green. Runs are bounded by quotes, braces and line ends, which is
 * where a class string ends in JSX.
 */
function unpaired(text: string): string[] {
  const found: string[] = []
  for (const run of code(text).split(/[`'"{}\n]/)) {
    const moves = run.split(/\s+/).map(slide).filter((m): m is Slide => m !== undefined)
    const present = new Set(moves.map(key))
    for (const moved of moves) {
      const wanted = mirror(moved)
      if (!present.has(key(wanted))) found.push(`${show(moved)} → add ${show(wanted)}`)
    }
  }
  return found
}

describe('direction independence', () => {
  it('finds the app source to scan', () => {
    // A walk that silently matches nothing would pass every assertion below.
    expect(sources().length).toBeGreaterThan(20)
  })

  it.each(sources())('$file uses logical properties', ({ text }) => {
    const found = PHYSICAL.filter(({ pattern }) => pattern.test(code(text))).map(
      ({ pattern, instead }) => `${pattern.source} → use ${instead}`,
    )
    expect(found).toEqual([])
  })

  it.each(sources())('$file mirrors every transform along the inline axis', ({ text }) => {
    // A `translate-x` is physical by definition: Tailwind has no logical
    // translate. Anything that slides sideways therefore needs an explicit
    // `rtl:` counterpart, or it slides the wrong way in half the world.
    expect(unpaired(text)).toEqual([])
  })
})
