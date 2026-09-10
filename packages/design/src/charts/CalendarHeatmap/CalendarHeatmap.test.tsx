import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { CalendarHeatmap, type CalendarHeatmapValue } from './CalendarHeatmap'

/** Every day in a window, with a count that is its own day of the month. */
function week(from: string, days: number): CalendarHeatmapValue[] {
  const start = Date.parse(`${from}T00:00:00Z`)
  return Array.from({ length: days }, (_, offset) => {
    const date = new Date(start + offset * 86_400_000).toISOString().slice(0, 10)
    return { date, value: offset + 1 }
  })
}

describe('CalendarHeatmap', () => {
  it('names the table by its title', () => {
    render(<CalendarHeatmap title="Commits per day" values={week('2026-01-04', 7)} />)

    expect(screen.getByRole('table', { name: 'Commits per day' })).toBeInTheDocument()
  })

  it('puts a reading on its own weekday, whatever order it arrives in', () => {
    // The grid is built from the DATES rather than from the order of the array,
    // which is the whole difference from a list of counts: a missing or
    // out-of-order day there shifts every reading after it by one cell and
    // draws a plausible picture of a year that did not happen.
    render(
      <CalendarHeatmap
        title="Commits per day"
        // 2026-01-08 is a Thursday. Handed over last, and out of order.
        values={[
          { date: '2026-01-06', value: 2 },
          { date: '2026-01-08', value: 9 },
        ]}
        from="2026-01-04"
        to="2026-01-10"
      />,
    )

    const thursday = screen.getByRole('row', { name: /^Thu/ })
    expect(within(thursday).getByText(/2026-01-08/)).toBeInTheDocument()
  })

  it('says which day a reading was, not only how many', () => {
    // Two days with the same count are two different readings. A formatter
    // keyed by the value alone can only ever describe one of them, and the row
    // and column a cell is announced with are a weekday and a month over a
    // block of five weeks.
    render(
      <CalendarHeatmap
        title="Commits per day"
        values={[
          { date: '2026-01-05', value: 3 },
          { date: '2026-01-07', value: 3 },
        ]}
        from="2026-01-04"
        to="2026-01-10"
        describe={(value, date) => `${String(value)} commits on ${date}`}
      />,
    )

    expect(screen.getByText('3 commits on 2026-01-05')).toBeInTheDocument()
    expect(screen.getByText('3 commits on 2026-01-07')).toBeInTheDocument()
  })

  it('draws a day with no reading as a gap rather than as a zero', () => {
    // "Nothing happened" and "nothing was recorded" are different readings, and
    // a page that draws them alike invites the reader to explain an outage that
    // was a gap in collection.
    render(
      <CalendarHeatmap
        title="Commits per day"
        values={[{ date: '2026-01-05', value: 4 }]}
        from="2026-01-04"
        to="2026-01-10"
      />,
    )

    expect(screen.getAllByText(/no data$/)).toHaveLength(6)
  })

  it('keeps the last week when the window is an exact multiple of seven', () => {
    // 2026-01-04 is a Sunday, so a 49-day window starting there is exactly
    // seven whole weeks plus its own last day — eight columns. Rounding the
    // division instead of counting the days drops the final one, and the grid
    // silently ends a week early.
    render(<CalendarHeatmap title="Commits per day" values={week('2026-01-04', 50)} />)

    expect(screen.getByText(/2026-02-22/)).toBeInTheDocument()
  })

  it('starts the week where the calendar convention does', () => {
    render(
      <CalendarHeatmap
        title="Commits per day"
        values={week('2026-01-04', 7)}
        weekStartsOn={1}
      />,
    )

    const rows = screen.getAllByRole('rowheader')
    expect(rows[0]).toHaveTextContent('Mon')
    expect(rows[6]).toHaveTextContent('Sun')
  })

  it('says there is no data rather than drawing an empty grid', () => {
    render(<CalendarHeatmap title="Commits per day" values={[]} />)

    expect(screen.getByText(/no data in this range/i)).toBeInTheDocument()
  })
})
