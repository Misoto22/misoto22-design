import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPill } from './StatusPill'

/**
 * The pill's tone lives entirely on a dot that is `aria-hidden` by law, so
 * before this the tone was a fact only a sighted reader could hold. These
 * assert the two severities a reader must not miss reach the text, and that
 * the two that carry no alarm add nothing to it.
 */
describe('StatusPill', () => {
  it('reads differently in a warning pill than in a neutral one', () => {
    // The defect, stated as a test: the same word in two tones was the same
    // sentence to anyone who could not see the colour.
    const { container: warning } = render(<StatusPill tone="warning">Degraded</StatusPill>)
    const { container: neutral } = render(<StatusPill tone="neutral">Degraded</StatusPill>)
    expect(warning.textContent).not.toBe(neutral.textContent)
  })

  it('names a danger tone as an error rather than as a colour', () => {
    const { container } = render(<StatusPill tone="danger">Payments</StatusPill>)
    expect(container.textContent).toContain('Error')
  })

  it('keeps the severity word out of the printed pill', () => {
    // The pill is 11px uppercase mono sized for one short line. The severity
    // belongs in the accessible name, not in the box.
    render(<StatusPill tone="warning">Degraded</StatusPill>)
    expect(screen.getByText('Warning')).toHaveClass('sr-only')
  })

  it('adds nothing to a tone that carries no alarm', () => {
    // success is the default. A reader who is told "OK" before every settled
    // pill learns nothing they had not already assumed.
    const { container } = render(<StatusPill>Available for work</StatusPill>)
    expect(container.textContent).toBe('Available for work')
  })

  it('leaves a neutral pill as its words and nothing else', () => {
    const { container } = render(<StatusPill tone="neutral">Archived</StatusPill>)
    expect(container.textContent).toBe('Archived')
  })
})
