import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AreaChart,
  BarChart,
  BigNumber,
  BulletChart,
  Heatmap,
  Histogram,
  RadialChart,
  Sparkline,
  TreemapChart,
  type ChartConfig,
} from '../index'

/**
 * The assertions that hold a chart to what its data says.
 *
 * Every case here is a picture that was readable, plausible and wrong: a closed
 * month drawn as still in progress, a small count drawn as an absent one, a
 * flat run drawn along the floor. None of them throws, none of them looks
 * broken, and none of them can be caught by rendering a chart and looking at
 * it — which is exactly why they belong in a suite rather than in a review.
 */

const series = { desktop: { label: 'Desktop' } } satisfies ChartConfig

/** The bars a chart actually paints, as opposed to its invisible hit targets. */
function paintedBars(container: HTMLElement): SVGPathElement[] {
  return [...container.querySelectorAll<SVGPathElement>('path.recharts-rectangle')].filter((path) =>
    path.getAttribute('fill')?.startsWith('url('),
  )
}

/** The painted bars drawn with a buffer hatch. */
function bufferBars(container: HTMLElement): SVGPathElement[] {
  return paintedBars(container).filter((path) => path.getAttribute('fill')?.includes('-buffer-'))
}

describe('a bar chart', () => {
  const months = Array.from({ length: 8 }, (_, index) => ({
    month: `M${index + 1}`,
    desktop: 100 + index * 10,
  }))

  it('hatches the row that is still open, not the last bar in the window', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BarChart title="Visitors by month" config={series} data={months} xDataKey="month">
        <BarChart.XAxis dataKey="month" />
        <BarChart.Bar dataKey="desktop" buffer />
        <BarChart.Brush />
      </BarChart>,
    )

    expect(bufferBars(container)).toHaveLength(1)

    const end = screen.getByRole('slider', { name: /end/i })
    end.focus()
    await user.keyboard('{ArrowLeft}{ArrowLeft}')

    // The open period is off the end of the window. Nothing on screen is a
    // period still in progress, so nothing on screen may say it is.
    expect(bufferBars(container)).toHaveLength(0)
  })

  it('paints a small count as something rather than as nothing', () => {
    const { container } = render(
      <BarChart
        title="Visitors by month"
        config={series}
        data={[
          { month: 'January', desktop: 1000 },
          { month: 'February', desktop: 2 },
          { month: 'March', desktop: 800 },
        ]}
        xDataKey="month"
      >
        <BarChart.XAxis dataKey="month" />
        <BarChart.Bar dataKey="desktop" />
      </BarChart>,
    )

    // Two visitors is not no visitors, and the full-column hit rect catches the
    // pointer either way — so an unpainted bar is a bar the reader can hover
    // and never see.
    expect(paintedBars(container)).toHaveLength(3)
  })
})

describe('a treemap', () => {
  const packages = [
    { name: 'recharts', size: 480 },
    { name: 'react-dom', size: 310 },
  ]

  it('does not describe every tile with a generated id', () => {
    const { container } = render(<TreemapChart title="Bundle size by package" data={packages} />)

    // `<desc>` IS the accessible description. A tile announced as its name plus
    // an opaque id is worse off than a tile with no description at all.
    const described = [...container.querySelectorAll('desc')].map((node) => node.textContent)
    expect(described.filter(Boolean)).toEqual([])
  })

  it('says in the table when a leaf has no area to be drawn at', () => {
    render(
      <TreemapChart
        title="Bundle size by package"
        data={[
          { name: 'recharts', size: 480 },
          { name: 'empty-shim', size: 0 },
        ]}
      />,
    )

    const table = screen.getByRole('table', { name: 'Bundle size by package' })
    const row = within(table).getByRole('row', { name: /empty-shim/ })
    expect(row).toHaveTextContent(/not drawn/i)
  })
})

describe('a radial chart', () => {
  const browsers = {
    chrome: { label: 'Chrome' },
    safari: { label: 'Safari' },
  } satisfies ChartConfig

  const rows = [
    { browser: 'chrome', visitors: 275 },
    { browser: 'safari', visitors: 200 },
  ]

  it('reports the same number from the legend that the arc reports', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    render(
      <RadialChart
        title="Visitors by browser"
        config={browsers}
        data={rows}
        nameKey="browser"
        valueKey="visitors"
        onSelectionChange={onSelectionChange}
      >
        <RadialChart.RadialBar dataKey="visitors" />
        <RadialChart.Legend isClickable />
      </RadialChart>,
    )

    await user.click(screen.getByRole('button', { name: 'Chrome' }))

    expect(onSelectionChange).toHaveBeenCalledWith({ name: 'chrome', value: 275 })
  })

  it('builds the table from the arc when no value key is given', () => {
    render(
      <RadialChart title="Visitors by browser" config={browsers} data={rows} nameKey="browser">
        <RadialChart.RadialBar dataKey="visitors" />
      </RadialChart>,
    )

    const table = screen.getByRole('table', { name: 'Visitors by browser' })
    expect(within(table).getByRole('row', { name: /chrome/ })).toHaveTextContent('275')
  })
})

describe('an area chart', () => {
  const rows = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
  ]

  it('keeps a caller tick formatter under an expanded stack', () => {
    const { container } = render(
      <AreaChart
        title="Share of visitors"
        config={{ desktop: { label: 'Desktop' }, mobile: { label: 'Mobile' } }}
        data={rows}
        stackType="expanded"
        xDataKey="month"
      >
        <AreaChart.YAxis tickFormatter={(value: number) => `${value} of 1`} />
        <AreaChart.Area dataKey="desktop" />
        <AreaChart.Area dataKey="mobile" />
      </AreaChart>,
    )

    // A formatter the axis silently drops is worse than one it refuses: the
    // call site has no way to tell the difference from a typo.
    expect(container.textContent).toContain('of 1')
  })
})

describe('a histogram', () => {
  it('counts the observations its bins do not reach', () => {
    render(
      <Histogram title="Request duration" values={[5, 15, 25, 95]} bins={[10, 30]}>
        <Histogram.Bars />
      </Histogram>,
    )

    const table = screen.getByRole('table', { name: 'Request duration' })
    expect(within(table).getByRole('row', { name: /below/i })).toHaveTextContent('1')
    expect(within(table).getByRole('row', { name: /above/i })).toHaveTextContent('1')
  })
})

describe('a big number', () => {
  it('passes no verdict on a change of zero', () => {
    render(<BigNumber label="Errors" value="1,204" delta={{ value: 0, intent: 'up-is-good' }} />)

    // The tone, the arrow and the word all read "no change". The sentence a
    // screen reader gets has to agree with them.
    expect(screen.getByText('no change')).toBeInTheDocument()
  })

  it('says so when there is no number to print', () => {
    render(<BigNumber label="Monthly revenue" value={null} />)

    expect(screen.getByText(/no data/i)).toBeInTheDocument()
  })
})

describe('a sparkline', () => {
  /** The y of every point on the drawn path. */
  function pathYs(container: HTMLElement): number[] {
    const d = container.querySelector('path')?.getAttribute('d') ?? ''
    return [...d.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map((match) => Number(match[2]))
  }

  it('draws an unchanged run through the middle, not along the floor', () => {
    const { container } = render(<Sparkline label="Error rate" data={[4, 4, 4, 4]} />)

    // In a column of sparklines, "unchanged" and "pinned at its worst" is the
    // one distinction that has to survive.
    expect(pathYs(container)).toEqual([50, 50, 50, 50])
  })
})

describe('a heatmap', () => {
  /** The share of the ramp each cell is washed with, in order. */
  function weights(container: HTMLElement): number[] {
    return [...container.querySelectorAll('td')].map((cell) => {
      const match = /var\(--series-1\) ([\d.]+)%/.exec(cell.getAttribute('style') ?? '')
      return match ? Number(match[1]) : -1
    })
  }

  it('scales to the cells it draws, not to the ones it cannot place', () => {
    const { container } = render(
      <Heatmap
        title="Commits by weekday and hour"
        rows={['Mon', 'Tue']}
        columns={['00', '06']}
        cells={[
          { row: 'Mon', column: '00', value: 1 },
          { row: 'Mon', column: '06', value: 2 },
          { row: 'Tue', column: '00', value: 3 },
          { row: 'Tue', column: '06', value: 4 },
          // A misspelled row. It is never looked up, so it is never drawn.
          { row: 'Tues', column: '00', value: 1000 },
        ]}
      />,
    )

    // The heaviest cell on the grid is the top of the ramp. A number the grid
    // never draws must not push every drawn cell into the first fraction of it.
    expect(Math.max(...weights(container))).toBe(100)
  })
})

describe('a bullet chart', () => {
  /** The inline size of one of a row's marks, as a percentage. */
  function share(container: HTMLElement, slot: string): number {
    const style = container.querySelector(`[data-slot="${slot}"]`)?.getAttribute('style') ?? ''
    return Number(/inline-size: ([\d.]+)%/.exec(style)?.[1] ?? -1)
  }

  it('marks a measure that runs past the end of its scale', () => {
    const { container } = render(
      <BulletChart title="Service levels" data={[{ name: 'Uptime', value: 140 }]} domain={[0, 100]} />,
    )

    // Clamped and silent, a value past the domain fills the track exactly as a
    // value at the domain's top does.
    expect(container.querySelector('[data-slot="bullet-overflow"]')).not.toBeNull()
  })

  it('names the bounds the caller set, including the ones off the scale', () => {
    render(
      <BulletChart
        title="Service levels"
        data={[{ name: 'Uptime', value: 40, ranges: [60, 80] }]}
        domain={[0, 50]}
      />,
    )

    const table = screen.getByRole('table', { name: 'Service levels' })
    expect(within(table).getByRole('row', { name: /uptime/i })).toHaveTextContent('60, 80')
  })

  it('puts a measure on a scale with no width in the middle of it', () => {
    const { container } = render(
      <BulletChart title="Service levels" data={[{ name: 'Uptime', value: 50 }]} domain={[50, 50]} />,
    )

    // The same answer `Heatmap` gives for a zero span, and the same one
    // `Sparkline` gives: a scale with no width cannot rank anything, so the
    // honest position on it is the middle.
    expect(share(container, 'bullet-bar')).toBe(50)
  })
})
