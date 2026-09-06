import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('renders a paragraph by default', () => {
    render(<Text>Twelve releases, none rolled back.</Text>)
    expect(screen.getByText('Twelve releases, none rolled back.').tagName).toBe('P')
  })

  it('changes the element without changing the look', () => {
    // The whole reason `as` exists: a run inside a sentence has to stop being a
    // <p> — nesting one inside another is not nesting, the parser splits it —
    // while keeping the size and tone it was given.
    const { rerender } = render(
      <Text size="sm" tone="muted">
        Updated just now
      </Text>,
    )
    const paragraph = screen.getByText('Updated just now')
    const look = paragraph.className

    rerender(
      <Text as="span" size="sm" tone="muted">
        Updated just now
      </Text>,
    )
    const span = screen.getByText('Updated just now')
    expect(span.tagName).toBe('SPAN')
    expect(span.className).toBe(look)
  })

  it('lets a caller override the tone through className', () => {
    render(<Text className="text-(--ink)">Standfirst</Text>)
    // tailwind-merge has to drop the default tone rather than emit both and let
    // stylesheet order decide.
    expect(screen.getByText('Standfirst').className).not.toContain('text-(--ink-2)')
  })

  it('renders nothing visible when given no children', () => {
    const { container } = render(<Text data-testid="empty" />)
    expect(container.firstElementChild?.textContent).toBe('')
  })
})
