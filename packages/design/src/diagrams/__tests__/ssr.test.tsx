/** @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SURFACE } from './surface'

/**
 * Renders every diagram component on a server, with no DOM in scope.
 *
 * The failure this exists for is specific and nasty, and a figure renderer is
 * unusually exposed to it: a layout that measures real text needs `document`,
 * one that reads `window.devicePixelRatio` needs `window`, and either works
 * perfectly in every browser test and takes down the first server render in
 * production. It is invisible to a jsdom suite, because jsdom provides both.
 *
 * It is also what the five renderers' whole design is FOR. Every position is
 * arithmetic on numbers already in the specification, so the markup is a pure
 * function of the input — identical on the server and in the browser, with no
 * layout shift on hydration because there is no layout to do. This is the test
 * that keeps that true.
 */
describe.each(SURFACE)('$dir', (entry) => {
  it('renders to static markup without a DOM', () => {
    expect(() => renderToStaticMarkup(entry.render())).not.toThrow()
  })

  it('produces markup, not an empty string', () => {
    const markup = renderToStaticMarkup(entry.render())
    expect(markup.length, `${entry.dir} rendered nothing`).toBeGreaterThan(0)
  })
})

describe('figures', () => {
  it('draw the same picture twice', () => {
    // Two renders of one specification have to agree byte for byte. If they do
    // not, something in the layout is reading a clock, a random seed or a
    // measurement — and the server's markup and the client's first paint are
    // then two different diagrams.
    for (const entry of SURFACE) {
      expect(renderToStaticMarkup(entry.render())).toBe(renderToStaticMarkup(entry.render()))
    }
  })
})
