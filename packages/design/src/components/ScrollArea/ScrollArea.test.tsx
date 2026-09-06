import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ScrollArea } from './ScrollArea'

/**
 * Radix sets the viewport's `overflowX` and `overflowY` from which Scrollbar
 * children are mounted, and the axis without a bar is `hidden` — not merely
 * unmarked. So the default orientation is not a decoration about which bar is
 * drawn; it decides which half of the content a reader can reach at all.
 *
 * That is an inline style, which is the one piece of layout jsdom does record.
 */
const viewport = (container: HTMLElement) =>
  container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement

const CONTENT = (
  <>
    <p>a1b2c3d deployed to production from a very long branch name</p>
    <p>9f8e7d6 deployed</p>
  </>
)

describe('ScrollArea', () => {
  it('reaches both axes by default', () => {
    // The failure this exists for: content wider than the box was clipped with
    // no bar, no marking and no key or gesture that reached it.
    const { container } = render(
      <ScrollArea label="Deploy log" className="h-24 w-64">
        {CONTENT}
      </ScrollArea>,
    )
    expect(viewport(container).style.overflowX).toBe('scroll')
    expect(viewport(container).style.overflowY).toBe('scroll')
  })

  it('clips the other axis only when a caller asks for one', () => {
    // Still available, and now a decision someone wrote down.
    const { container } = render(
      <ScrollArea label="Deploy log" orientation="vertical" className="h-24 w-64">
        {CONTENT}
      </ScrollArea>,
    )
    expect(viewport(container).style.overflowX).toBe('hidden')
    expect(viewport(container).style.overflowY).toBe('scroll')
  })

  it('clips the vertical axis when a caller asks for horizontal alone', () => {
    const { container } = render(
      <ScrollArea label="Deploy log" orientation="horizontal" className="h-24 w-64">
        {CONTENT}
      </ScrollArea>,
    )
    expect(viewport(container).style.overflowX).toBe('scroll')
    expect(viewport(container).style.overflowY).toBe('hidden')
  })

  it('keeps the viewport the named, focusable region', () => {
    const { container } = render(
      <ScrollArea label="Deploy log" className="h-24 w-64">
        {CONTENT}
      </ScrollArea>,
    )
    expect(viewport(container)).toHaveAttribute('role', 'region')
    expect(viewport(container)).toHaveAttribute('aria-label', 'Deploy log')
    expect(viewport(container)).toHaveAttribute('tabindex', '0')
  })
})
