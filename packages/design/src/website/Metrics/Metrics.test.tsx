import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LiveCount, MetricsEmptyState, MetricsRange } from './Metrics'

describe('metric controls', () => {
  it('retains the loaded selection until the host confirms a new range', async () => {
    const user = userEvent.setup()
    const change = vi.fn()
    render(<MetricsRange label="Range" value="30" options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }]} onChange={change} />)
    await user.click(screen.getByRole('radio', { name: '7 days' }))
    expect(change).toHaveBeenCalledWith('7')
    expect(screen.getByRole('radio', { name: '30 days' })).toHaveAttribute('aria-checked', 'true')
  })

  it('does not turn an unknown live count into zero', () => {
    const view = render(<LiveCount value={null} label="reading now" />)
    expect(screen.queryByText(/reading now/)).not.toBeInTheDocument()
    view.rerender(<LiveCount value={0} label="reading now" />)
    expect(screen.getByText('0 reading now')).toBeInTheDocument()
  })

  it('gives an empty chart a useful, semantic placeholder', () => {
    render(<MetricsEmptyState title="The first reading will appear here" description="Visits fill the chart." />)
    expect(screen.getByRole('status')).toHaveTextContent('The first reading will appear here')
    expect(screen.getByText('Visits fill the chart.')).toBeInTheDocument()
  })
})
