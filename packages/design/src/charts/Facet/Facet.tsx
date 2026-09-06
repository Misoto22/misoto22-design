import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ChartFigure } from '../lib/figure'
import { ChartEmpty, type ChartEmptyProps } from '../lib/empty'
import {
  buildPanels,
  type FacetOverflow,
  type FacetPanel,
  type FacetScales,
  type FacetSort,
} from './panels'

/**
 * The gap between panels. Kept in step with `gap-4` on the grid, because the
 * column cap below has to subtract the gaps it cannot see.
 */
const GAP_REM = 1

/**
 * How narrow a panel may get before the grid drops a column.
 *
 * Below roughly this width a plot has room for its axis labels or its marks,
 * not both, and a grid of unreadable panels is worse than a scroll.
 */
const MIN_PANEL_PX = 200

/** What the overflow note is told, so a call site can write its own. */
export interface FacetOverflowInfo {
  /** How many panels are drawn, including the fold. */
  shown: number
  /** How many groups the data held. */
  total: number
  /** How many groups the cap left out. */
  hidden: number
  /** What the folded panel is called. */
  otherLabel: string
  overflow: FacetOverflow
}

export interface FacetProps<TRow extends Record<string, unknown>> {
  /**
   * What the whole grid shows, in a sentence a reader could act on. Required,
   * and announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the grid instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /** Every row, across every group. The split happens here, not at the call site. */
  data: TRow[]
  /** The row field the data is split on. One panel per distinct value. */
  by: keyof TRow & string
  /**
   * The row field, or fields, holding the numbers.
   *
   * This is what the shared domain is measured over and what a statistical sort
   * reads, so it has to name every series a panel draws — a panel that plots a
   * field this does not mention can still overflow its own axis.
   */
  value: (keyof TRow & string) | (keyof TRow & string)[]
  /**
   * The shared category field — the x axis every panel has in common.
   *
   * Feeds the hidden table view, and is what lets `overflow="fold"` add the
   * tail up at each category instead of concatenating it.
   */
  xDataKey?: keyof TRow & string
  /**
   * Whether every panel is drawn against one domain or against its own.
   *
   * `"shared"` — the default, and the entire reason this component exists. On
   * independent scales every panel fills its own plot, so a group peaking at
   * 40 and a group peaking at 4,000 come out the same shape, and the
   * comparison the reader opened the grid to make is not merely hard but
   * actively wrong. The shared domain is computed across all the panels that
   * survive the cap and handed to each one as `panel.domain`; a panel that does
   * not pass it to its value axis has opted back into the broken version.
   *
   * `"independent"` is the escape hatch for the case where the panels are not
   * comparable — different units, different orders of magnitude that carry no
   * relation — and where each panel's own shape is the only reading. It is
   * never the safe answer, which is why it is not the default.
   */
  scales?: FacetScales
  /** Pins the domain outright, ignoring the data and `scales` alike. */
  domain?: [number, number]
  /**
   * Pulls the shared domain out to include zero.
   *
   * On by default, and the same default Recharts applies on its own: bars and
   * areas read against a truncated baseline overstate every difference in the
   * grid, and a grid exists to be compared. Turn it off when the values live
   * far from zero and the differences between them ARE the reading —
   * temperatures, latencies, ratings out of five.
   */
  includeZero?: boolean
  /**
   * Rounds the domain out so the panels' ticks land on numbers a reader
   * recognises. Off, a shared domain of `[0, 314]` gives ticks at 78.5.
   */
  nice?: boolean
  /**
   * The panel order.
   *
   * Defaults to the largest peak first, because that is what makes a grid
   * readable: eye order becomes rank order, and "which of these is the
   * problem" is answered by position before a single axis is read. `"name"`
   * for a grid a reader will look things up in, an explicit array of names for
   * an order the data does not carry — stages, weekdays, severities — and a
   * comparator over `{ name, rows, stats }` for anything else.
   */
  sort?: FacetSort<TRow>
  /**
   * The sort direction. Omit and it follows the sort: A→Z for a name or an
   * explicit list, biggest first for a statistic.
   */
  order?: 'asc' | 'desc'
  /**
   * How many panels are drawn before the rest are dealt with.
   *
   * Twelve by default rather than unlimited, because the failure this prevents
   * is silent: a `by` field with forty values renders forty plots, each one
   * roughly a postage stamp, and nothing on the page says the grid stopped
   * being readable. `false` lifts the cap when the call site has genuinely
   * decided to draw them all.
   */
  limit?: number | false
  /**
   * What happens to the groups past the cap.
   *
   * `"note"` — the default — draws the top N and prints a line under the grid
   * saying how many are missing. `"fold"` adds one more panel holding the tail
   * summed at each category, the same bargain `BarList`'s "Other" row makes:
   * the total stays true, and one panel absorbs the long tail. Either way a
   * capped grid says so; nothing is dropped in silence.
   */
  overflow?: FacetOverflow
  /** What the folded panel is called. */
  otherLabel?: string
  /**
   * Writes the line under a capped grid. The default sentence is English; this
   * is where a translated call site replaces it.
   */
  overflowNote?: (info: FacetOverflowInfo) => ReactNode
  /**
   * How many columns the grid holds at its widest.
   *
   * `"auto"` — the default — fits as many panels as `minPanelWidth` allows and
   * reflows on its own, which is the behaviour a card, a sidebar and a
   * full-width page all need from the same call site. A number caps the count
   * without pinning it: the grid still drops to fewer columns when the
   * container is narrow, rather than shrinking twelve plots to nothing.
   */
  columns?: 'auto' | number
  /** How narrow a panel may get before the grid drops a column, in pixels. */
  minPanelWidth?: number
  /**
   * One key for the whole grid, printed above it.
   *
   * A legend inside every panel is the same three swatches repeated twelve
   * times, which is ink spent restating what the reader learned from the first
   * panel. Put `<LineChart.Legend>` in one panel and this is unnecessary; put
   * it here and take it out of the panels.
   */
  legend?: ReactNode
  /** The value axis's name, printed once above the grid instead of per panel. */
  yLabel?: ReactNode
  /** The category axis's name, printed once under the grid. */
  xLabel?: ReactNode
  /**
   * Prints each panel's group name above its plot.
   *
   * On by default. Turning it off only hides the name — it stays in the
   * accessibility tree, because a grid whose panels a screen reader cannot tell
   * apart is a grid with one figure and twelve anonymous plots in it.
   */
  showPanelNames?: boolean
  /**
   * Drops the hidden table view of every row.
   *
   * Worth setting when the panels' own charts already ship theirs — each chart
   * in the package renders its rows as a table too, so a twelve-panel grid can
   * otherwise put thirteen tables in the accessibility tree.
   */
  hideDataTable?: boolean
  /**
   * What the grid shows when the data yields no groups at all.
   *
   * No `false` escape hatch, unlike a single chart's: an empty pair of axes is
   * at least a chart, but an empty grid is nothing — there is no reading for
   * the absence to be.
   */
  empty?: ChartEmptyProps
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /**
   * One panel, called once per group.
   *
   * Hand `panel.domain` to the panel chart's value axis. That single line is
   * what the component is for; without it the panels are on independent scales
   * and the grid is decorative.
   */
  children: (panel: FacetPanel<TRow>) => ReactNode
}

/**
 * The same chart repeated once per group, on one shared scale — small
 * multiples.
 *
 * The answer to the question a multi-series chart stops being able to answer at
 * around five series: eight lines in one plot is a hairball, and the reader
 * spends their attention untangling strands instead of reading them. Splitting
 * the same lines across eight small plots costs the direct overlay comparison
 * and buys back every individual shape, which is almost always the better
 * trade — this is Tufte's small multiple, and Observable Plot and Vega-Lite
 * both treat it as a first-class operation for the same reason.
 *
 * Reach for a multi-series `<LineChart>` or `<AreaChart>` instead when the
 * series really do have to be read AGAINST each other — crossovers, gaps,
 * shares of one total — and when there are few enough of them to tell apart.
 * Reach for this when each group has its own shape worth seeing, when the
 * groups are many, or when the reader's question is "which of these is
 * different".
 *
 * What it gets right that a hand-rolled `data.map()` does not: the panels share
 * one domain by default. On independent scales every panel fills its own plot,
 * so a group peaking at 40 and a group peaking at 4,000 come out the same
 * shape — the comparison is not merely lost, it is inverted, and nothing on
 * screen says so. `panel.domain` is that shared scale; the render function has
 * to pass it to the panel's value axis. It also caps the grid, folds or counts
 * the tail, and prints one legend and one axis label instead of twelve.
 *
 * @example
 * <Facet title="Visitors by channel" data={rows} by="channel" value="visitors" xDataKey="month">
 *   {(panel) => (
 *     <LineChart title={`${panel.name} visitors`} config={config} data={panel.rows}>
 *       <LineChart.XAxis dataKey="month" />
 *       <LineChart.YAxis domain={panel.domain} />
 *       <LineChart.Line dataKey="visitors" />
 *     </LineChart>
 *   )}
 * </Facet>
 *
 * @example
 * // Biggest first, six panels, the rest summed into one — and the grid says so.
 * <Facet
 *   title="Requests by endpoint"
 *   data={rows}
 *   by="endpoint"
 *   value="requests"
 *   xDataKey="hour"
 *   sort="sum"
 *   limit={6}
 *   overflow="fold"
 *   columns={3}
 * >
 *   {(panel) => <MiniBars rows={panel.rows} domain={panel.domain} />}
 * </Facet>
 */
export function Facet<TRow extends Record<string, unknown>>({
  title,
  showTitle,
  description,
  data,
  by,
  value,
  xDataKey,
  scales = 'shared',
  domain,
  includeZero = true,
  nice = true,
  sort = 'max',
  order,
  limit = 12,
  overflow = 'note',
  otherLabel = 'Other',
  overflowNote = defaultOverflowNote,
  columns = 'auto',
  minPanelWidth = MIN_PANEL_PX,
  legend,
  yLabel,
  xLabel,
  showPanelNames = true,
  hideDataTable = false,
  empty,
  className,
  children,
}: FacetProps<TRow>) {
  const { panels, total, hidden } = buildPanels(data, {
    by,
    value,
    xDataKey,
    scales,
    domain,
    includeZero,
    nice,
    sort,
    order,
    limit,
    overflow,
    otherLabel,
  })

  const valueKeys = Array.isArray(value) ? value : [value]
  const note =
    hidden > 0
      ? overflowNote({ shown: panels.length, total, hidden, otherLabel, overflow })
      : null

  return (
    <ChartFigure
      title={title}
      showTitle={showTitle}
      description={description}
      className={className}
      table={
        hideDataTable
          ? false
          : {
              rows: data,
              rowKey: xDataKey,
              columns: [
                { key: by, label: by },
                ...valueKeys.map((key) => ({ key, label: key })),
              ],
            }
      }
    >
      {panels.length === 0 ? (
        <ChartEmpty {...(empty || {})} />
      ) : (
        <>
          {(legend || yLabel) && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              {/* Rendered even when empty: it is what holds the legend at the
                  inline end when there is no axis label beside it. */}
              <span className="mono-meta text-(--ink-3-aa)">{yLabel}</span>
              {legend}
            </div>
          )}
          <ul
            // `list-none` strips the list role in Safari, and a grid of panels
            // that does not announce "list, 12 items" loses the one cue a
            // screen reader user has for how far they have to go.
            role="list"
            className="m-0 grid list-none gap-4 p-0"
            style={{ gridTemplateColumns: track(columns, minPanelWidth) }}
          >
            {panels.map((panel) => (
              // Keyed by name rather than by position, so re-sorting the grid
              // moves the panels instead of remounting them — which would
              // replay every panel's intro animation on every sort change.
              <li
                key={panel.isOther ? `${panel.name} (fold)` : panel.name}
                className="flex min-w-0 flex-col gap-1"
              >
                <p
                  className={cn(
                    showPanelNames ? 'truncate eyebrow text-(--ink-3-aa)' : 'sr-only',
                  )}
                >
                  {panel.name}
                </p>
                <div className="flex min-w-0 flex-1 flex-col">{children(panel)}</div>
              </li>
            ))}
          </ul>
          {(note || xLabel) && (
            <div className="mt-3 flex flex-col gap-1">
              {xLabel && <span className="mono-meta text-center text-(--ink-3-aa)">{xLabel}</span>}
              {note && <span className="mono-meta text-(--ink-3-aa)">{note}</span>}
            </div>
          )}
        </>
      )}
    </ChartFigure>
  )
}

/**
 * The grid's track list.
 *
 * `auto-fit` rather than a fixed count, so the same call site works in a card
 * and across a page. A numeric `columns` is a CAP, not a pin: the track's
 * minimum is the width that would give exactly that many columns, clamped so
 * it never falls below a readable panel — which is what makes the grid drop to
 * two columns in a sidebar instead of rendering twelve slivers.
 *
 * Written as a style rather than a class because the track is computed from
 * two numbers, and Tailwind only generates what it can read verbatim.
 */
function track(columns: 'auto' | number, minPanelWidth: number): string {
  const floor = `min(${minPanelWidth}px, 100%)`
  if (columns === 'auto') return `repeat(auto-fit, minmax(${floor}, 1fr))`

  const count = Math.max(1, Math.round(columns))
  const share = `calc((100% - ${(count - 1) * GAP_REM}rem) / ${count})`
  return `repeat(auto-fit, minmax(clamp(${floor}, ${share}, 100%), 1fr))`
}

/** The default sentence under a capped grid. */
function defaultOverflowNote({ shown, total, hidden, otherLabel, overflow }: FacetOverflowInfo) {
  if (overflow === 'fold') {
    return `${shown - 1} of ${total} shown; the other ${hidden} are summed into ${otherLabel}.`
  }
  return `${shown} of ${total} shown; ${hidden} not drawn.`
}

export default Facet
