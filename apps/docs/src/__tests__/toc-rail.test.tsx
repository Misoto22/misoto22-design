import './jsdom-layout'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TocRail, numberToc } from '@/components/TocRail'

/** A page with a real outline, plus one heading inside a preview frame. */
function page() {
  return (
    <div id="content">
      <h2 id="usage">Usage</h2>
      <h2 id="examples">Examples</h2>
      <h3 id="example-default">Default</h3>
      <div data-toc-skip="">
        {/* An example canvas renders real components, and some are headings. */}
        <h2 id="inside-a-preview">A heading being demonstrated</h2>
      </div>
      <h2 id="related">Related</h2>
    </div>
  )
}

describe('numberToc', () => {
  it('numbers sections and the level beneath them', () => {
    expect(
      numberToc([
        { id: 'a', label: 'A', level: 2 },
        { id: 'b', label: 'B', level: 3 },
        { id: 'c', label: 'C', level: 3 },
        { id: 'd', label: 'D', level: 2 },
      ]),
    ).toEqual(['1', '1.1', '1.2', '2'])
  })

  it('measures from the shallowest level present, not from h2', () => {
    // A page whose outline starts at h3 still numbers from 1.
    expect(
      numberToc([
        { id: 'a', label: 'A', level: 3 },
        { id: 'b', label: 'B', level: 3 },
      ]),
    ).toEqual(['1', '2'])
  })
})

describe('TocRail', () => {
  it('lists the page outline it reads out of the DOM', async () => {
    render(
      <>
        {page()}
        <TocRail label="On this page" />
      </>,
    )

    const nav = await screen.findByRole('navigation', { name: 'On this page' })
    await waitFor(() => expect(nav).toHaveTextContent('Usage'))
    expect(nav).toHaveTextContent('Examples')
    expect(nav).toHaveTextContent('Related')
  })

  it('ignores headings inside a preview, which belong to the thing being shown', async () => {
    render(
      <>
        {page()}
        <TocRail label="On this page" />
      </>,
    )

    const nav = await screen.findByRole('navigation', { name: 'On this page' })
    await waitFor(() => expect(nav).toHaveTextContent('Usage'))
    expect(nav).not.toHaveTextContent('A heading being demonstrated')
  })

  it('numbers the outline, and stops when asked not to', async () => {
    const { rerender } = render(
      <>
        {page()}
        <TocRail label="On this page" />
      </>,
    )

    const nav = await screen.findByRole('navigation', { name: 'On this page' })
    await waitFor(() => expect(nav).toHaveTextContent('1Usage'))

    rerender(
      <>
        {page()}
        <TocRail label="On this page" numbered={false} />
      </>,
    )
    await waitFor(() => expect(nav).not.toHaveTextContent('1Usage'))
    expect(nav).toHaveTextContent('Usage')
  })

  it('shows sub-entries for every section when folding is turned off', async () => {
    render(
      <>
        {page()}
        <TocRail label="On this page" collapsible={false} />
      </>,
    )

    const nav = await screen.findByRole('navigation', { name: 'On this page' })
    await waitFor(() => expect(nav).toHaveTextContent('Default'))
  })

  it('renders nothing for a page with no headings', () => {
    render(
      <>
        <div id="content" />
        <TocRail label="On this page" />
      </>,
    )
    expect(screen.queryByRole('navigation', { name: 'On this page' })).toBeNull()
  })
})
