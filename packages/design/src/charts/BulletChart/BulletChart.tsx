import type { ReactNode } from 'react'
import { ChartFigure } from '../lib/figure'
import { ChartEmpty, type ChartEmptyProps } from '../lib/empty'
import { defaultTick } from '../lib/format'

/**
 * The heaviest and lightest a qualitative band may be, as multiples of
 * `--chart-fill`.
 *
 * Few's rule is no more than five bands in one hue, arranged so the low end of
 * the scale is the heaviest. The measure bar is solid ink on top of them, so
 * the ceiling has to stay well under it: bands that compete with the bar stop
 * being the ground it is read against.
 */
const BAND_WEIGHT = { heaviest: 1, lightest: 0.3 } as const

/** How tall the measure bar is, as a share of the track. Few's is a third. */
const BAR_SHARE = 0.34

/** One measure, its target, and the bands it is read against. */
export interface BulletMeasure {
  /** What is being measured. Doubles as the row's key, so it must be unique. */
  name: string
  /** The number the row is about. */
  value: number
  /**
   * The number the measure is being judged against — last year, the budget,
   * the SLO. Drawn as a rule across the bar, not as a second bar.
   */
  target?: number
  /**
   * The qualitative bands, as ascending UPPER bounds. `[60, 80]` on a 0–100
   * scale draws three bands: 0–60, 60–80, 80–100.
   *
   * Few's limit is five, and it is a real one: past that the shades stop being
   * separable and the bands become a gradient nobody can read a boundary off.
   */
  ranges?: number[]
  /** The scale, as `[min, max]`. Falls back to the chart's, then to the data. */
  domain?: [number, number]
  /** A second line under the name — the unit, the window, the owner. */
  detail?: ReactNode
}

/** A measure with its scale and bands resolved. */
interface ResolvedMeasure extends BulletMeasure {
  domain: [number, number]
  bands: { from: number; to: number; weight: number }[]
  /** Written out for the hidden table, which cannot print an array. */
  rangeLabel: string
}

/** Where a value sits on the scale, 0 to 1, clamped to it. */
function position(value: number, [low, high]: [number, number]): number {
  const span = high - low
  if (span === 0) return 0
  return Math.min(1, Math.max(0, (value - low) / span))
}

/**
 * A share of the track, as a CSS percentage.
 *
 * Rounded, because binary floating point turns `0.8 - 0.5` into
 * `30.000000000000004%` — a number no layout engine cares about and every
 * reader of the DOM does. Four places is finer than a subpixel on any track
 * this chart will be given.
 */
function pct(share: number): string {
  return `${Number((share * 100).toFixed(4))}%`
}

/** The bands, from the ascending upper bounds, each with its own weight. */
function bands(
  ranges: number[],
  [low, high]: [number, number],
  formatValue: (value: number) => string,
): { list: ResolvedMeasure['bands']; label: string } {
  const bounds = [...new Set(ranges.filter(Number.isFinite))]
    .sort((a, b) => a - b)
    .filter((bound) => bound > low && bound < high)

  const edges = [low, ...bounds, high]
  const count = edges.length - 1
  const { heaviest, lightest } = BAND_WEIGHT

  const list = Array.from({ length: count }, (_, index) => ({
    from: edges[index]!,
    to: edges[index + 1]!,
    // Heaviest at the low end, lightening as the scale rises — so the measure
    // bar, which is solid, stands out most where performance is best.
    weight: count === 1 ? lightest : heaviest - (index / (count - 1)) * (heaviest - lightest),
  }))

  // The label names the bounds the caller SET, not the band tops: the last
  // band's top is the end of the scale, which is not a threshold anybody chose.
  return { list, label: bounds.map(formatValue).join(', ') }
}

/** Every measure, with its scale and bands worked out. */
function resolve(
  data: BulletMeasure[],
  domain: [number, number] | undefined,
  ranges: number[] | undefined,
  formatValue: (value: number) => string,
): ResolvedMeasure[] {
  return data.map((measure) => {
    const own = measure.ranges ?? ranges ?? []
    const high = Math.max(measure.value, measure.target ?? Number.NEGATIVE_INFINITY, ...own)
    // Anchored at zero unless told otherwise: the measure is drawn as a BAR,
    // and a bar read off a scale that does not start at zero overstates every
    // difference on it.
    const scale: [number, number] = measure.domain ?? domain ?? [Math.min(0, measure.value), high || 1]
    const built = bands(own, scale, formatValue)

    return { ...measure, domain: scale, bands: built.list, rangeLabel: built.label }
  })
}

export interface BulletChartProps {
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the rows instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /** One entry per measure. Order is the reading order; it is not sorted. */
  data: BulletMeasure[]
  /**
   * The bands every measure falls back to, as ascending upper bounds.
   *
   * Shared bands only mean something when the measures share a scale. Where
   * they do not — a latency beside a conversion rate — put `ranges` and
   * `domain` on each measure instead.
   */
  ranges?: number[]
  /** The scale every measure falls back to, as `[min, max]`. */
  domain?: [number, number]
  /** Formats every number the chart prints. */
  formatValue?: (value: number) => string
  /** Prints the scale's two ends under each track. */
  showScale?: boolean
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Drops the hidden table view. Only correct when the page prints the data itself. */
  hideDataTable?: boolean
  /** What the chart shows when it has nothing to draw. */
  empty?: ChartEmptyProps
}

/**
 * A measure, its target, and the bands that say whether the number is any good
 * — one dense row per thing being tracked.
 *
 * Stephen Few designed this to replace the dashboard gauge, and the argument
 * has held: a speedometer spends a whole card saying one number badly, where a
 * bullet graph says the same number, its target, and the qualitative context
 * around it in the height of a line of text. Ten of them stack into a status
 * page a reader can scan in one pass.
 *
 * What it will not do is show change over time. A bullet graph is one instant,
 * and `target` is the only comparison it carries; when the question is
 * "how did we get here" it wants a `<LineChart>`, and when several measures
 * have to be compared against each OTHER rather than each against its own
 * target, a `<BarList>` ranks them and this does not.
 *
 * **The bands are the part to be careful with.** They are a judgement — someone
 * decided that 80 is "good" — drawn in the same ink as the measurement, and a
 * reader has no way to tell an agreed threshold from a number somebody typed.
 * They also compress: a value near the top of the scale sits in the same band
 * whether it cleared the boundary by a point or by thirty. The band answers
 * "is this acceptable", never "by how much".
 *
 * No rendering engine, deliberately — this is the one chart in the set with
 * nothing to compute. Each row is a single linear scale with no axis, no ticks
 * and no shared plot area, so it is laid out as HTML: the bands and the bar are
 * inline-axis offsets, which means the whole chart mirrors correctly in a
 * right-to-left document, where an SVG drawn in user space would not.
 *
 * @example
 * <BulletChart
 *   title="Service levels against target"
 *   data={[{ name: 'Uptime', value: 99.4, target: 99.9, ranges: [98, 99.5] }]}
 *   domain={[95, 100]}
 * />
 */
export function BulletChart({
  title,
  showTitle,
  description,
  data,
  ranges,
  domain,
  formatValue = defaultTick,
  showScale = false,
  className,
  hideDataTable = false,
  empty,
}: BulletChartProps) {
  const measures = resolve(data, domain, ranges, formatValue)

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
              rows: measures as unknown as Record<string, unknown>[],
              rowKey: 'name',
              columns: [
                { key: 'value', label: 'Value' },
                { key: 'target', label: 'Target' },
                { key: 'rangeLabel', label: 'Range bounds' },
              ],
            }
      }
    >
      {measures.length === 0 ? (
        <ChartEmpty {...(empty || {})} />
      ) : (
        <div className="flex w-full flex-col gap-4">
          {measures.map((measure) => (
            <BulletRow
              key={measure.name}
              measure={measure}
              formatValue={formatValue}
              showScale={showScale}
            />
          ))}
        </div>
      )}
    </ChartFigure>
  )
}

function BulletRow({
  measure,
  formatValue,
  showScale,
}: {
  measure: ResolvedMeasure
  formatValue: (value: number) => string
  showScale: boolean
}) {
  const scale = measure.domain
  const barShare = position(measure.value, scale)
  const targetShare = measure.target === undefined ? null : position(measure.target, scale)

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm text-(--ink)">
          {measure.name}
          {measure.detail && (
            <span className="ms-2 mono-meta text-(--ink-3-aa)">{measure.detail}</span>
          )}
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-(--ink)">
          {formatValue(measure.value)}
          {measure.target !== undefined && (
            <span className="text-(--ink-3-aa)"> / {formatValue(measure.target)}</span>
          )}
        </span>
      </div>

      {/* The graphic repeats what the line above and the hidden table already
          say, so it is out of the accessibility tree entirely rather than
          announced a third time as a stack of empty boxes. */}
      <div
        aria-hidden
        data-slot="bullet-track"
        className="relative h-6 w-full overflow-hidden rounded-(--radius-sm)"
      >
        {measure.bands.map((band) => (
          <span
            key={`${band.from}-${band.to}`}
            data-slot="bullet-band"
            className="absolute inset-y-0 block"
            style={{
              insetInlineStart: pct(position(band.from, scale)),
              inlineSize: pct(position(band.to, scale) - position(band.from, scale)),
              // The one translucent-mark pair in the token layer, because it is
              // the only one that holds a different number on each ground.
              backgroundColor: `color-mix(in srgb, var(--series-1) calc(var(--chart-fill) * ${band.weight} * 100%), transparent)`,
            }}
          />
        ))}

        {/* Solid, and a third of the track's height. The measure is the one
            thing here that is a measurement rather than a judgement, so it is
            the only mark drawn at full weight. */}
        <span
          data-slot="bullet-bar"
          className="absolute block bg-(--series-1)"
          style={{
            insetInlineStart: 0,
            insetBlockStart: pct((1 - BAR_SHARE) / 2),
            blockSize: pct(BAR_SHARE),
            inlineSize: pct(barShare),
          }}
        />

        {targetShare !== null && (
          // A rule ACROSS the bar rather than a second bar beside it: the two
          // are different kinds of number, and the reader has to be able to
          // tell at a glance which one was achieved and which was asked for.
          <span
            data-slot="bullet-target"
            className="absolute inset-y-1 block w-0.5 bg-(--ink)"
            style={{ insetInlineStart: pct(targetShare), marginInlineStart: '-1px' }}
          />
        )}
      </div>

      {showScale && (
        <div className="flex justify-between mono-meta text-(--chart-axis)">
          <span>{formatValue(scale[0])}</span>
          <span>{formatValue(scale[1])}</span>
        </div>
      )}
    </div>
  )
}

export default BulletChart
