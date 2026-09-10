import type { ReactNode } from 'react'
import { Heatmap, type HeatmapCell } from '../Heatmap/Heatmap'
import type { ChartEmptyProps } from '../lib/empty'

const DAY_MS = 86_400_000

/** Sunday first, which is what `weekStartsOn` rotates. */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Invisible, and never repeated: what keeps two blank column headers apart.
 *
 * `Heatmap` places a cell by looking its row and column up by name, so two
 * columns with the same label are one column as far as the grid is concerned —
 * and eleven of the twelve headers on a year are deliberately blank.
 */
const ZERO_WIDTH_SPACE = '​'

/** A calendar date as `YYYY-MM-DD`, at UTC midnight. */
function parse(date: string): number {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/**
 * `YYYY-MM-DD` for a UTC instant.
 *
 * Every date in here is arithmetic on UTC midnights and nothing reads a local
 * component, which is the whole of the timezone story: a naked `new Date('…')`
 * parses in the runner's own zone, so the same grid drawn in Sydney and in
 * Berlin would disagree by a day on either side of local midnight.
 */
function iso(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

export interface CalendarHeatmapValue {
  /** The day, as `YYYY-MM-DD`. */
  date: string
  /** The count. `null` is drawn as an explicit gap, not as a zero. */
  value: number | null
}

export interface CalendarHeatmapProps {
  /** What the calendar shows. Required, and it names the table. */
  title: string
  /** Prints the title above the grid instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /**
   * One entry per day that has a reading. Order does not matter; the grid is
   * built from the dates.
   *
   * A day inside the window with no entry is drawn as a gap rather than as a
   * zero, which is the distinction a calendar most often loses: "nothing
   * happened" and "nothing was recorded" are different readings, and a page
   * that draws them alike invites the reader to explain an outage that was a
   * gap in collection.
   */
  values: CalendarHeatmapValue[]
  /**
   * The first day the grid covers, as `YYYY-MM-DD`. Defaults to the earliest
   * date in `values`.
   *
   * Give both ends whenever the window is a fact about the QUESTION rather than
   * about the data — "the last year", "this quarter". Derived from the values,
   * a quiet January simply does not exist, and the grid silently becomes a
   * different window than the one beside it.
   */
  from?: string
  /** The last day the grid covers, as `YYYY-MM-DD`. Defaults to the latest date in `values`. */
  to?: string
  /**
   * What each cell announces, given its reading and its date.
   *
   * The default is the date and the number. Reach for this to name the unit —
   * "3 commits on 2026-01-05" — because the row and column headers a cell is
   * announced with are a weekday and a month over a block of five weeks, and
   * neither says which day it was.
   */
  describe?: (value: number, date: string) => string
  /**
   * The seven row headers, Sunday first, whatever `weekStartsOn` is.
   *
   * Sunday first in the ARRAY and not on the grid: the labels are a
   * translation and the first column is a calendar convention, and tying the
   * two together would make a Monday-first German calendar a different array
   * from a Monday-first English one.
   */
  weekdayLabels?: string[]
  /** The twelve column headers, January first. */
  monthLabels?: string[]
  /** Which weekday the grid's first row is. `0` is Sunday, `1` Monday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /**
   * The domain, as `[min, max]`. Derived from the readings when omitted.
   *
   * Pin it whenever two calendars are meant to be compared: a quiet year and a
   * busy one drawn on their own domains look identical, and the comparison the
   * reader came for is not merely lost but inverted.
   */
  domain?: [number, number]
  className?: string
  /** What the grid shows when there is no window to draw. */
  empty?: ChartEmptyProps
}

/**
 * A year of daily readings, as a week-by-week grid.
 *
 * `Heatmap` draws a grid of named rows and columns and knows nothing about
 * dates; this is the arrangement everybody writes on top of it and nobody
 * writes the same way twice — a column per week, a row per weekday, a month
 * name on the first column it touches, and the days either side of the window
 * left as gaps rather than as zeroes.
 *
 * The grid is built from the DATES rather than from the order of the array, so
 * a gap in the data is a gap on the calendar. That is the failure this exists
 * to prevent: given a bare list of counts, a missing Tuesday shifts every
 * reading after it by one cell, and the result is a plausible picture of a year
 * that did not happen.
 *
 * Every date is arithmetic on UTC midnights. A local-time calendar drawn in two
 * timezones is two different calendars, and the disagreement is exactly one day
 * wide — small enough to survive review and large enough to move a reading into
 * the wrong week.
 *
 * @example
 * <CalendarHeatmap
 *   title="Commits per day"
 *   values={days}
 *   from="2026-01-01"
 *   to="2026-12-31"
 *   describe={(value, date) => `${value} commits on ${date}`}
 * />
 */
export function CalendarHeatmap({
  title,
  showTitle = false,
  description,
  values,
  from,
  to,
  describe,
  weekdayLabels = WEEKDAYS,
  monthLabels = MONTHS,
  weekStartsOn = 0,
  domain,
  className,
  empty,
}: CalendarHeatmapProps) {
  const readings = new Map(values.map((entry) => [entry.date, entry.value]))
  const dates = values.map((entry) => parse(entry.date))
  const first = from !== undefined ? parse(from) : Math.min(...dates)
  const last = to !== undefined ? parse(to) : Math.max(...dates)

  // `values: []` with no window given leaves the bounds at ±Infinity, which is
  // the empty state rather than a grid with an infinite number of weeks in it.
  const drawable = Number.isFinite(first) && Number.isFinite(last) && first <= last

  // Back to the week the window starts in, and forward to the end of the week
  // it ends in: a calendar's first column is a week, not a Monday-shaped
  // fragment of one, and the days outside the window are drawn as gaps.
  const lead = drawable ? (new Date(first).getUTCDay() - weekStartsOn + 7) % 7 : 0
  const start = first - lead * DAY_MS
  // Integer arithmetic, not a rounded division: every bound is a UTC midnight,
  // so the span is a whole number of days and the last day's own week is the
  // one `+ 1` adds. A `Math.ceil` here drops the final column on any window
  // that happens to be an exact multiple of seven.
  const weeks = drawable ? Math.floor((last - start) / DAY_MS / 7) + 1 : 0

  const rows = Array.from(
    { length: 7 },
    (_, offset) => weekdayLabels[(weekStartsOn + offset) % 7] ?? '',
  )

  // A month name on the first column it touches, blank elsewhere — the sparse
  // header a year of activity reads by. Threaded through `reduce` rather than a
  // mutated loop variable, so nothing outlives the render that builds it, and
  // every label carries a run of zero-width spaces sized to its own position:
  // invisible on screen, unique to the lookup.
  const columns = Array.from({ length: weeks }, (_, week) => week).reduce<{
    labels: string[]
    lastMonth: number
  }>(
    (acc, week) => {
      const month = new Date(start + week * 7 * DAY_MS).getUTCMonth()
      const opens = month !== acc.lastMonth
      return {
        labels: [...acc.labels, `${opens ? (monthLabels[month] ?? '') : ''}${ZERO_WIDTH_SPACE.repeat(week)}`],
        lastMonth: opens ? month : acc.lastMonth,
      }
    },
    { labels: [], lastMonth: -1 },
  ).labels

  const cells: HeatmapCell[] = []
  const dateOf = new Map<string, string>()
  for (let week = 0; week < weeks; week++) {
    for (let offset = 0; offset < 7; offset++) {
      const time = start + (week * 7 + offset) * DAY_MS
      if (time < first || time > last) continue
      const row = rows[offset] ?? ''
      const column = columns[week] ?? ''
      const day = iso(time)
      dateOf.set(`${row} ${column}`, day)
      cells.push({ row, column, value: readings.get(day) ?? null })
    }
  }

  // Keyed by the CELL rather than by the value: two days with the same count
  // are two different readings, and a formatter that only sees the number can
  // only ever describe one of them.
  const formatValue = (value: number, cell: HeatmapCell): string => {
    const date = dateOf.get(`${cell.row} ${cell.column}`) ?? ''
    return describe ? describe(value, date) : `${date}: ${value.toLocaleString()}`
  }

  return (
    <Heatmap
      title={title}
      showTitle={showTitle}
      description={description}
      columns={columns}
      rows={rows}
      cells={cells}
      domain={domain}
      formatValue={formatValue}
      className={className}
      empty={empty}
    />
  )
}

export default CalendarHeatmap
