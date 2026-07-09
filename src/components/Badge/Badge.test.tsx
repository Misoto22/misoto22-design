import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('forwards arbitrary attributes to the root element', () => {
    render(
      <Badge data-testid="badge" title="tooltip">
        New
      </Badge>,
    )
    const el = screen.getByTestId('badge')
    expect(el).toHaveTextContent('New')
    expect(el).toHaveAttribute('title', 'tooltip')
  })

  it('merges a caller className with the base classes', () => {
    render(<Badge className="custom-x">New</Badge>)
    expect(screen.getByText('New')).toHaveClass('custom-x')
  })
})
