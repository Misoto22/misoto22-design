import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Every source the rule applies to: one file per component directory, one per
 * chart directory, and the charts' shared machinery — which draws the legend,
 * the tooltip and the brush, and is therefore exactly where a physical utility
 * would do the most damage.
 */
function paths(): { file: string; path: string }[] {
  const found: { file: string; path: string }[] = []

  const directories = (root: string) =>
    readdirSync(root).filter((entry) => statSync(join(root, entry)).isDirectory())

  for (const dir of directories(join(SRC, 'components'))) {
    found.push({ file: `components/${dir}`, path: join(SRC, 'components', dir, `${dir}.tsx`) })
  }

  const charts = join(SRC, 'charts')
  for (const dir of directories(charts).filter((entry) => entry !== '__tests__')) {
    if (dir === 'lib') {
      for (const file of readdirSync(join(charts, 'lib')).filter((name) => name.endsWith('.tsx'))) {
        found.push({ file: `charts/lib/${file}`, path: join(charts, 'lib', file) })
      }
      continue
    }
    found.push({ file: `charts/${dir}`, path: join(charts, dir, `${dir}.tsx`) })
  }

  return found
}

function sources(): { file: string; text: string }[] {
  return paths()
    .filter((entry) => {
      try {
        return statSync(entry.path).isFile()
      } catch {
        return false
      }
    })
    .map((entry) => ({ file: entry.file, text: readFileSync(entry.path, 'utf8') }))
}

/**
 * Physical direction utilities, and what to write instead.
 *
 * The system is not translated today, and that is exactly why this is enforced
 * now: retrofitting direction into forty components after the fact is a sweep
 * nobody schedules, and the failure mode is silent — an Arabic or Hebrew page
 * where every icon sits on the wrong side of its label and no test says so.
 * Writing `pe-6` instead of `pr-6` costs nothing at the moment of writing.
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
