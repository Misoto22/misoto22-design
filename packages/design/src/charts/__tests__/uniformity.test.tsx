import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart, ScatterChart, type ChartConfig } from '../index'
import { CHART_SURFACE } from './surface'

/**
 * The gates for the gaps that were not any one author's mistake.
 *
 * Three of the four defects this file covers were "chart N forgot what charts
 * 1 to N-1 do" — an empty state, a keyboard cursor over the plot, a way for the
 * call site to drive the selection. Nothing in a review catches that reliably,
 * because the missing thing is missing: there is no wrong line to point at. A
 * gate that walks EVERY chart is the only version of the fix that holds, so
 * these iterate the shared surface rather than naming charts one at a time.
 */

/** Charts drawn into a Recharts root that supports its keyboard layer. */
const KEYBOARD_LAYER_EXEMPT = new Set([
  // Not Recharts at all: HTML tables, an inline SVG, a stack of divs.
  'Heatmap',
  'Sparkline',
  'BarList',
  'BigNumber',
  'BulletChart',
  'Facet',
  // Recharts 3.8 has no `accessibilityLayer` on `Sankey` or `Treemap` — they
  // are not Cartesian and there is no cursor to move along an axis. Both carry
  // a required hidden table, which is the reading; neither has the keyboard
  // navigation the other seventeen get for free. Giving them one means writing
  // it, not passing a prop.
  'SankeyChart',
  'TreemapChart',
])

describe.each(CHART_SURFACE)('$dir with nothing to draw', (entry) => {
  it('says there is no data instead of drawing a blank box', () => {
    render(entry.renderEmpty())

    // "No data in this range" from `ChartEmpty`, "not enough data" from a
    // sparkline too short to have a shape, "No data" from a big number with
    // none. Any of the three tells the reader this is not a failed load.
    expect(screen.getByText(/no data|not enough data/i)).toBeInTheDocument()
  })
})

describe.each(CHART_SURFACE.filter((entry) => !KEYBOARD_LAYER_EXEMPT.has(entry.dir)))(
  '$dir',
  (entry) => {
    it('gives the plot a keyboard cursor', () => {
      const { container } = render(entry.render())
      const surface = container.querySelector('svg.recharts-surface')

      expect(surface).not.toBeNull()
      expect(surface).toHaveAttribute('tabindex', '0')
    })
  },
)

const series = { desktop: { label: 'Desktop' }, mobile: { label: 'Mobile' } } satisfies ChartConfig

const rows = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
]

describe('a chart selection', () => {
  it('follows a value the call site drives', () => {
    const { rerender } = render(
      <BarChart
        title="Visitors by month"
        config={series}
        data={rows}
        xDataKey="month"
        selectedDataKey={null}
      >
        <BarChart.Legend isClickable />
        <BarChart.Bar dataKey="desktop" isClickable />
        <BarChart.Bar dataKey="mobile" isClickable />
      </BarChart>,
    )

    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    rerender(
      <BarChart
        title="Visitors by month"
        config={series}
        data={rows}
        xDataKey="month"
        selectedDataKey="desktop"
      >
        <BarChart.Legend isClickable />
        <BarChart.Bar dataKey="desktop" isClickable />
        <BarChart.Bar dataKey="mobile" isClickable />
      </BarChart>,
    )

    // `defaultSelectedDataKey` seeds `useState` once, so passing a new one does
    // nothing. Without the controlled half, a call site could not drive the
    // selection from a filter, a route or a sibling chart at all.
    expect(screen.getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('a scatter chart', () => {
  it('still draws a plot when no table was declared', () => {
    const { container } = render(
      <ScatterChart title="Load time against bundle size" config={{ desktop: { label: 'Desktop' } }}>
        <ScatterChart.XAxis dataKey="kb" />
        <ScatterChart.YAxis dataKey="ms" />
        <ScatterChart.Scatter dataKey="desktop" data={[{ kb: 120, ms: 340 }]} />
      </ScatterChart>,
    )

    // An undeclared table is not an empty one — the observations are on the
    // `<Scatter>`, where the root cannot see them.
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
    expect(screen.queryByText(/no data/i)).toBeNull()
  })

  it('can say it is still loading', () => {
    render(
      <ScatterChart
        title="Load time against bundle size"
        config={{ desktop: { label: 'Desktop' } }}
        isLoading
        table={{ rows: [], rowKey: 'kb', columns: [{ key: 'ms', label: 'Load (ms)' }] }}
      >
        <ScatterChart.XAxis dataKey="kb" />
        <ScatterChart.YAxis dataKey="ms" />
      </ScatterChart>,
    )

    // `isLoading` was hard-coded `false` into the context, so every part that
    // reads it — and the badge that was never rendered — could only ever say
    // the data had landed.
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })
})
