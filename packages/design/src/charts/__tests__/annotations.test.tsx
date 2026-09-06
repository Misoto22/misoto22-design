import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ANNOTATION_LAYER, BarChart, BarList, BigNumber, formatNumber } from '../index'
import type { ChartConfig } from '../index'

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

const data = [
  { month: 'Jan', desktop: 186 },
  { month: 'Feb', desktop: 305 },
  { month: 'Mar', desktop: 237 },
]

describe('the annotation layer', () => {
  it('stacks bands behind the grid and text above the marks', () => {
    // The order editorial charting settled on, checked as numbers rather than
    // trusted as a comment: a band drawn over its own gridlines reads as a
    // second surface, and a reference line hidden behind a bar cannot be
    // checked against anything.
    expect(ANNOTATION_LAYER.plate).toBeLessThan(ANNOTATION_LAYER.band)
    // Recharts draws the grid at -100 and bars at 300.
    expect(ANNOTATION_LAYER.band).toBeLessThan(-100)
    expect(ANNOTATION_LAYER.line).toBeGreaterThan(300)
    expect(ANNOTATION_LAYER.text).toBeGreaterThan(ANNOTATION_LAYER.line)
  })

  it('draws a reference line with its label', () => {
    const { container } = render(
      <BarChart title="Visitors" config={config} data={data}>
        <BarChart.Bar dataKey="desktop" />
        <BarChart.ReferenceLine y={250} label="Target" />
      </BarChart>,
    )

    expect(container.querySelector('.recharts-reference-line')).toBeInTheDocument()
    expect(within(container).getByText('Target')).toBeInTheDocument()
  })

  it('draws a band across a span of the category axis', () => {
    const { container } = render(
      <BarChart title="Visitors" config={config} data={data}>
        <BarChart.Bar dataKey="desktop" />
        <BarChart.ReferenceBand x={['Feb', 'Mar']} label="Migration" />
      </BarChart>,
    )

    expect(container.querySelector('.recharts-reference-area')).toBeInTheDocument()
    expect(within(container).getByText('Migration')).toBeInTheDocument()
  })
})

describe('value labels', () => {
  it('labels only the last point by default', () => {
    const { container } = render(
      <BarChart title="Visitors" config={config} data={data}>
        <BarChart.Bar dataKey="desktop">
          <BarChart.Values />
        </BarChart.Bar>
      </BarChart>,
    )

    // A number on every point is the most common way a chart is spoiled, so
    // the default prints one — the value the reader would otherwise trace back
    // to the axis for.
    const labels = [...container.querySelectorAll('text')].map((node) => node.textContent)
    expect(labels).toContain('237')
    expect(labels).not.toContain('186')
  })

  it('labels every point when asked', () => {
    const { container } = render(
      <BarChart title="Visitors" config={config} data={data}>
        <BarChart.Bar dataKey="desktop">
          <BarChart.Values show="all" />
        </BarChart.Bar>
      </BarChart>,
    )

    const labels = [...container.querySelectorAll('text')].map((node) => node.textContent)
    expect(labels).toEqual(expect.arrayContaining(['186', '305', '237']))
  })

  it('labels the extremes, which is what "which was worst" asks for', () => {
    const { container } = render(
      <BarChart title="Visitors" config={config} data={data}>
        <BarChart.Bar dataKey="desktop">
          <BarChart.Values show="extremes" />
        </BarChart.Bar>
      </BarChart>,
    )

    const labels = [...container.querySelectorAll('text')].map((node) => node.textContent)
    expect(labels).toEqual(expect.arrayContaining(['186', '305']))
    expect(labels).not.toContain('237')
  })
})

describe('the empty state', () => {
  it('says what happened instead of drawing empty axes', () => {
    render(
      <BarChart title="Visitors" config={config} data={[]}>
        <BarChart.Bar dataKey="desktop" />
      </BarChart>,
    )

    // An empty pair of axes is indistinguishable from a chart that failed to
    // load, which is how a reader ends up reloading a page that was fine.
    expect(screen.getByText('No data in this range')).toBeInTheDocument()
  })

  it('keeps the figure named, so the page still says what is missing', () => {
    render(
      <BarChart title="Visitors by month" config={config} data={[]}>
        <BarChart.Bar dataKey="desktop" />
      </BarChart>,
    )

    expect(screen.getByRole('figure', { name: 'Visitors by month' })).toBeInTheDocument()
  })

  it('keeps the axes when the emptiness is itself the reading', () => {
    render(
      <BarChart title="Visitors" config={config} data={[]} empty={false}>
        <BarChart.Bar dataKey="desktop" />
      </BarChart>,
    )

    expect(screen.queryByText('No data in this range')).not.toBeInTheDocument()
  })
})

describe('number formatting', () => {
  it('compacts a number an axis would otherwise be too narrow for', () => {
    expect(formatNumber({ style: 'compact', locale: 'en-US' })(1_200_000)).toBe('1.2M')
  })

  it('writes a duration as a span rather than a count of seconds', () => {
    expect(formatNumber({ style: 'duration' })(4_320)).toBe('1h 12m')
    expect(formatNumber({ style: 'duration' })(45)).toBe('45s')
  })

  it('steps bytes by 1024, because a byte count is not decimal', () => {
    expect(formatNumber({ style: 'bytes', locale: 'en-US' })(2048)).toBe('2 kB')
  })

  it('appends a unit without one for currency, which carries its own', () => {
    expect(formatNumber({ style: 'plain', locale: 'en-US', unit: 'ms' })(120)).toBe('120 ms')
  })
})

describe('BigNumber', () => {
  it('never guesses whether a change is good news', () => {
    render(
      <BigNumber
        label="Error rate"
        value="2.4%"
        delta={{ value: 0.12, label: 'vs last week', intent: 'down-is-good' }}
      />,
    )

    // Up on an error rate is bad, and a component that inferred direction from
    // the sign would have coloured this green.
    expect(screen.getByText(/up, worse/)).toBeInTheDocument()
  })

  it('carries the direction in the arrow and the words, not only the tone', () => {
    render(
      <BigNumber label="Revenue" value="$48,210" delta={{ value: 0.124, intent: 'up-is-good' }} />,
    )

    expect(screen.getByText('+12.4%')).toBeInTheDocument()
    expect(screen.getByText(/up, better/)).toBeInTheDocument()
  })
})

describe('BarList', () => {
  const items = [
    { name: 'google.com', value: 4210 },
    { name: 'github.com', value: 1880 },
    { name: 'news.ycombinator.com', value: 940 },
    { name: 'reddit.com', value: 320 },
  ]

  it('is a table, so the rows are rows', () => {
    render(<BarList label="Top referrers" items={items} />)

    expect(screen.getByRole('table', { name: 'Top referrers' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'google.com' })).toBeInTheDocument()
  })

  it('sums the tail rather than dropping it', () => {
    render(<BarList label="Top referrers" items={items} limit={2} />)

    // A "top two" that silently discards the rest misstates the whole, and the
    // reader has no way to tell.
    expect(screen.getByRole('rowheader', { name: 'Other' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1,260' })).toBeInTheDocument()
  })
})
