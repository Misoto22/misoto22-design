import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  it('interrupts for the danger tone', () => {
    render(<Alert tone="danger" title="Upload failed" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(alert).toHaveTextContent('Upload failed')
  })

  it.each(['info', 'success', 'warning'] as const)('waits for a pause on the %s tone', (tone) => {
    render(<Alert tone={tone} title="Saved" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})
