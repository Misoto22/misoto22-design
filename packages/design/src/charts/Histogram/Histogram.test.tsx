import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Histogram } from './Histogram'

/**
 * The buckets, read back out of the table view the chart also renders — the
 * one place the binning appears as text, and generated from the same rows the
 * bars are drawn from.
 */
function buckets(title: string): { label: string; cells: string[] }[] {
  const table = screen.getByRole('table', { name: title })
  return within(table)
    .getAllByRole('row')
    .filter((row) => within(row).queryAllByRole('rowheader').length > 0)
    .map((row) => ({
      label: within(row).getAllByRole('rowheader')[0]?.textContent ?? '',
      cells: within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent ?? ''),
    }))
}

describe('binning raw observations', () => {
  it('cuts equal-width buckets and counts the top edge into the last one', () => {
    render(
      <Histogram title="Scores" values={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} bins={2}>
        <Histogram.Bars />
      </Histogram>,
    )

    // Buckets are half-open — [0, 5) then [5, 10] — so 5 lands in the upper
    // one and 10, the largest reading there is, stays in the histogram at all.
    // A strictly half-open last bucket drops the maximum, which is exactly the
    // observation a reader came looking for.
    expect(buckets('Scores')).toEqual([
      { label: '0 – 5', cells: ['5'] },
      { label: '5 – 10', cells: ['6'] },
    ])
  })

  it('takes explicit edges, uneven ones included', () => {
    render(
      <Histogram title="Scores" values={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} bins={[0, 2, 10]}>
        <Histogram.Bars />
      </Histogram>,
    )

    expect(buckets('Scores')).toEqual([
      { label: '0 – 2', cells: ['2'] },
      { label: '2 – 10', cells: ['9'] },
    ])
  })

  it('falls back to Sturges when the interquartile range is zero', () => {
    // Freedman–Diaconis divides by the IQR, and a distribution with most of
    // its mass on one value has an IQR of zero — which asks for infinitely
    // many bins rather than for a sensible picture.
    const values = [0, ...Array.from({ length: 20 }, () => 5), 10]

    render(
      <Histogram title="Scores" values={values}>
        <Histogram.Bars />
      </Histogram>,
    )

    // ⌈log₂ 22⌉ + 1 = 6.
    expect(buckets('Scores')).toHaveLength(6)
  })

  it('draws one bucket for a sample that is all the same number', () => {
    render(
      <Histogram title="Scores" values={[3, 3, 3]}>
        <Histogram.Bars />
      </Histogram>,
    )

    // A zero-width bin is a zero-width bar, which is nothing. One bucket
    // centred on the only value there is says what happened instead.
    expect(buckets('Scores')).toEqual([{ label: '2.5 – 3.5', cells: ['3'] }])
  })
})

describe('density', () => {
  it('divides by the sample size and the bucket width, so uneven buckets stop lying', () => {
    render(
      <Histogram
        title="Payload"
        data={[
          { from: 0, to: 1, count: 10 },
          { from: 1, to: 3, count: 10 },
        ]}
        mode="density"
      >
        <Histogram.Bars />
      </Histogram>,
    )

    // Same count in both buckets, and under `frequency` they would draw as two
    // equal bars — with the second one twice as wide, which reads as twice the
    // mass. Density is count / (n × width): 0.5 against 0.25, which is the
    // rate the data actually has.
    expect(buckets('Payload')).toEqual([
      { label: '0 – 1', cells: ['10', '0.5'] },
      { label: '1 – 3', cells: ['10', '0.25'] },
    ])
  })

  it('draws a bucket as wide as the range it counts', () => {
    const { container } = render(
      <Histogram
        title="Payload"
        data={[
          { from: 0, to: 1, count: 10 },
          { from: 1, to: 3, count: 10 },
        ]}
      >
        <Histogram.Bars />
      </Histogram>,
    )

    // The reason the bars are a custom shape at all. Recharts positions a bar
    // on a numeric axis by centring it on the value and sizing it from the
    // band, which would draw both of these the same width — and a bucket drawn
    // narrower than the range it covers is a histogram that misstates where
    // the mass is.
    const [first, second] = [...container.querySelectorAll('.recharts-bar-rectangle rect')].map(
      (rect) => Number(rect.getAttribute('width')),
    )
    expect(second! / first!).toBeCloseTo(2, 1)
  })

  it('counts rather than rates when asked for frequency', () => {
    render(
      <Histogram
        title="Payload"
        data={[
          { from: 0, to: 1, count: 10 },
          { from: 1, to: 3, count: 10 },
        ]}
      >
        <Histogram.Bars />
      </Histogram>,
    )

    expect(buckets('Payload')).toEqual([
      { label: '0 – 1', cells: ['10'] },
      { label: '1 – 3', cells: ['10'] },
    ])
  })
})

describe('the empty state', () => {
  it('says what happened instead of drawing empty axes', () => {
    render(
      <Histogram title="Scores" values={[]}>
        <Histogram.Bars />
      </Histogram>,
    )

    expect(screen.getByText('No data in this range')).toBeInTheDocument()
  })

  it('keeps the figure named, so the page still says what is missing', () => {
    render(
      <Histogram title="Scores" data={[]}>
        <Histogram.Bars />
      </Histogram>,
    )

    expect(screen.getByRole('figure', { name: 'Scores' })).toBeInTheDocument()
  })
})
