import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('announces what is loading', () => {
    render(<Spinner label="Loading projects" />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading projects')
  })

  it('goes silent when label is null, for use inside a control that already speaks', () => {
    const { container } = render(<Spinner label={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws the ring in the inherited colour when tone is current', () => {
    const { container } = render(<Spinner tone="current" label={null} />)
    expect(container.querySelector('[data-m22-animated]')?.className).toContain('border-t-current')
  })
})
