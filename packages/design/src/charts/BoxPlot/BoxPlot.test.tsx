import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BoxPlot } from './BoxPlot'

/**
 * The chart's numbers, read back out of the table view every chart also
 * renders. That table is generated from the same rows the marks are drawn
 * from, so asserting on it asserts on what was actually plotted — and it is
 * the only place the five numbers appear as text.
 */
function summaryRow(title: string, name: string): string[] {
  const table = screen.getByRole('table', { name: title })
  const row = within(table)
    .getAllByRole('row')
    .find((entry) => within(entry).queryByRole('rowheader', { name }))

  if (!row) throw new Error(`no row for ${name}`)
  return within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent ?? '')
}

function plot(children: ReactNode) {
  return (
    <BoxPlot title="Latency" data={[]}>
      {children}
    </BoxPlot>
  )
}

describe('summarising raw observations', () => {
  it('interpolates the quartiles the way R type 7 does', () => {
    render(
      <BoxPlot title="Latency" data={[{ name: 'Sydney', values: [1, 2, 3, 4] }]}>
        <BoxPlot.Boxes />
      </BoxPlot>,
    )

    // There are nine quantile definitions and they disagree: on [1, 2, 3, 4]
    // the lower quartile is 1.75 under this rule and 1.5 under the "median of
    // the lower half" rule most people were taught. Two box plots of the same
    // numbers drawn under different rules are two different pictures, so the
    // one in use is pinned here rather than left to whoever reads the source.
    expect(summaryRow('Latency', 'Sydney')).toEqual(['1', '1.75', '2.5', '3.25', '4', '0'])
  })

  it('stops the whiskers at the last observation inside Tukey’s fence', () => {
    render(
      <BoxPlot title="Latency" data={[{ name: 'Perth', values: [10, 11, 12, 13, 14, 100] }]}>
        <BoxPlot.Boxes />
      </BoxPlot>,
    )

    // q1 11.25, q3 13.75, so the upper fence is 17.5 and 100 falls outside it.
    // The whisker stops at 14 — the largest reading that really happened — and
    // not at the fence, which is a number no observation has.
    expect(summaryRow('Latency', 'Perth')).toEqual([
      '10',
      '11.25',
      '12.5',
      '13.75',
      '14',
      '1',
    ])
  })

  it('keeps a single repeated value from collapsing into nothing', () => {
    render(
      <BoxPlot title="Latency" data={[{ name: 'Flat', values: [7, 7, 7, 7] }]}>
        <BoxPlot.Boxes />
      </BoxPlot>,
    )

    // Every quartile is the same number and the box has no extent. It still
    // has to be drawn, because a category that silently disappears takes its
    // axis label with it.
    expect(summaryRow('Latency', 'Flat')).toEqual(['7', '7', '7', '7', '7', '0'])
  })
})

describe('summaries handed over ready-made', () => {
  it('draws them as given, without re-deriving anything', () => {
    render(
      <BoxPlot
        title="Latency"
        data={[
          {
            name: 'Warehouse',
            min: 20,
            q1: 40,
            median: 55,
            q3: 70,
            max: 95,
            outliers: [140, 180],
            count: 900,
          },
        ]}
      >
        <BoxPlot.Boxes />
      </BoxPlot>,
    )

    // A chart fed from a warehouse gets percentiles back from the query and
    // never sees a row, so the summary form has to survive the trip untouched.
    expect(summaryRow('Latency', 'Warehouse')).toEqual(['20', '40', '55', '70', '95', '2'])
  })

  it('draws one dot per outlier rather than one blot for all of them', () => {
    const { container } = render(
      <BoxPlot
        title="Latency"
        data={[{ name: 'Warehouse', min: 20, q1: 40, median: 55, q3: 70, max: 95, outliers: [140, 180, 240] }]}
      >
        <BoxPlot.Boxes showOutliers />
      </BoxPlot>,
    )

    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })

  it('leaves the outliers out when asked', () => {
    const { container } = render(
      <BoxPlot
        title="Latency"
        data={[{ name: 'Warehouse', min: 20, q1: 40, median: 55, q3: 70, max: 95, outliers: [140] }]}
      >
        <BoxPlot.Boxes showOutliers={false} />
      </BoxPlot>,
    )

    expect(container.querySelectorAll('circle')).toHaveLength(0)
  })
})

describe('the notch', () => {
  const summary = { name: 'Warehouse', min: 20, q1: 40, median: 55, q3: 70, max: 95 }

  it('pinches the box at the median when the sample size is known', () => {
    const { container } = render(
      <BoxPlot title="Latency" data={[{ ...summary, count: 900 }]}>
        <BoxPlot.Boxes notch />
      </BoxPlot>,
    )

    expect(container.querySelectorAll('polygon')).toHaveLength(1)
  })

  it('draws a square box when there is no count to compute one from', () => {
    const { container } = render(
      <BoxPlot title="Latency" data={[summary]}>
        <BoxPlot.Boxes notch />
      </BoxPlot>,
    )

    // The notch is `1.58 × IQR / √n`, so without n there is no interval to
    // draw. Silently drawing one anyway would be a confidence claim made up
    // out of nothing.
    expect(container.querySelectorAll('polygon')).toHaveLength(0)
  })

  it('leaves the box square unless it is asked for one', () => {
    const { container } = render(
      <BoxPlot title="Latency" data={[{ ...summary, count: 900 }]}>
        <BoxPlot.Boxes />
      </BoxPlot>,
    )

    expect(container.querySelectorAll('polygon')).toHaveLength(0)
  })
})

describe('the empty state', () => {
  it('says what happened instead of drawing empty axes', () => {
    render(plot(<BoxPlot.Boxes />))

    expect(screen.getByText('No data in this range')).toBeInTheDocument()
  })

  it('keeps the figure named, so the page still says what is missing', () => {
    render(plot(<BoxPlot.Boxes />))

    expect(screen.getByRole('figure', { name: 'Latency' })).toBeInTheDocument()
  })
})
