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

  /** The pill is a shape, not a corner, and no radius theme may flatten it. */
  it('leaves --radius-pill alone', () => {
    expect(declared(THEMES).has('radius-pill')).toBe(false)
  })
})
