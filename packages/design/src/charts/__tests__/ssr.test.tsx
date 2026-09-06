/** @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CHART_SURFACE } from './surface'

/**
 * Renders every chart on a server, with no DOM in scope.
 *
 * Charts are the most likely part of the package to break this: a rendering
 * engine measures things, and measuring reaches for `window`. A chart that
 * throws here takes down the first server render of any page carrying it,
 * which no browser test would ever see.
 *
 * It also guards the skeleton. The shape this was ported from generated its
 * loading rows with `Math.random()` during render, so the server and the client
 * produced different markup and every loading chart logged a hydration
 * mismatch. The rows are seeded now, and the two assertions below are what say
 * so: identical output across two renders, on the server.
 */
describe.each(CHART_SURFACE)('$dir', (entry) => {
  it('renders to static markup without a DOM', () => {
    expect(() => renderToStaticMarkup(entry.render())).not.toThrow()
  })

  it('produces markup, not an empty string', () => {
    expect(renderToStaticMarkup(entry.render()).length).toBeGreaterThan(0)
  })
})
