import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('opens the page at level one, and only where there is something to say', () => {
    render(<PageHeader eyebrow="04" title="Money" description="Balances and flows." />)

    // Queried the way a screen reader builds its heading list — the outline,
    // not the class list.
    expect(screen.getByRole('heading', { level: 1, name: 'Money' })).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
    expect(screen.getByText('Balances and flows.')).toBeInTheDocument()
  })

  it('draws no empty slots', () => {
    // Every slot but the title is optional, and an omitted one renders nothing
    // rather than an empty box — a header with four empty elements in it takes
    // the same vertical space as a full one and reads as a layout bug.
    const { container } = render(<PageHeader title="Jobs" />)

    expect(container.querySelectorAll('p')).toHaveLength(0)
    expect(container.querySelectorAll('div')).toHaveLength(1)
  })

  it('keeps the controls that qualify the page inside the opening', () => {
    // Above the rule rather than below it: under the rule they become a toolbar
    // arguing with whatever strip the page starts with.
    render(<PageHeader title="Jobs" actions={<button type="button">Last 7 days</button>} />)

    expect(screen.getByRole('banner')).toContainElement(
      screen.getByRole('button', { name: 'Last 7 days' }),
    )
  })

  it('renders the element the level names', () => {
    // Queried the way a screen reader builds its heading list. The default is
    // right whenever the opening IS the document's; a preview canvas or a
    // template inside a documentation page is where it is not.
    render(<PageHeader level={2} title="Money" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Money' })).toBeInTheDocument()
  })

  it('keeps the title at --fs-heading whatever the level is', () => {
    // Two things at once. The size is not a prop, because a page opening stands
    // over a working screen and the title is the label for what follows —
    // `Heading` at level 1 defaults to `--fs-title`, which is 1.86 times larger
    // and is the step for a document whose subject IS its title. And it does
    // not follow the level either: moving an opening down the outline is a fact
    // about the document, not a request for smaller type.
    render(
      <>
        <PageHeader title="Money" />
        <PageHeader level={3} title="Flights" />
      </>,
    )

    for (const name of ['Money', 'Flights']) {
      const className = screen.getByText(name).className
      expect(className, name).toContain('var(--fs-heading)')
      expect(className, name).not.toContain('var(--fs-title)')
    }
  })
})
