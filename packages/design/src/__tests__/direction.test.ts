import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const COMPONENTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'components')

function sources(): { file: string; text: string }[] {
  return readdirSync(COMPONENTS)
    .filter((entry) => statSync(join(COMPONENTS, entry)).isDirectory())
    .map((dir) => ({ file: `${dir}/${dir}.tsx`, path: join(COMPONENTS, dir, `${dir}.tsx`) }))
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

describe('direction independence', () => {
  it.each(sources())('$file uses logical properties', ({ text }) => {
    // Comments explain the rule and legitimately name the physical sides.
    const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
    const found = PHYSICAL.filter(({ pattern }) => pattern.test(code)).map(
      ({ pattern, instead }) => `${pattern.source} → use ${instead}`,
    )
    expect(found).toEqual([])
  })

  it('mirrors any transform that moves along the inline axis', () => {
    // A `translate-x` is physical by definition: Tailwind has no logical
    // translate. Anything that slides sideways therefore needs an explicit
    // `rtl:` counterpart, or it slides the wrong way in half the world.
    const offenders: string[] = []
    for (const { file, text } of sources()) {
      const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
      // `-translate-x-1/2` centres; centring is the same in both directions.
      const slides = /(?<!-)\btranslate-x-(?!0\b)(?!1\/2\b)/.test(code)
      if (slides && !/\brtl:/.test(code)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})
