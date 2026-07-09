import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders a <button> with type=button by default', () => {
    render(<Button>Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('renders a native <a> when given href', () => {
    render(<Button href="/next">Go</Button>)
    const link = screen.getByRole('link', { name: /Go/ })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/next')
  })

  it('renders the keycap glyph after the label', () => {
    render(<Button keycap="S">Save</Button>)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('forwards arbitrary attributes to the element', () => {
    render(<Button data-testid="cta">Save</Button>)
    expect(screen.getByTestId('cta')).toBeInTheDocument()
  })
})
