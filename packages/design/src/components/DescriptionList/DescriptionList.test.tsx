import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DescriptionList } from './DescriptionList'

const ITEMS = [
  { term: 'Owner', description: 'Henry Chen' },
  { term: 'Region', description: 'ap-southeast-2' },
]

describe('DescriptionList', () => {
  it('renders a real dl, dt and dd rather than a grid of divs', () => {
    // The markup IS the feature. A grid of divs looks identical and tells a
    // screen reader nothing about which value belongs to which label.
    const { container } = render(<DescriptionList items={ITEMS} />)

    const list = container.querySelector('dl')
    expect(list).not.toBeNull()
    expect(screen.getByText('Owner').tagName).toBe('DT')
    expect(screen.getByText('Henry Chen').tagName).toBe('DD')
    expect(list?.querySelectorAll('dt')).toHaveLength(2)
    expect(list?.querySelectorAll('dd')).toHaveLength(2)
  })

  it('keeps each pair together, so the hairline crosses the whole row', () => {
    const { container } = render(<DescriptionList items={ITEMS} />)
    const pair = screen.getByText('Owner').parentElement

    expect(pair?.tagName).toBe('DIV')
    expect(pair?.parentElement).toBe(container.querySelector('dl'))
    expect(pair?.querySelector('dd')?.textContent).toBe('Henry Chen')
  })

  it('renders nothing at all when the list is empty', () => {
    // Not an empty bordered box: a hairline around no content reads as a
    // component that failed to load.
    const { container } = render(<DescriptionList items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('drops the hairline when asked, and drops it from the last pair always', () => {
    const { container, rerender } = render(<DescriptionList items={ITEMS} />)
    const divided = screen.getByText('Owner').parentElement
    expect(divided?.className).toContain('border-b')
    expect(divided?.className).toContain('last:border-b-0')

    rerender(<DescriptionList items={ITEMS} divided={false} />)
    expect(screen.getByText('Owner').parentElement?.className).not.toContain('border-b')
    expect(container.querySelector('dl')?.className).toContain('flex-col')
  })

  it('renders a value that is an element, not only a string', () => {
    render(
      <DescriptionList
        items={[{ term: 'Docs', description: <a href="#x">Read the changelog</a> }]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Read the changelog' })).toBeInTheDocument()
  })
})
