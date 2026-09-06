import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const read = (file: string) => readFileSync(join(HERE, '..', file), 'utf8')

const THEMES = read('themes.css')
const TOKENS = read('tokens.css')
const INDEX = read('index.css')

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const declared = (css: string) => new Set([...strip(css).matchAll(/--([\w-]+):/g)].map((m) => m[1]!))

/** Names `index.css` promotes into Tailwind's `@theme`, which a theme may also move. */
const THEME_LAYER = new Set([...strip(INDEX).matchAll(/--(font-[\w-]+):/g)].map((m) => m[1]!))

describe('themes.css', () => {
  /**
   * A theme re-points; it does not invent.
   *
   * A theme that introduced a token would be a second design system wearing
   * the first one's name: components read the token layer, so anything only a
   * theme defines is a value nothing consumes, and anything components had to
   * learn would make the theme a fork rather than a dressing.
   */
  it('only re-points tokens that already exist', () => {
    const known = declared(TOKENS)
    const unknown = [...declared(THEMES)].filter(
      (name) => !known.has(name) && !THEME_LAYER.has(name),
    )
    expect(unknown).toEqual([])
  })

  /**
   * Nothing may be anchored to `:root`, or five themes could not share a page —
   * which is exactly what the themes page does.
   */
  it('scopes every rule to an attribute, never to the root', () => {
    const selectors = [...strip(THEMES).matchAll(/^([^{}]+)\{/gm)].map((m) => m[1]!.trim())
    expect(selectors.length).toBeGreaterThan(0)
    for (const selector of selectors) {
      expect(selector, `"${selector}" must be attribute-scoped`).toMatch(/\[data-/)
      expect(selector, `"${selector}" must not anchor to :root`).not.toMatch(/:root/)
    }
  })

  /**
   * Law 8: dark is a value swap, not a second palette. Every surface a theme
   * moves has to move on both grounds, or the theme fails the moment someone
   * switches mode — the failure the two-block theme used to have.
   */
  it('gives every surface a dark value too', () => {
    const surfaces = [...strip(THEMES).matchAll(/\[data-surface='(\w+)'\]/g)].map((m) => m[1]!)
    for (const name of new Set(surfaces)) {
      expect(THEMES).toContain(`[data-mode='dark'][data-surface='${name}']`)
    }
  })

  /**
   * The radius axis moves the FACTOR, never a step.
   *
   * Re-typing the steps is what let the ladder go out of proportion with
   * itself, and a corner nested inside another corner is only ever right while
   * the two stay in proportion. One number keeps every step — the pill
   * included — on the same ratio at every setting.
   */
  it('themes the radius through the factor alone', () => {
    const touched = [...declared(THEMES)].filter((name) => name.startsWith('radius'))
    expect(touched).toEqual(['radius-factor'])
  })
})

describe('the radius ladder', () => {
  const RADIUS_BLOCK = /:root,\s*\[data-radius\]\s*\{([\s\S]*?)\n\}/.exec(strip(TOKENS))?.[1]

  /**
   * Declared for `[data-radius]` as well as `:root`, or a themed subtree never
   * reaches its own factor: a custom property substitutes `var()` where it is
   * DECLARED, so a ladder written only on the root bakes the root's factor in.
   * The themes page puts five radii on five wrappers, which is the case this
   * guards.
   */
  it('is declared for a themed subtree, not only for the root', () => {
    expect(RADIUS_BLOCK, 'tokens.css must declare the ladder for :root AND [data-radius]')
      .toBeDefined()
  })

  it('derives every step from --radius-factor', () => {
    const steps = ['radius-xs', 'radius-sm', 'radius', 'radius-lg', 'radius-pill']
    for (const step of steps) {
      const value = new RegExp(`--${step}:\\s*([^;]+);`).exec(RADIUS_BLOCK!)?.[1]
      expect(value, `--${step} must be declared in the ladder block`).toBeDefined()
      expect(value, `--${step} must scale with the factor`).toContain('var(--radius-factor)')
    }
  })

  /**
   * The nesting law: two rounded edges separated by a gap are concentric only
   * when the inner radius is the outer minus the gap. Both directions are
   * named, so a surface never has to guess — and the subtracting one is
   * clamped, because a negative radius is not a square corner, it is an
   * invalid declaration that takes the whole rule down with it.
   */
  it('names both directions of the nesting law', () => {
    expect(RADIUS_BLOCK).toMatch(/--radius-row:\s*max\(0px,\s*calc\(var\(--radius-lg\)/)
    expect(RADIUS_BLOCK).toMatch(/--radius-frame:\s*calc\(var\(--radius-lg\)/)
  })

  /** The adding direction is gated, or a square theme keeps a rounded frame. */
  it('gates the adding direction so a square theme stays square', () => {
    expect(RADIUS_BLOCK).toContain('--radius-gate: min(1, var(--radius-factor))')
    expect(/--radius-frame:[^;]*var\(--radius-gate\)/.test(RADIUS_BLOCK!)).toBe(true)
  })
})
