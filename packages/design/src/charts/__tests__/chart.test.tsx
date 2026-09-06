import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AreaChart, BarChart, type ChartConfig } from '../index'

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

const data = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
]

/** The paint rules a chart writes for itself, as text. */
function paintRules(container: HTMLElement): string {
  return [...container.querySelectorAll('style')].map((style) => style.textContent ?? '').join('\n')
}

describe('the figure', () => {
  it('names the chart for a screen reader without printing it', () => {
    render(
      <AreaChart title="Visitors per month" config={config} data={data} xDataKey="month">
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    // The caption is the figure's accessible name whether or not it is visible.
    expect(screen.getByRole('figure', { name: 'Visitors per month' })).toBeInTheDocument()
  })

  it('prints the title when asked', () => {
    render(
      <AreaChart title="Visitors per month" showTitle config={config} data={data}>
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    // Twice on the page by design: printed above the plot, and again as the
    // hidden table's caption.
    const [heading] = screen.getAllByText('Visitors per month')
    expect(heading).toBeVisible()
  })

  it('exposes the data as a table, so the numbers are reachable', () => {
    render(
      <AreaChart title="Visitors per month" config={config} data={data} xDataKey="month">
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    // A plot is a picture. Everything asserted here is what a reader who cannot
    // see it gets instead — and it is generated from the same rows the marks
    // are drawn from, so the two cannot drift apart.
    expect(screen.getByRole('table', { name: 'Visitors per month' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Desktop' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'February' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '305' })).toBeInTheDocument()
  })

  it('omits the table when the page prints the data itself', () => {
    render(
      <AreaChart title="Visitors" config={config} data={data} hideDataTable>
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

describe('the series ramp', () => {
  it('assigns a slot per series, in declaration order', () => {
    const { container } = render(
      <AreaChart title="Visitors" config={config} data={data}>
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    const rules = paintRules(container)
    expect(rules).toContain('--color-desktop-0: var(--series-1);')
    expect(rules).toContain('--color-mobile-0: var(--series-2);')
  })

  it('keeps a series on its own slot regardless of what else is on screen', () => {
    // Colour follows the entity, never its rank: hiding a series must not
    // repaint the survivors.
    const { container } = render(
      <AreaChart title="Visitors" config={config} data={data}>
        <AreaChart.Area dataKey="mobile" />
      </AreaChart>,
    )

    expect(paintRules(container)).toContain('--color-mobile-0: var(--series-2);')
  })

  it('lets a series carry its own colours, per theme', () => {
    const { container } = render(
      <AreaChart
        title="Visitors"
        config={{ desktop: { label: 'Desktop', colors: { light: ['#2a78d6', '#1baf7a'] } } }}
        data={data}
      >
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    const rules = paintRules(container)
    expect(rules).toContain('--color-desktop-0: #2a78d6;')
    expect(rules).toContain('--color-desktop-1: #1baf7a;')
  })

  it('refuses a colour that would escape the declaration it is written into', () => {
    // `ChartStyle` writes consumer values into a <style> element, which makes
    // the config a system boundary: without the check this is a stylesheet, not
    // a colour.
    const { container } = render(
      <AreaChart
        title="Visitors"
        config={{ desktop: { label: 'Desktop', colors: { light: ['red; } html { display: none } .x {'] } } }}
        data={data}
      >
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    const rules = paintRules(container)
    expect(rules).not.toContain('display: none')
    // Rejected at the boundary, and the series falls back to its ramp slot
    // rather than to no colour at all.
    expect(rules).toContain('--color-desktop-0: var(--series-1);')
  })
})

describe('the legend', () => {
  it('names every series, so identity is never carried by colour alone', () => {
    render(
      <AreaChart title="Visitors" config={config} data={data}>
        <AreaChart.Legend />
        <AreaChart.Area dataKey="desktop" />
        <AreaChart.Area dataKey="mobile" />
      </AreaChart>,
    )

    const legend = screen.getByRole('list')
    expect(within(legend).getByText('Desktop')).toBeInTheDocument()
    expect(within(legend).getByText('Mobile')).toBeInTheDocument()
  })

  it('is a control a keyboard can reach when it filters', async () => {
    // The shape this was ported from used a <div> with an onClick, which a
    // keyboard cannot reach and a screen reader does not announce as pressable.
    const onSelectionChange = vi.fn()
    const user = userEvent.setup()

    render(
      <BarChart title="Visitors" config={config} data={data} onSelectionChange={onSelectionChange}>
        <BarChart.Legend isClickable />
        <BarChart.Bar dataKey="desktop" />
        <BarChart.Bar dataKey="mobile" />
      </BarChart>,
    )

    const desktop = screen.getByRole('button', { name: 'Desktop' })
    expect(desktop).toHaveAttribute('aria-pressed', 'false')

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onSelectionChange).toHaveBeenCalledWith('desktop')
    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('clears the selection when the pressed entry is pressed again', async () => {
    const onSelectionChange = vi.fn()
    const user = userEvent.setup()

    render(
      <BarChart title="Visitors" config={config} data={data} onSelectionChange={onSelectionChange}>
        <BarChart.Legend isClickable />
        <BarChart.Bar dataKey="desktop" />
      </BarChart>,
    )

    await user.click(screen.getByRole('button', { name: 'Desktop' }))
    await user.click(screen.getByRole('button', { name: 'Desktop' }))

    expect(onSelectionChange).toHaveBeenLastCalledWith(null)
  })

  it('is not a control when it only labels', () => {
    render(
      <AreaChart title="Visitors" config={config} data={data}>
        <AreaChart.Legend />
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>,
    )

    expect(screen.queryByRole('button', { name: 'Desktop' })).not.toBeInTheDocument()
  })
})
