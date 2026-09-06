import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AreaChart, type ChartConfig } from '../index'

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

const data = Array.from({ length: 12 }, (_, index) => ({
  month: `M${index + 1}`,
  desktop: 100 + index * 10,
}))

function renderWithBrush() {
  return render(
    <AreaChart title="Visitors per month" config={config} data={data} xDataKey="month">
      <AreaChart.XAxis dataKey="month" />
      <AreaChart.Area dataKey="desktop" />
      <AreaChart.Brush />
    </AreaChart>,
  )
}

/**
 * The brush was pointer-only in the shape this was ported from — a range a
 * keyboard user could watch move and never move themselves. These assertions
 * are the contract that fixed it, so it cannot regress into a styled `<div>`
 * again without the suite saying so.
 */
describe('the brush', () => {
  it('exposes both ends as range controls', () => {
    renderWithBrush()

    const start = screen.getByRole('slider', { name: /start/i })
    const end = screen.getByRole('slider', { name: /end/i })

    expect(start).toHaveAttribute('aria-valuenow', '0')
    expect(end).toHaveAttribute('aria-valuenow', String(data.length - 1))
    expect(start).toHaveAttribute('aria-valuemax', String(data.length - 1))
  })

  it('reads out the row it sits on, not the index it sits at', () => {
    renderWithBrush()

    // An index is not what the reader is choosing between.
    expect(screen.getByRole('slider', { name: /start/i })).toHaveAttribute('aria-valuetext', 'M1')
    expect(screen.getByRole('slider', { name: /end/i })).toHaveAttribute('aria-valuetext', 'M12')
  })

  it('moves an end with the arrow keys', async () => {
    const user = userEvent.setup()
    renderWithBrush()

    const start = screen.getByRole('slider', { name: /start/i })
    start.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')

    expect(screen.getByRole('slider', { name: /start/i })).toHaveAttribute('aria-valuenow', '2')
    expect(screen.getByRole('slider', { name: /start/i })).toHaveAttribute('aria-valuetext', 'M3')
  })

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup()
    renderWithBrush()

    const end = screen.getByRole('slider', { name: /end/i })
    end.focus()
    await user.keyboard('{Home}')

    // Clamped by the minimum span rather than collapsing onto the start handle.
    expect(Number(screen.getByRole('slider', { name: /end/i }).getAttribute('aria-valuenow'))).toBe(
      2,
    )
  })

  it('never lets the two ends cross', async () => {
    const user = userEvent.setup()
    renderWithBrush()

    const start = screen.getByRole('slider', { name: /start/i })
    start.focus()
    await user.keyboard('{End}')

    const startNow = Number(
      screen.getByRole('slider', { name: /start/i }).getAttribute('aria-valuenow'),
    )
    const endNow = Number(screen.getByRole('slider', { name: /end/i }).getAttribute('aria-valuenow'))
    expect(endNow - startNow).toBeGreaterThanOrEqual(2)
  })
})
