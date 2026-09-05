import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Button', href: '/components/button' },
]

describe('Breadcrumb', () => {
  it('does not link the page you are already on, even when given an href', () => {
    render(<Breadcrumb items={ITEMS} />)
    expect(screen.queryByRole('link', { name: 'Button' })).not.toBeInTheDocument()
    expect(screen.getByText('Button')).toHaveAttribute('aria-current', 'page')
  })

  it('links every earlier crumb', () => {
    render(<Breadcrumb items={ITEMS} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '/components')
  })

  it('hides the separators from assistive tech', () => {
    const { container } = render(<Breadcrumb items={ITEMS} />)
    expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(2)
  })
})
