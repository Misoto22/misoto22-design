'use client'

import {
  createContext,
  useContext,
  useId,
  useMemo,
  type ComponentProps,
  type ReactNode,
} from 'react'
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  usePlotArea,
} from 'recharts'
import { ChartContainer, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { ChartEmpty, type ChartEmptyProps } from '../lib/empty'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartTooltip } from '../lib/tooltip'
import { BarHatchedFill, SeriesGradient } from '../lib/paint'
import { Annotation, ReferenceBand, ReferenceLine } from '../lib/annotations'
import { axisLabel } from '../lib/axis'
import { defaultTick, formatNumber } from '../lib/format'
import { cn } from '../../lib/cn'
import type { ChartXAxisProps, ChartYAxisProps } from '../BarChart/BarChart'
import type { ChartTooltipSlotProps } from '../AreaChart/AreaChart'

/** The series a chart with only one of them falls back to. */
const DEFAULT_CONFIG: ChartConfig = { count: { label: 'Count' } }

const CHART_MARGIN = { top: 12, right: 12, bottom: 0, left: 12 }

/**
 * The most bins the automatic rule will ever ask for.
 *
 * Freedman–Diaconis divides by the interquartile range, so a distribution with
 * a tight middle and a long tail can ask for tens of thousands of bins — each
 * one a rectangle narrower than a pixel. The cap turns that into a coarse
 * histogram rather than into a hung tab.
 */
const MAX_BINS = 200

/** Bars touch in a histogram; this is the hairline that keeps them countable. */
const BAR_SEPARATION = 1

/** What the bar heights mean. */
export type HistogramMode = 'frequency' | 'density'

/** One bucket, as the chart draws it. */
export interface HistogramBin {
  /** The bucket's lower edge, inclusive. */
  from: number
  /** The bucket's upper edge, exclusive — except the last, which includes it. */
  to: number
  /** How many observations fell in it. */
  count: number
}

/** A bin with everything the marks and the table need resolved. */
interface ResolvedBin extends HistogramBin {
  /** The bucket's midpoint, which is where Recharts positions the bar. */
  center: number
  /** What the bar's length encodes, per `mode`. */
  height: number
  /** The bucket's range, written out — the table's row header. */
  label: string
}

/**
 * The quantile at `p`, interpolated between neighbouring order statistics
 * (R type 7 / NumPy default). Used only to get the IQR the bin-width rule
 * needs.
 */
function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return Number.NaN
  if (sorted.length === 1) return sorted[0]!

  const h = (sorted.length - 1) * p
  const lower = sorted[Math.floor(h)]!
  const upper = sorted[Math.ceil(h)]!
  return lower + (h - Math.floor(h)) * (upper - lower)
}

/**
 * How many bins to cut the data into when the call site does not say.
 *
 * Freedman–Diaconis: bin width is `2 × IQR × n^(-1/3)`, which is the rule that
 * minimises the difference between the drawn histogram and the density it is
 * standing in for, and — because it reads the IQR rather than the range — the
 * one that a single far outlier cannot stretch into one tall bar and forty
 * empty ones.
 *
 * It has one failure mode: a distribution with more than half its mass on one
 * value has an IQR of zero and asks for infinitely many bins. Sturges' rule,
 * `⌈log₂ n⌉ + 1`, is the fallback there.
 */
function binCount(sorted: number[]): number {
  const n = sorted.length
  const span = sorted[n - 1]! - sorted[0]!
  if (span <= 0) return 1

  const iqr = quantile(sorted, 0.75) - quantile(sorted, 0.25)
  const width = 2 * iqr * Math.pow(n, -1 / 3)
  const suggested =
    width > 0 ? Math.ceil(span / width) : Math.ceil(Math.log2(n)) + 1

  return Math.max(1, Math.min(MAX_BINS, suggested))
}

/** The edges the observations are cut at, low to high. */
function binEdges(sorted: number[], bins: number | number[] | undefined): number[] {
  if (Array.isArray(bins)) {
    const edges = [...new Set(bins.filter(Number.isFinite))].sort((a, b) => a - b)
    return edges.length >= 2 ? edges : []
  }

  const low = sorted[0]!
  const high = sorted[sorted.length - 1]!
  // Every observation on one value still has to be drawn as something, and a
  // zero-width bar is nothing. One unit of room either side is the smallest
  // honest answer: one bar, centred on the only value there is.
  if (high === low) return [low - 0.5, low + 0.5]

  const count = Math.max(1, Math.min(MAX_BINS, typeof bins === 'number' ? bins : binCount(sorted)))
  const width = (high - low) / count
  return Array.from({ length: count + 1 }, (_, index) => low + index * width)
}

/** Raw observations, cut into buckets. */
function bin(values: number[], bins: number | number[] | undefined): HistogramBin[] {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (sorted.length === 0) return []

  const edges = binEdges(sorted, bins)
  if (edges.length < 2) return []

  const counts = new Array<number>(edges.length - 1).fill(0)
  for (const value of sorted) {
    if (value < edges[0]! || value > edges[edges.length - 1]!) continue
    // The top edge belongs to the last bucket. Without that the largest
    // observation falls out of the histogram entirely, which is exactly the
    // point a reader is most likely to be looking for.
    let index = counts.length - 1
    for (let i = 0; i < counts.length; i += 1) {
      if (value < edges[i + 1]!) {
        index = i
        break
      }
    }
    counts[index] = counts[index]! + 1
  }

  return counts.map((count, index) => ({ from: edges[index]!, to: edges[index + 1]!, count }))
}

/** The bins with their midpoints, drawn heights and printed ranges. */
function resolve(
  bins: HistogramBin[],
  mode: HistogramMode,
  formatValue: (value: number) => string,
): ResolvedBin[] {
  const total = bins.reduce((sum, entry) => sum + entry.count, 0)

  return bins.map((entry) => {
    const width = entry.to - entry.from
    return {
      ...entry,
      center: entry.from + width / 2,
      // Density is `count / (n × width)`, so the bars enclose an area of 1 and
      // uneven buckets stop lying: under frequency a bucket twice as wide
      // stands twice as tall for the same underlying rate.
      height:
        mode === 'density' && total > 0 && width > 0 ? entry.count / (total * width) : entry.count,
      label: `${formatValue(entry.from)} – ${formatValue(entry.to)}`,
    }
  })
}

interface HistogramContextValue {
  config: ChartConfig
  seriesKey: string
  bins: ResolvedBin[]
  domain: [number, number]
  mode: HistogramMode
  total: number
  formatValue: (value: number) => string
}

const HistogramContext = createContext<HistogramContextValue | null>(null)

function useHistogram(): HistogramContextValue {
  const context = useContext(HistogramContext)
  if (!context) throw new Error('A histogram part must be rendered inside <Histogram>')
  return context
}

/** Density values are small and unequal; the count axis is integers. */
const densityTick = formatNumber({ style: 'plain', fractionDigits: 3 })

export interface HistogramProps {
  /**
   * The single series — its label and its paint. Only the FIRST entry is read;
   * a histogram has one distribution and as many bars as it has buckets.
   */
  config?: ChartConfig
  /**
   * The raw observations, in any order. Binned for you by `bins`.
   *
   * Give this OR `data`, not both — `data` wins if both arrive.
   */
  values?: number[]
  /**
   * Buckets that were counted somewhere else — by a database, by a sketch, by
   * a metrics backend that only ever ships histograms.
   *
   * Uneven bucket widths are drawn at their real widths, which is the whole
   * reason this takes edges rather than labels. Set `mode="density"` when they
   * are uneven, or the wide buckets will read as tall ones.
   */
  data?: HistogramBin[]
  /**
   * How to cut `values` up: a number of equal-width bins, or the explicit
   * edges. Defaults to Freedman–Diaconis (`2 × IQR × n^(-1/3)`), falling back
   * to Sturges when the interquartile range is zero.
   */
  bins?: number | number[]
  /**
   * What the bar heights mean.
   *
   * `frequency` is the count in each bucket and is what a reader assumes.
   * `density` is `count / (n × bin width)`, so the total area is 1 — which is
   * what makes two histograms of different sample sizes comparable, and what
   * makes uneven buckets honest.
   */
  mode?: HistogramMode
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /** The composed parts — axes, grid, tooltip, and `<Histogram.Bars>`. */
  children: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Escape hatch onto the raw Recharts chart element. */
  chartProps?: ComponentProps<typeof RechartsBarChart>
  /** Formats the measured values — bin edges, ticks, the tooltip's heading. */
  formatValue?: (value: number) => string
  /** Drops the hidden table view. Only correct when the page prints the data itself. */
  hideDataTable?: boolean
  /**
   * What the chart shows when it has nothing to draw. `false` keeps the axes,
   * for a chart whose emptiness is itself the reading.
   */
  empty?: ChartEmptyProps | false
}

/**
 * The shape of one distribution — where the mass sits, how it leans, whether
 * there is more than one hump in it.
 *
 * The form that answers what a `<BoxPlot>` structurally cannot: two clusters,
 * a hard floor, a pile-up at a timeout value. Reach for the box plot when
 * several distributions have to be compared side by side, and for this one when
 * a single distribution has to be understood.
 *
 * **A histogram's shape is a property of its bin width, not only of its data.**
 * The same numbers cut into eight buckets and into eighty are two different
 * pictures, and a gap between two humps can be created or erased by moving a
 * bin edge. That is not a defect to be fixed, it is what binning IS, and the
 * defence is to say which rule drew the picture — the default here is
 * Freedman–Diaconis — and to look at more than one width before believing a
 * feature. Uneven buckets add a second trap: under `frequency` a bucket twice
 * as wide stands twice as tall at the same underlying rate, which is what
 * `mode="density"` exists to correct.
 *
 * Recharts earns its place here for the axes, the grid and the tooltip, but not
 * for the bars: a bar chart's bars are positioned by CATEGORY and a histogram's
 * are positioned and SIZED by a continuous measurement. So the x axis is
 * numeric and each bar is drawn from its own two edges — which is what lets an
 * uneven bucket be as wide as it really is instead of being flattened into an
 * equal slot beside its neighbours.
 *
 * @example
 * <Histogram title="Response times" values={samples} bins={20}>
 *   <Histogram.Grid />
 *   <Histogram.XAxis label="ms" />
 *   <Histogram.YAxis />
 *   <Histogram.Tooltip />
 *   <Histogram.Bars />
 * </Histogram>
 *
 * @example
 * // Buckets that arrived already counted, with uneven widths.
 * <Histogram title="Payload size" data={buckets} mode="density">
 *   <Histogram.XAxis />
 *   <Histogram.YAxis />
 *   <Histogram.Bars />
 * </Histogram>
 */
export function Histogram({
  config = DEFAULT_CONFIG,
  values,
  data,
  bins,
  mode = 'frequency',
  title,
  showTitle,
  description,
  children,
  className,
  chartProps,
  formatValue = defaultTick,
  hideDataTable = false,
  empty,
}: HistogramProps) {
  const chartId = useId().replace(/:/g, '')
  const seriesKey = Object.keys(config)[0] ?? 'count'

  const resolved = useMemo(
    () => resolve(data ?? bin(values ?? [], bins), mode, formatValue),
    [data, values, bins, mode, formatValue],
  )

  const domain = useMemo<[number, number]>(
    () =>
      resolved.length > 0 ? [resolved[0]!.from, resolved[resolved.length - 1]!.to] : [0, 1],
    [resolved],
  )

  const total = useMemo(
    () => resolved.reduce((sum, entry) => sum + entry.count, 0),
    [resolved],
  )

  const context = useMemo<HistogramContextValue>(
    () => ({ config, seriesKey, bins: resolved, domain, mode, total, formatValue }),
    [config, seriesKey, resolved, domain, mode, total, formatValue],
  )

  const isEmpty = empty !== false && resolved.length === 0

  return (
    <HistogramContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={
          hideDataTable
            ? false
            : {
                rows: resolved as unknown as Record<string, unknown>[],
                rowKey: 'label',
                columns: [
                  { key: 'count', label: 'Count' },
                  ...(mode === 'density' ? [{ key: 'height', label: 'Density' }] : []),
                ],
              }
        }
      >
        {isEmpty ? (
          <ChartEmpty {...(empty || {})} />
        ) : (
          <ChartContainer config={config}>
            <RechartsBarChart
              id={chartId}
              accessibilityLayer
              margin={CHART_MARGIN}
              data={resolved}
              {...chartProps}
            >
              {children}
            </RechartsBarChart>
          </ChartContainer>
        )}
      </ChartFigure>
    </HistogramContext.Provider>
  )
}

export interface HistogramBarsProps {
  /**
   * The bars' corner. Zero by default, unlike `<BarChart>`: a histogram's bars
   * are one continuous surface cut into pieces, and a rounded corner draws a
   * gap between two buckets that are touching.
   */
  radius?: number
  /** Adds a 45° texture, for a histogram printed in greyscale or overlaid. */
  hatched?: boolean
  /** Escape hatch onto the underlying Recharts bar. */
  barProps?: ComponentProps<typeof RechartsBar>
}

/**
 * The bars themselves, each drawn between its own two bin edges.
 *
 * Recharts positions a bar on a numeric axis by CENTRING it on the value and
 * sizing it from the band, which would draw every bucket the same width. The
 * shape re-derives both edges from the plot area and the axis domain instead,
 * so a bucket is exactly as wide as the range it counts.
 */
function Bars({ radius = 0, hatched = false, barProps }: HistogramBarsProps) {
  const { config, seriesKey } = useHistogram()
  const id = useId().replace(/:/g, '')

  return (
    <>
      <RechartsBar
        dataKey="height"
        name={seriesKey}
        isAnimationActive={false}
        fill={`url(#${id}-colors-${seriesKey})`}
        shape={(props: unknown) => (
          <BinShape {...(props as BinGeometry)} id={id} seriesKey={seriesKey} radius={radius} hatched={hatched} />
        )}
        activeBar={(props: unknown) => (
          <BinShape {...(props as BinGeometry)} id={id} seriesKey={seriesKey} radius={radius} hatched={hatched} />
        )}
        {...barProps}
      />
      <defs>
        <SeriesGradient id={id} dataKey={seriesKey} config={config} direction="vertical" />
        {hatched && <BarHatchedFill id={id} dataKey={seriesKey} />}
      </defs>
    </>
  )
}

/** The geometry Recharts hands a custom bar shape, plus the bin behind it. */
interface BinGeometry {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: ResolvedBin
}

interface BinShapeProps extends BinGeometry {
  id: string
  seriesKey: string
  radius: number
  hatched: boolean
}

/** One bucket, spanning its real width on the measured axis. */
function BinShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  id,
  seriesKey,
  radius,
  hatched,
}: BinShapeProps) {
  const plot = usePlotArea()
  const { domain } = useHistogram()

  if (!payload) return null

  const [low, high] = domain
  const span = high - low
  const edges =
    plot && span > 0
      ? {
          start: plot.x + ((payload.from - low) / span) * plot.width,
          end: plot.x + ((payload.to - low) / span) * plot.width,
        }
      : // Before the chart has measured itself there is no plot to map onto,
        // and Recharts' own band is the only geometry available.
        { start: x, end: x + width }

  const drawn = Math.max(1, edges.end - edges.start - BAR_SEPARATION)

  return (
    <rect
      x={edges.start + BAR_SEPARATION / 2}
      y={y}
      width={drawn}
      height={Math.max(0, height)}
      rx={radius || undefined}
      fill={hatched ? `url(#${id}-hatched-${seriesKey})` : `url(#${id}-colors-${seriesKey})`}
    />
  )
}

/** The measured axis. Numeric, because the buckets are a cut of a real scale. */
function XAxis({
  dataKey = 'center',
  type = 'number',
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  label,
  domain,
  tickFormatter,
  ...rest
}: ChartXAxisProps) {
  const { domain: measured, formatValue } = useHistogram()

  return (
    <RechartsXAxis
      dataKey={dataKey}
      type={type}
      // Pinned to the outermost bin edges rather than left to Recharts, which
      // would pad the domain out to round numbers and leave the first and last
      // bars floating off their own edges.
      domain={domain ?? measured}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      tickFormatter={tickFormatter ?? formatValue}
      {...rest}
    >
      {axisLabel(label, 'x')}
    </RechartsXAxis>
  )
}

/** The count axis, or the density axis. */
function YAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  width = 'auto',
  label,
  tickFormatter,
  ...rest
}: ChartYAxisProps) {
  const { mode } = useHistogram()

  return (
    <RechartsYAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      width={width}
      tickFormatter={tickFormatter ?? (mode === 'density' ? densityTick : defaultTick)}
      {...rest}
    >
      {axisLabel(label ?? (mode === 'density' ? 'Density' : undefined), 'y')}
    </RechartsYAxis>
  )
}

/** Rules across the count axis. */
function Grid({
  strokeDasharray = '3 3',
  vertical = false,
  ...rest
}: ComponentProps<typeof CartesianGrid>) {
  return <CartesianGrid strokeDasharray={strokeDasharray} vertical={vertical} {...rest} />
}

/**
 * The hover panel, printing the bucket's range rather than its midpoint.
 *
 * The generic tooltip would head the panel with the centre value, which is a
 * number no observation necessarily has. What a reader wants from a histogram
 * bar is the interval it counts and how much of the sample fell in it.
 */
function Tooltip({ variant = 'solid', roundness = 'lg', defaultIndex }: ChartTooltipSlotProps) {
  const { mode, total, formatValue } = useHistogram()

  return (
    <ChartTooltip
      cursor={false}
      defaultIndex={defaultIndex}
      content={(props) => {
        const { active, payload } = props as unknown as {
          active?: boolean
          payload?: { payload?: ResolvedBin }[]
        }
        const entry = payload?.[0]?.payload
        if (!active || !entry) return <span className="p-4" />

        const share = total > 0 ? entry.count / total : 0

        return (
          <div
            className={cn(
              'grid min-w-40 gap-1.5 border border-(--rule-2) px-2.5 py-1.5 text-xs',
              roundness === 'sm' && 'rounded-(--radius-sm)',
              roundness === 'md' && 'rounded-(--radius)',
              roundness === 'lg' && 'rounded-(--radius-lg)',
              variant === 'frosted'
                ? 'bg-(--chart-surface)/75 backdrop-blur-sm'
                : 'bg-(--chart-surface)',
            )}
          >
            <div className="font-medium text-(--ink)">
              {formatValue(entry.from)} – {formatValue(entry.to)}
            </div>
            <div className="flex justify-between gap-4 leading-none">
              <span className="text-(--ink-3-aa)">Count</span>
              <span className="font-mono font-medium tabular-nums text-(--ink)">
                {entry.count.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4 leading-none">
              <span className="text-(--ink-3-aa)">Share</span>
              <span className="font-mono font-medium tabular-nums text-(--ink)">
                {(share * 100).toFixed(1)}%
              </span>
            </div>
            {mode === 'density' && (
              <div className="flex justify-between gap-4 leading-none">
                <span className="text-(--ink-3-aa)">Density</span>
                <span className="font-mono font-medium tabular-nums text-(--ink)">
                  {densityTick(entry.height)}
                </span>
              </div>
            )}
          </div>
        )
      }}
    />
  )
}

/** The decorative plate behind the plot. */
function Background({ variant }: { variant: ChartBackgroundVariant }) {
  return <ChartBackground variant={variant} />
}

Histogram.Bars = Bars
Histogram.XAxis = XAxis
Histogram.YAxis = YAxis
Histogram.Grid = Grid
Histogram.Tooltip = Tooltip
Histogram.Background = Background
Histogram.ReferenceLine = ReferenceLine
Histogram.ReferenceBand = ReferenceBand
Histogram.Annotation = Annotation

export default Histogram
