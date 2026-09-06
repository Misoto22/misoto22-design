/**
 * The theme axes, read out of the stylesheets that define them.
 *
 * These were described by hand in two places, and both went wrong in the way a
 * hand-kept list of someone else's file always does: the site's `llms.txt`
 * advertised a `data-accent` attribute that has never existed, and omitted
 * `data-surface="glass"`, which has. An agent reading it set an attribute that
 * does nothing and never reached one that does.
 *
 * So the axes and their values are derived. A selector is the only thing that
 * decides whether an axis value is real, and adding one to the CSS is now the
 * whole of adding one to the documentation.
 *
 * What is NOT derivable is what an unset axis gives you — `catalog.mjs` authors
 * that, and `catalog.test.ts` fails when the two lists stop matching.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const STYLES = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles')

/** The stylesheets that carry an axis selector. Both, because both do. */
const SOURCES = ['tokens.css', 'themes.css']

/** `[data-surface='warm']` and `[data-mode="dark"]` — either quote style. */
const AXIS_SELECTOR = /\[data-([a-z]+)=['"]([a-z]+)['"]\]/g

/**
 * @returns {Record<string, string[]>} axis attribute → its values, sorted.
 */
export function themeAxes() {
  /** @type {Record<string, Set<string>>} */
  const axes = {}
  for (const file of SOURCES) {
    const css = readFileSync(join(STYLES, file), 'utf8')
    for (const [, axis, value] of css.matchAll(AXIS_SELECTOR)) {
      // `data-mode="light"` appears as an explicit reset of the dark block; it
      // is a real value a caller can set, so it stays.
      ;(axes[`data-${axis}`] ??= new Set()).add(value)
    }
  }
  return Object.fromEntries(
    Object.entries(axes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([axis, values]) => [axis, [...values].sort()]),
  )
}
