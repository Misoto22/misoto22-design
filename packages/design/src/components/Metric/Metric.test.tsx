import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Metric } from './Metric'

describe('Metric', () => {
  it('prints the figure it is handed, and the line that qualifies it', () => {
    render(<Metric label="Rows" value="63,851" detail="newest yesterday" />)

    expect(screen.getByText('Rows')).toBeInTheDocument()
    expect(screen.getByText('63,851')).toBeInTheDocument()
    expect(screen.getByText('newest yesterday')).toBeInTheDocument()
  })

  it('draws the tone as decoration, never as the only carrier', () => {
    // The dot is `aria-hidden` by construction, so a tone reaches nobody who
    // cannot see it. What this asserts is that the tone never becomes the only
    // carrier by accident: the component draws the dot and nothing else, and
    // the words beside it are the caller's job.
    const { container } = render(
      <Metric label="Sync" value="0" detail="failing since Tuesday" tone="danger" />,
    )

    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
    expect(screen.getByText('failing since Tuesday')).toBeInTheDocument()
  })

  it('holds a sparkline or a caveat under the figure', () => {
    render(<Metric label="Plays" value="12" aside={<p>over three weeks</p>} />)

    expect(screen.getByText('over three weeks')).toBeInTheDocument()
  })

  it('keeps the figures tabular, so a column of tiles compares', () => {
    // Not a class-list assertion for its own sake: proportional digits put the
    // same magnitude at two different widths, and four tiles in a row are read
    // down the column as much as along it.
    render(<Metric label="Rows" value="63,851" />)

    expect(screen.getByText('63,851').className).toContain('tabular-nums')
  })

  it('becomes the element it is handed, with the whole tile inside it', () => {
    // The failure this guards is specific: a bare Slot gives the child the
    // props and leaves it holding its own content, so `<a href="…" />` renders
    // a correctly-styled empty box and nothing says so.
    render(
      <Metric asChild label="Jobs" value="12" detail="3 waiting">
        <a href="#/jobs" />
      </Metric>,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#/jobs')
    expect(link).toContainElement(screen.getByText('12'))
    expect(link).toContainElement(screen.getByText('3 waiting'))
    // And the article is gone: the tile IS the link, rather than sitting inside
    // one or wrapping one.
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })
})
