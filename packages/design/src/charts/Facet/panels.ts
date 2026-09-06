/**
 * The grouping, ordering, capping and domain arithmetic behind `<Facet>`.
 *
 * Kept out of the component on purpose. Everything here is a pure function over
 * plain rows, which means the part of faceting that is actually easy to get
 * wrong — the shared domain, the sort direction, what happens to the tail past
 * the cap — is unit-testable without a DOM, a rendering engine or a layout.
 *
 * Named `panels` rather than `facet` because macOS and Windows resolve paths
 * case-insensitively: a `facet.ts` beside `Facet.tsx` makes `./Facet/Facet`
 * ambiguous, and TypeScript resolves it to the wrong one of the two.
 */

/** How the panels are ordered. */
export type FacetSortKey = 'name' | 'input' | 'min' | 'max' | 'sum' | 'mean' | 'last'

/**
 * The panel order: a named key, an explicit list of group names, or a
 * comparator over the groups' own statistics.
 *
 * An explicit list is the escape hatch for an order the data does not carry —
 * a funnel's stages, a week's days, a severity scale. Names the list does not
 * mention keep their relative order and follow the ones it does.
 */
export type FacetSort<TRow> =
  | FacetSortKey
  | string[]
  | ((a: FacetGroup<TRow>, b: FacetGroup<TRow>) => number)

/** Whether every panel is drawn against one domain or against its own. */
export type FacetScales = 'shared' | 'independent'

/** What happens to the groups past the cap. */
export type FacetOverflow = 'note' | 'fold'

/** What one group's numbers add up to. The sort and the domain read these. */
export interface FacetStats {
  /** The smallest finite value across the group's rows and value fields. */
  min: number
  /** The largest finite value across the group's rows and value fields. */
  max: number
  /** Every finite value added together — the group's grand total. */
  sum: number
  /** `sum / count`, or 0 when the group holds no finite value. */
  mean: number
  /**
   * The last row that holds a finite number, summed across the value fields.
   *
   * "Where did this end up", which is the question a grid of trends is usually
   * sorted by — and a different question from "how big was it overall".
   */
  last: number
  /** How many finite numbers the rest of these were computed from. */
  count: number
}

/** A group of rows and what its numbers add up to — what a custom sort sees. */
export interface FacetGroup<TRow> {
  /** The group's value on the `by` field, as text. Also the panel's label. */
  name: string
  /** The rows this panel draws. */
  rows: TRow[]
  stats: FacetStats
}

/** One panel of the grid: a group, and the domain it draws against. */
export interface FacetPanel<TRow> extends FacetGroup<TRow> {
  /**
   * The `[min, max]` this panel's value axis should use.
   *
   * Under the default shared scales this is the SAME array for every panel,
   * computed across all of them. Handing it to the panel's value axis is the
   * whole point of the component — see the note on `FacetProps.scales`.
   */
  domain: [number, number]
  /** Position in the grid, from 0. */
  index: number
  /** How many panels the grid holds, so a panel can say "3 of 12". */
  total: number
  /** How many source groups this panel stands for. Above 1 only for the fold. */
  size: number
  /** True for the one panel the capped tail was folded into. */
  isOther: boolean
}

export interface FacetOptions<TRow> {
  /** The row field the data is split on. */
  by: keyof TRow & string
  /** The row field, or fields, holding the numbers. */
  value: (keyof TRow & string) | (keyof TRow & string)[]
  /** The shared category field — the x axis. Only the fold needs it. */
  xDataKey?: keyof TRow & string
  scales?: FacetScales
  /** Overrides the computed domain outright. */
  domain?: [number, number]
  includeZero?: boolean
  nice?: boolean
  sort?: FacetSort<TRow>
  order?: 'asc' | 'desc'
  limit?: number | false
  overflow?: FacetOverflow
  otherLabel?: string
}

export interface FacetResult<TRow> {
  /** The panels to render, in order, capped. */
  panels: FacetPanel<TRow>[]
  /** How many groups the data held, before the cap. */
  total: number
  /** How many groups the cap left out — folded or simply not drawn. */
  hidden: number
  /** The one domain every panel shares, or null under independent scales. */
  domain: [number, number] | null
}

/** The value option, always as a list. */
function keys<TRow>(value: FacetOptions<TRow>['value']): (keyof TRow & string)[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * A row's finite numbers under the value fields, in field order.
 *
 * `null` and `''` are skipped before the coercion rather than after it, because
 * `Number(null)` is 0 — so a gap in the data would otherwise read as a series
 * that fell to zero, and both the domain and a sort by "where it ended up"
 * would be built on it.
 */
function numbers<TRow>(row: TRow, fields: (keyof TRow & string)[]): number[] {
  const found: number[] = []
  for (const field of fields) {
    const raw = row[field]
    if (raw === null || raw === undefined || raw === '') continue
    const entry = Number(raw)
    if (Number.isFinite(entry)) found.push(entry)
  }
  return found
}

/**
 * Splits rows into groups, in the order the groups first appear.
 *
 * A row whose `by` field is null or undefined is dropped rather than collected
 * under an "undefined" panel: a row that says nothing about which group it
 * belongs to cannot be faceted, and a panel labelled `undefined` is a defect
 * the reader is asked to interpret.
 */
export function groupRows<TRow extends Record<string, unknown>>(
  data: TRow[],
  by: keyof TRow & string,
): { name: string; rows: TRow[] }[] {
  const found = new Map<string, TRow[]>()

  for (const row of data) {
    const raw = row[by]
    if (raw === null || raw === undefined) continue
    const name = String(raw)
    const rows = found.get(name)
    if (rows) rows.push(row)
    else found.set(name, [row])
  }

  return [...found].map(([name, rows]) => ({ name, rows }))
}

/**
 * One group's statistics.
 *
 * Empty and all-non-numeric groups return zeroes with `count: 0` rather than
 * `Infinity`, so a sort never has to special-case them and a domain built from
 * them is still a pair of numbers.
 */
export function statsOf<TRow extends Record<string, unknown>>(
  rows: TRow[],
  value: FacetOptions<TRow>['value'],
): FacetStats {
  const fields = keys<TRow>(value)
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let sum = 0
  let count = 0
  let last = 0

  for (const row of rows) {
    const found = numbers(row, fields)
    if (found.length === 0) continue
    // The LAST row that carried anything, not the last row — a trailing row of
    // nulls should not read as a series that fell to zero.
    last = found.reduce((total, entry) => total + entry, 0)
    for (const entry of found) {
      if (entry < min) min = entry
      if (entry > max) max = entry
      sum += entry
      count += 1
    }
  }

  if (count === 0) return { min: 0, max: 0, sum: 0, mean: 0, last: 0, count: 0 }
  return { min, max, sum, mean: sum / count, last, count }
}

/**
 * The tick interval a reader recognises for a span — d3's rule, because it is
 * the one every axis in every tool already agrees on.
 *
 * Without it a shared domain of `[0, 314]` gives ticks at 78.5 and 157, and the
 * component would have made the panels comparable and the numbers unreadable in
 * the same move.
 */
function tickStep(span: number, count: number): number {
  if (!(span > 0)) return 1
  const raw = span / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalised = raw / magnitude
  const step = normalised >= 7.5 ? 10 : normalised >= 3.5 ? 5 : normalised >= 1.5 ? 2 : 1
  return step * magnitude
}

/** Kills the float dust `Math.floor(0.3 / 0.1) * 0.1` leaves behind. */
function clean(value: number): number {
  return Number(value.toPrecision(12))
}

export interface DomainOptions {
  /**
   * Pulls the domain out to include zero.
   *
   * On by default, and the same default Recharts applies on its own: a bar or
   * an area read against a truncated baseline overstates every difference in
   * the grid, and a grid exists to be compared. Turn it off when the values
   * live far from zero and the differences between them ARE the reading —
   * temperatures, latencies, ratings out of five.
   */
  includeZero?: boolean
  /** Rounds the domain out to round numbers, so the ticks are readable. */
  nice?: boolean
}

/**
 * A `[min, max]` extended to something an axis can label.
 *
 * A degenerate extent — one row, or a group where every value is identical —
 * is given a span rather than returned as a zero-height plot.
 */
export function niceDomain(
  extent: [number, number],
  { includeZero = true, nice = true }: DomainOptions = {},
): [number, number] {
  let [min, max] = extent
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]

  if (includeZero) {
    min = Math.min(min, 0)
    max = Math.max(max, 0)
  }
  if (max === min) max = min + (Math.abs(min) || 1)
  if (!nice) return [min, max]

  const step = tickStep(max - min, 5)
  return [clean(Math.floor(min / step) * step), clean(Math.ceil(max / step) * step)]
}

/** The extent across every group — the shared domain, before it is rounded. */
export function sharedExtent(stats: FacetStats[]): [number, number] {
  const scored = stats.filter((entry) => entry.count > 0)
  if (scored.length === 0) return [0, 1]
  return [
    Math.min(...scored.map((entry) => entry.min)),
    Math.max(...scored.map((entry) => entry.max)),
  ]
}

/** Reads the statistic a named sort orders on. */
function statistic(stats: FacetStats, key: FacetSortKey): number {
  switch (key) {
    case 'min':
      return stats.min
    case 'sum':
      return stats.sum
    case 'mean':
      return stats.mean
    case 'last':
      return stats.last
    default:
      return stats.max
  }
}

/**
 * Orders the panels.
 *
 * `order` is optional because the natural direction depends on what is being
 * sorted: names read A→Z, a statistic reads biggest first. Passing it makes the
 * direction explicit either way.
 *
 * The sort is stable, so groups that tie keep the order the data gave them.
 */
export function sortGroups<TRow, TGroup extends FacetGroup<TRow>>(
  groups: TGroup[],
  sort: FacetSort<TRow>,
  order?: 'asc' | 'desc',
): TGroup[] {
  const sorted = [...groups]

  // Reversing the array would reverse the ties along with everything else. A
  // sign on the comparator leaves equal groups in the order the data gave them,
  // which is what makes a re-render deterministic.
  if (sort === 'input') return order === 'desc' ? sorted.reverse() : sorted

  const compare = comparator<TRow, TGroup>(sort)
  const sign = (order ?? defaultOrder(sort)) === 'desc' ? -1 : 1
  sorted.sort((a, b) => compare(a, b) * sign)
  return sorted
}

/** Ascending for a name or an explicit list, descending for a statistic. */
function defaultOrder<TRow>(sort: FacetSort<TRow>): 'asc' | 'desc' {
  if (typeof sort === 'function' || Array.isArray(sort) || sort === 'name') return 'asc'
  return 'desc'
}

/** The ascending comparator behind one sort. */
function comparator<TRow, TGroup extends FacetGroup<TRow>>(
  sort: Exclude<FacetSort<TRow>, 'input'>,
): (a: TGroup, b: TGroup) => number {
  if (typeof sort === 'function') return sort

  if (Array.isArray(sort)) {
    // Names the list does not mention sort after the ones it does, keeping the
    // order the data gave them — a partial list is a partial instruction, not
    // an instruction to discard everything it forgot.
    const rank = new Map(sort.map((name, index) => [name, index]))
    const place = (name: string) => rank.get(name) ?? Number.MAX_SAFE_INTEGER
    return (a, b) => place(a.name) - place(b.name)
  }

  if (sort === 'name') {
    // `numeric` so "Region 2" precedes "Region 10", which is the one thing a
    // plain string sort gets wrong on every dataset that numbers its groups.
    return (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })
  }

  return (a, b) => statistic(a.stats, sort) - statistic(b.stats, sort)
}

/**
 * Sums the capped tail into one group, aligned on the category axis.
 *
 * With `xDataKey` the tail's rows are added together at each category, which is
 * what makes the "Other" panel a readable series rather than a scribble. Without
 * one the rows are concatenated in the order they arrived, which is only
 * meaningful for a chart that bins its own x — so pass the key.
 */
export function foldGroups<TRow extends Record<string, unknown>>(
  tail: { name: string; rows: TRow[] }[],
  {
    by,
    value,
    xDataKey,
    label,
  }: {
    by: keyof TRow & string
    value: FacetOptions<TRow>['value']
    xDataKey?: keyof TRow & string
    label: string
  },
): { name: string; rows: TRow[] } {
  const rows = tail.flatMap((group) => group.rows)
  if (!xDataKey) return { name: label, rows }

  const fields = keys<TRow>(value)
  const bins = new Map<string, Record<string, unknown>>()

  for (const row of rows) {
    const category = String(row[xDataKey])
    let bin = bins.get(category)
    if (!bin) {
      bin = { [xDataKey]: row[xDataKey], [by]: label }
      for (const field of fields) bin[field] = 0
      bins.set(category, bin)
    }
    for (const field of fields) {
      const raw = row[field]
      if (raw === null || raw === undefined || raw === '') continue
      const entry = Number(raw)
      if (Number.isFinite(entry)) bin[field] = Number(bin[field]) + entry
    }
  }

  // A summed row is a row this module built, not one the caller handed in. The
  // cast is the boundary where that is admitted: it carries the same fields the
  // panels read, and nothing else the caller's own type may promise.
  return { name: label, rows: [...bins.values()] as unknown as TRow[] }
}

/**
 * The whole pipeline: group, summarise, order, cap, and hand every panel a
 * domain.
 *
 * One function rather than four calls at the call site, because the ORDER of
 * those four is itself a decision — the domain is computed across the groups
 * that survive the cap, so a folded "Other" panel cannot push the shared scale
 * past every panel it is meant to be compared against.
 */
export function buildPanels<TRow extends Record<string, unknown>>(
  data: TRow[],
  options: FacetOptions<TRow>,
): FacetResult<TRow> {
  const {
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
  } = options

  const grouped: FacetGroup<TRow>[] = groupRows(data, by).map((group) => ({
    ...group,
    stats: statsOf(group.rows, value),
  }))

  const total = grouped.length
  if (total === 0) return { panels: [], total: 0, hidden: 0, domain: null }

  const ordered = sortGroups<TRow, FacetGroup<TRow>>(grouped, sort, order)

  const capped = typeof limit === 'number' && limit >= 0 && ordered.length > limit
  const head = capped ? ordered.slice(0, limit) : ordered
  const tail = capped ? ordered.slice(limit) : []

  const folded =
    capped && overflow === 'fold'
      ? foldGroups(tail, { by, value, xDataKey, label: otherLabel })
      : undefined

  const shown: (FacetGroup<TRow> & { size: number; isOther: boolean })[] = [
    ...head.map((group) => ({ ...group, size: 1, isOther: false })),
    ...(folded
      ? [
          {
            ...folded,
            stats: statsOf(folded.rows, value),
            size: tail.length,
            isOther: true,
          },
        ]
      : []),
  ]

  // Computed after the cap and after the fold, so it covers exactly what is
  // drawn: a group the cap left out cannot stretch the scale into dead space,
  // and a folded "Other" — which IS drawn, and on this same axis — cannot
  // overflow the plot it is drawn in.
  const sharedDomain =
    domain ?? niceDomain(sharedExtent(shown.map((group) => group.stats)), { includeZero, nice })

  const independent = scales === 'independent' && !domain

  const panels = shown.map((group, index) => ({
    name: group.name,
    rows: group.rows,
    domain: independent
      ? niceDomain([group.stats.min, group.stats.max], { includeZero, nice })
      : sharedDomain,
    stats: group.stats,
    index,
    total: shown.length,
    size: group.size,
    isOther: group.isOther,
  }))

  return { panels, total, hidden: tail.length, domain: independent ? null : sharedDomain }
}
