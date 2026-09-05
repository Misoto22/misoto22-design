/** @vitest-environment node */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SURFACE } from './surface'

/**
 * Renders every component on a server, with no DOM in scope.
 *
 * The failure this exists for is specific and nasty: a module that touches
 * `window`, `document` or `matchMedia` at import time works perfectly in every
 * browser test and takes down the first server render in production. It is
 * invisible to a jsdom suite, because jsdom provides all three.
 *
 * Components that own state or an effect carry `'use client'` and are expected
 * to render their initial markup here anyway — that is exactly what a React
 * Server Components host does before hydrating them.
 */
describe.each(SURFACE)('$dir', (entry) => {
  it('renders to static markup without a DOM', () => {
    expect(() => renderToStaticMarkup(entry.render())).not.toThrow()
  })

  it('produces markup, not an empty string', () => {
    // A component that silently renders nothing on the server is a blank first
    // paint and a layout shift on hydration.
    const markup = renderToStaticMarkup(entry.render())
    // Overlays legitimately render only their trigger until opened.
    expect(markup.length, `${entry.dir} rendered nothing`).toBeGreaterThan(0)
  })
})
