import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EvidenceDurations, EvidenceMeter, EvidenceScores } from './Evidence'

describe('evidence values', () => {
  it('announces progress as indeterminate while its total is unknown', () => {
    const view = render(<EvidenceMeter label="Generating" value={null} valueText="34 tokens" detail="— tok/s" />)
    expect(screen.getByRole('progressbar', { name: 'Generating' })).not.toHaveAttribute('aria-valuenow')
    view.rerender(<EvidenceMeter label="Generating" value={100} valueText="40 tokens" detail="20 tok/s" />)
    expect(screen.getByRole('progressbar', { name: 'Generating' })).toHaveAttribute('aria-valuenow', '100')
  })

  it('preserves a measured zero score with the same accessible value', () => {
    render(<EvidenceScores items={[{ id: 'one', label: 'A source', value: 0, valueText: '0.00' }]} />)
    expect(screen.getByRole('progressbar', { name: 'A source' })).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByRole('progressbar', { name: 'A source' })).toHaveAttribute('aria-valuetext', '0.00')
  })

  it('keeps unknown durations explicit and never divides by a zero total', () => {
    const { container } = render(<EvidenceDurations label="Duration" total={0} totalText="0ms" items={[{ id: 'fetch', label: 'Fetch', value: 0, valueText: '0ms' }, { id: 'render', label: 'Render', value: null, valueText: '—' }]} />)
    expect(screen.getByLabelText('Duration')).toHaveTextContent('Render—')
    expect(container.querySelectorAll('[style*="NaN"]')).toHaveLength(0)
    expect(container.querySelectorAll('[style*="Infinity"]')).toHaveLength(0)
  })
})
