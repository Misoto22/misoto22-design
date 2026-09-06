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
import { type ChartEmptyProps } from '../lib/empty'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartTooltip } from '../lib/tooltip'
import { SeriesGradient } from '../lib/paint'
import { Annotation, ReferenceBand, ReferenceLine } from '../lib/annotations'
import { axisLabel } from '../lib/axis'
import { defaultTick } from '../lib/format'
import { cn } from '../../lib/cn'
import type { ChartXAxisProps, ChartYAxisProps } from '../BarChart/BarChart'
import type { ChartTooltipSlotProps } from '../AreaChart/AreaChart'

/** The series a chart with only one of them falls back to. */
const DEFAULT_CONFIG: ChartConfig = { value: { label: 'Value' } }

/** Room for the first and last category label, and for a whisker cap. */
const CHART_MARGIN = { top: 12, right: 12, bottom: 0, left: 12 }

/**
 * Tukey's multiplier. A point past `q3 + 1.5 × IQR` is drawn as itself rather
 * than swept into a whisker.
 *
 * 1.5 is a convention, not a test: on normal data it flags roughly 0.7% of
 * points, and on skewed data it flags a great many that are not anomalies at
 * all. It decides what the picture DRAWS, never what the reader concludes.
 */
const TUKEY_FENCE = 1.5

/**
 * The notch's half-width, as a multiple of `IQR / √n`.
 *
 * 1.58 is McGill, Tukey and Larsen's: it makes two non-overlapping notches
 * roughly a 95% test of "these medians differ". Roughly, and only for
 * independent samples of similar shape — which is why the notch is opt-in.
 */
const NOTCH_FACTOR = 1.58

/** How far the box pinches in at the median, as a share of its width. */
const NOTCH_INSET = 0.18

/** How much room the value axis leaves above and below the data. */
const DOMAIN_PADDING = 0.06

/** Which way the boxes run. */
export type BoxPlotOrientation = 'vertical' | 'horizontal'

/** A category summarised into the five numbers a box is drawn from. */
export interface BoxPlotSummary {
  /** What the box describes. Doubles as its key, so it must be unique. */
  name: string
  /** The low whisker's end — the smallest observation inside the fence. */
  min: number
  q1: number
  median: number
  q3: number
  /** The high whisker's end — the largest observation inside the fence. */
  max: number
  /** Points outside the fences, drawn one dot each. */
  outliers?: number[]
  /**
   * How many observations the box stands for.
   *
   * Needed for a notch, and worth carrying anyway: a box drawn from six points
   * and a box drawn from six thousand look identical, and only one of them
   * means anything.
   */
  count?: number
}

/** A category handed over as raw observations, for the chart to summarise. */
export interface BoxPlotSample {
  /** What the box describes. Doubles as its key, so it must be unique. */
  name: string
  /** Every observation in this category, in any order. */
  values: number[]
  min?: never
  q1?: never
  median?: never
  q3?: never
  max?: never
}

/**
 * One category: either the raw observations, or the summary itself.
 *
 * Both forms exist because both are real. A chart fed from a warehouse gets
 * percentiles back from the query and never sees a row; a chart fed from a
 * browser has the array in hand and should not have to compute quartiles to
 * draw them.
 */
export type BoxPlotDatum = BoxPlotSample | (BoxPlotSummary & { values?: never })

/** A summary with everything the marks need resolved. */
interface ResolvedBox extends BoxPlotSummary {
  outliers: number[]
  outlierCount: number
}

/**
 * The quantile at `p`, interpolated between the two neighbouring order
 * statistics.
 *
 * This is the R type 7 / NumPy default definition, and it is stated here
 * because there are nine of them and they disagree: on `[1, 2, 3, 4]` the
 * lower quartile is 1.75 under this rule and 1.5 under the "median of the
 * lower half" rule most people were taught. Two box plots of the same data
 * drawn under different rules are two different pictures, so the package
 * picks one and says which.
 */
function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return Number.NaN
  if (sorted.length === 1) return sorted[0]!

  const h = (sorted.length - 1) * p
  const lower = sorted[Math.floor(h)]!
  const upper = sorted[Math.ceil(h)]!
  return lower + (h - Math.floor(h)) * (upper - lower)
}

/** Raw observations, reduced to a five-number summary plus its outliers. */
function summarise(name: string, values: number[]): ResolvedBox | null {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (clean.length === 0) return null

  const q1 = quantile(clean, 0.25)
  const median = quantile(clean, 0.5)
  const q3 = quantile(clean, 0.75)
  const iqr = q3 - q1
  const low = q1 - TUKEY_FENCE * iqr
  const high = q3 + TUKEY_FENCE * iqr

  const inside = clean.filter((value) => value >= low && value <= high)
  const outliers = clean.filter((value) => value < low || value > high)

  return {
    name,
    // The whiskers stop at the most extreme observation still inside the
    // fence, not at the fence itself. A whisker drawn to `q1 - 1.5 × IQR`
    // claims a reading that may not exist in the data.
    min: inside.length > 0 ? inside[0]! : clean[0]!,
    q1,
    median,
    q3,
    max: inside.length > 0 ? inside[inside.length - 1]! : clean[clean.length - 1]!,
    outliers,
    outlierCount: outliers.length,
    count: clean.length,
  }
}

/** Every datum, in the one shape the marks read. */
function resolve(data: BoxPlotDatum[]): ResolvedBox[] {
  return data.flatMap((datum) => {
    if (datum.values) {
      const summary = summarise(datum.name, datum.values)
      return summary ? [summary] : []
    }
    const outliers = datum.outliers ?? []
    return [{ ...datum, outliers, outlierCount: outliers.length }]
  })
}

/**
 * The value axis's span.
 *
 * Not anchored at zero, unlike a bar chart's: a box plot compares
 * DISTRIBUTIONS, and dragging the axis to zero to be honest about bar length
 * flattens every box into the same band of pixels. The honesty a box plot owes
 * is a labelled axis, which it has.
 */
function valueDomain(boxes: ResolvedBox[]): [number, number] {
  const values = boxes.flatMap((box) => [box.min, box.max, ...box.outliers])
  if (values.length === 0) return [0, 1]

  const low = Math.min(...values)
  const high = Math.max(...values)
  const pad = (high - low || Math.abs(high) || 1) * DOMAIN_PADDING
  return [low - pad, high + pad]
}

interface BoxPlotContextValue {
  config: ChartConfig
  seriesKey: string
  boxes: ResolvedBox[]
  isHorizontal: boolean
  domain: [number, number]
  formatValue: (value: number) => string
}

const BoxPlotContext = createContext<BoxPlotContextValue | null>(null)

function useBoxPlot(): BoxPlotContextValue {
  const context = useContext(BoxPlotContext)
  if (!context) throw new Error('A box plot part must be rendered inside <BoxPlot>')
  return context
}

export interface BoxPlotProps {
  /**
   * The single series — its label and its paint. Only the FIRST entry is read;
   * a box plot has one measurement and as many categories as it has boxes.
   */
  config?: ChartConfig
  /** One entry per category, as raw observations or as a summary. */
  data: BoxPlotDatum[]
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /** The composed parts — axes, grid, tooltip, and `<BoxPlot.Boxes>`. */
  children: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Escape hatch onto the raw Recharts chart element. */
  chartProps?: ComponentProps<typeof RechartsBarChart>
  /**
   * Which way the boxes run. Reach for `horizontal` when the category names
   * are long enough to need rotating under a column.
   */
  orientation?: BoxPlotOrientation
  /** Formats every number the chart prints — ticks, tooltip, table. */
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
 * The spread of a measurement, per category — median, middle half, reach, and
 * the points that sit outside it.
 *
 * The form to reach for when the question is "how variable is this", and the
 * one that answers it in a tenth of the ink a histogram per category would
 * take. Six response-time distributions fit across one screen as six boxes;
 * as six histograms they do not fit at all.
 *
 * **What a box plot hides is multimodality.** A box is five numbers, and five
 * numbers cannot tell a single hump from two. A bimodal distribution — a fast
 * cache path and a slow database path, two cohorts inside one average — draws
 * exactly the same box as a smooth one centred in the same place, and the
 * reader has no way to tell from the picture that the middle of the box is a
 * value almost nothing takes. It also hides sample size: a box over six points
 * and a box over six thousand are drawn identically, which is why `count` is
 * worth carrying and why a notch, which does read `count`, is worth turning on
 * when medians are being compared. When the SHAPE of one distribution is the
 * question, reach for `<Histogram>`; when there are few enough observations to
 * draw them all, reach for `<ScatterChart>` and plot the points.
 *
 * Recharts earns its place here: the boxes need a shared value axis with real
 * ticks, a category axis, a grid and a tooltip, which is most of a cartesian
 * chart. What it does not have is a box mark, so each box is drawn as a custom
 * shape over a range bar — the bar supplies the category band and the scale,
 * and the glyph inside it is ours.
 *
 * @example
 * <BoxPlot title="Response time by region" data={regions}>
 *   <BoxPlot.Grid />
 *   <BoxPlot.XAxis />
 *   <BoxPlot.YAxis label="ms" />
 *   <BoxPlot.Tooltip />
 *   <BoxPlot.Boxes showOutliers />
 * </BoxPlot>
 *
 * @example
 * // Raw observations, summarised for you with Tukey's fences.
 * const data = [{ name: 'Sydney', values: [180, 194, 210, 205, 640] }]
 */
export function BoxPlot({
  config = DEFAULT_CONFIG,
  data,
  title,
  showTitle,
  description,
  children,
  className,
  chartProps,
  orientation = 'vertical',
  formatValue = defaultTick,
  hideDataTable = false,
  empty,
}: BoxPlotProps) {
  const chartId = useId().replace(/:/g, '')
  const isHorizontal = orientation === 'horizontal'
  const seriesKey = Object.keys(config)[0] ?? 'value'

  const boxes = useMemo(() => resolve(data), [data])
  const domain = useMemo(() => valueDomain(boxes), [boxes])

  const context = useMemo<BoxPlotContextValue>(
    () => ({ config, seriesKey, boxes, isHorizontal, domain, formatValue }),
    [config, seriesKey, boxes, isHorizontal, domain, formatValue],
  )

  const isEmpty = empty !== false && boxes.length === 0

  return (
    <BoxPlotContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={
          hideDataTable
            ? false
            : {
                rows: boxes as unknown as Record<string, unknown>[],
                rowKey: 'name',
                columns: [
                  { key: 'min', label: 'Minimum' },
                  { key: 'q1', label: 'Lower quartile' },
                  { key: 'median', label: 'Median' },
                  { key: 'q3', label: 'Upper quartile' },
                  { key: 'max', label: 'Maximum' },
                  { key: 'outlierCount', label: 'Outliers' },
                ],
              }
        }
        isEmpty={isEmpty}
        empty={empty}
      >
        <ChartContainer config={config}>
          <RechartsBarChart
            id={chartId}
            accessibilityLayer
            margin={CHART_MARGIN}
            // Recharts' `layout` names the axis the CATEGORIES run along,
            // which is the opposite of what a reader means by a horizontal
            // chart. The flip is done once, here.
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            data={boxes}
            barCategoryGap="30%"
            {...chartProps}
          >
            {children}
          </RechartsBarChart>
        </ChartContainer>
      </ChartFigure>
    </BoxPlotContext.Provider>
  )
}

export interface BoxPlotBoxesProps {
  /** Draws the points outside the fences as individual dots. */
  showOutliers?: boolean
  /**
   * Pinches the box in at the median by `1.58 × IQR / √n`.
   *
   * A confidence interval on the median drawn INSIDE the shape it belongs to,
   * which is the only place a reader will actually look at it. Needs `count`
   * on every box; a box without one is drawn square.
   */
  notch?: boolean
  /** Escape hatch onto the range bar the boxes are drawn over. */
  barProps?: ComponentProps<typeof RechartsBar>
}

/**
 * The boxes themselves.
 *
 * One range bar per category spanning `min` to `max`, replaced by a custom
 * shape: the bar is there for the category band and the scale, and nothing of
 * it is painted.
 */
function Boxes({ showOutliers = true, notch = false, barProps }: BoxPlotBoxesProps) {
  const { config, seriesKey, isHorizontal } = useBoxPlot()
  const id = useId().replace(/:/g, '')

  return (
    <>
      <RechartsBar
        // The whisker span. Recharts reads a two-element value as a floating
        // bar, which is what puts the rect between two data values rather than
        // between a value and the baseline.
        dataKey={(row: unknown) => {
          const box = row as ResolvedBox
          return [box.min, box.max]
        }}
        name={seriesKey}
        isAnimationActive={false}
        fill="transparent"
        shape={(props: unknown) => (
          <BoxShape
            {...(props as BoxGeometry)}
            id={id}
            seriesKey={seriesKey}
            isHorizontal={isHorizontal}
            showOutliers={showOutliers}
            notch={notch}
          />
        )}
        activeBar={(props: unknown) => (
          <BoxShape
            {...(props as BoxGeometry)}
            id={id}
            seriesKey={seriesKey}
            isHorizontal={isHorizontal}
            showOutliers={showOutliers}
            notch={notch}
          />
        )}
        {...barProps}
      />
      <defs>
        <SeriesGradient
          id={id}
          dataKey={seriesKey}
          config={config}
          direction={isHorizontal ? 'horizontal' : 'vertical'}
        />
      </defs>
    </>
  )
}

/** The geometry Recharts hands a custom bar shape, plus the row behind it. */
interface BoxGeometry {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: ResolvedBox
}

interface BoxShapeProps extends BoxGeometry {
  id: string
  seriesKey: string
  isHorizontal: boolean
  showOutliers: boolean
  notch: boolean
}

/**
 * One drawn box: whisker, caps, box, median, and any outliers.
 *
 * The value scale is recovered from the bar's own rectangle — `min` sits at one
 * end of it and `max` at the other, and the axis between them is linear, so any
 * other value is one interpolation away, INCLUDING the outliers past both ends.
 * Reading the scale back out of the geometry rather than re-deriving it is what
 * keeps the glyph aligned with the ticks when a call site overrides the axis's
 * domain. A category whose whole distribution is one repeated value gives a
 * rectangle with no extent to read, and only there does it fall back to the
 * plot area and the chart's own domain.
 */
function BoxShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  id,
  seriesKey,
  isHorizontal,
  showOutliers,
  notch,
}: BoxShapeProps) {
  const plot = usePlotArea()
  const { domain } = useBoxPlot()

  if (!payload) return null

  const box = payload
  const span = box.max - box.min
  const extent = isHorizontal ? width : height

  const scale = (value: number): number => {
    if (span !== 0 && extent > 0) {
      return isHorizontal
        ? x + ((value - box.min) / span) * width
        : y + ((box.max - value) / span) * height
    }
    if (!plot) return isHorizontal ? x : y
    const [low, high] = domain
    const range = high - low || 1
    return isHorizontal
      ? plot.x + ((value - low) / range) * plot.width
      : plot.y + ((high - value) / range) * plot.height
  }

  // The band the glyph is centred in: the bar's own thickness across the
  // category axis.
  const bandStart = isHorizontal ? y : x
  const bandSize = isHorizontal ? height : width
  const centre = bandStart + bandSize / 2
  const capHalf = bandSize / 4
  const dotRadius = Math.max(2, Math.min(3.5, bandSize / 8))

  const fill = `url(#${id}-colors-${seriesKey})`
  const stroke = 'var(--ink)'

  const whisker = (from: number, to: number, atCap: boolean) => {
    const a = scale(from)
    const b = scale(to)
    return (
      <>
        <line
          x1={isHorizontal ? a : centre}
          y1={isHorizontal ? centre : a}
          x2={isHorizontal ? b : centre}
          y2={isHorizontal ? centre : b}
          stroke={stroke}
          strokeWidth={1}
        />
        {atCap && (
          <line
            x1={isHorizontal ? b : centre - capHalf}
            y1={isHorizontal ? centre - capHalf : b}
            x2={isHorizontal ? b : centre + capHalf}
            y2={isHorizontal ? centre + capHalf : b}
            stroke={stroke}
            strokeWidth={1}
          />
        )}
      </>
    )
  }

  const q1px = scale(box.q1)
  const q3px = scale(box.q3)
  const medianPx = scale(box.median)
  const boxFrom = Math.min(q1px, q3px)
  const boxSize = Math.abs(q3px - q1px)

  const notchBounds = notch ? notchAt(box) : null
  const body = notchBounds ? (
    <polygon
      points={notchPoints({
        bandStart,
        bandSize,
        isHorizontal,
        q1: q1px,
        q3: q3px,
        median: medianPx,
        low: scale(notchBounds[0]),
        high: scale(notchBounds[1]),
      })}
      fill={fill}
      fillOpacity="var(--chart-fill)"
      stroke={stroke}
      strokeWidth={1}
      strokeLinejoin="round"
    />
  ) : (
    <rect
      x={isHorizontal ? boxFrom : bandStart}
      y={isHorizontal ? bandStart : boxFrom}
      width={isHorizontal ? Math.max(1, boxSize) : bandSize}
      height={isHorizontal ? bandSize : Math.max(1, boxSize)}
      fill={fill}
      // The box is a region, not a value, so it takes the translucent-mark
      // token rather than a literal — the one number in the system that is
      // different on each ground.
      fillOpacity="var(--chart-fill)"
      stroke={stroke}
      strokeWidth={1}
    />
  )

  return (
    <g>
      {whisker(box.q1, box.min, true)}
      {whisker(box.q3, box.max, true)}
      {body}
      {/* The median is the one reading a box plot exists to give, so it is the
          heaviest stroke in the glyph — everything else around it is a
          hairline. */}
      <line
        x1={isHorizontal ? medianPx : bandStart}
        y1={isHorizontal ? bandStart : medianPx}
        x2={isHorizontal ? medianPx : bandStart + bandSize}
        y2={isHorizontal ? bandStart + bandSize : medianPx}
        stroke={stroke}
        strokeWidth={2}
      />
      {showOutliers &&
        box.outliers.map((value, index) => (
          <circle
            key={`${value}-${index}`}
            cx={isHorizontal ? scale(value) : centre}
            cy={isHorizontal ? centre : scale(value)}
            r={dotRadius}
            // Hollow, so a cluster of outliers at one value still reads as
            // several points rather than as one blot.
            fill="var(--chart-surface)"
            stroke={stroke}
            strokeWidth={1}
          />
        ))}
    </g>
  )
}

/** The notch's bounds, or null when this box cannot carry one. */
function notchAt(box: ResolvedBox): [number, number] | null {
  if (!box.count || box.count <= 0) return null

  const half = (NOTCH_FACTOR * (box.q3 - box.q1)) / Math.sqrt(box.count)
  // Clamped into the box: a notch wider than the middle half would be drawn
  // turning the box inside out, which is the standard "the sample is too small
  // for this comparison" artefact and reads as a rendering fault instead.
  return [Math.max(box.q1, box.median - half), Math.min(box.q3, box.median + half)]
}

/** The eight-sided box a notch turns the rectangle into. */
function notchPoints({
  bandStart,
  bandSize,
  isHorizontal,
  q1,
  q3,
  median,
  low,
  high,
}: {
  bandStart: number
  bandSize: number
  isHorizontal: boolean
  q1: number
  q3: number
  median: number
  low: number
  high: number
}): string {
  const near = bandStart
  const far = bandStart + bandSize
  const inset = bandSize * NOTCH_INSET
  const value = [q1, low, median, high, q3]
  const across = [near, near, near + inset, near, near]
  const back = [far, far, far - inset, far, far]

  const points = [
    ...value.map((v, i) => [v, across[i]] as const),
    ...value.map((v, i) => [v, back[i]] as const).reverse(),
  ]

  return points
    .map(([v, a]) => (isHorizontal ? `${v},${a}` : `${a},${v}`))
    .join(' ')
}

/**
 * The category axis when the boxes stand up, the value axis when they lie down.
 * The type is resolved from the orientation so a consumer never has to know
 * which way round Recharts wants it.
 */
function XAxis({
  dataKey,
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  type,
  label,
  tickFormatter,
  domain,
  ...rest
}: ChartXAxisProps) {
  const { isHorizontal, domain: valueSpan, formatValue } = useBoxPlot()

  return (
    <RechartsXAxis
      dataKey={dataKey ?? (isHorizontal ? undefined : 'name')}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      type={type ?? (isHorizontal ? 'number' : 'category')}
      domain={domain ?? (isHorizontal ? valueSpan : undefined)}
      tickFormatter={tickFormatter ?? (isHorizontal ? formatValue : undefined)}
      {...rest}
    >
      {axisLabel(label, 'x')}
    </RechartsXAxis>
  )
}

/** The other axis, resolved the same way. */
function YAxis({
  dataKey,
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  width = 'auto',
  type,
  label,
  tickFormatter,
  domain,
  ...rest
}: ChartYAxisProps) {
  const { isHorizontal, domain: valueSpan, formatValue } = useBoxPlot()

  return (
    <RechartsYAxis
      dataKey={dataKey ?? (isHorizontal ? 'name' : undefined)}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      width={width}
      type={type ?? (isHorizontal ? 'category' : 'number')}
      domain={domain ?? (isHorizontal ? undefined : valueSpan)}
      tickFormatter={tickFormatter ?? (isHorizontal ? undefined : formatValue)}
      {...rest}
    >
      {axisLabel(label, 'y')}
    </RechartsYAxis>
  )
}

/** Rules across the value axis — whichever axis that is for this orientation. */
function Grid({
  strokeDasharray = '3 3',
  vertical,
  horizontal,
  ...rest
}: ComponentProps<typeof CartesianGrid>) {
  const { isHorizontal } = useBoxPlot()
  return (
    <CartesianGrid
      strokeDasharray={strokeDasharray}
      vertical={vertical ?? isHorizontal}
      horizontal={horizontal ?? !isHorizontal}
      {...rest}
    />
  )
}

/**
 * The hover panel, printing all five numbers.
 *
 * The generic tooltip prints one value per series, and a box has five — so it
 * is the whole summary or nothing. Without it the reader can only read the
 * median off the axis, which is the one thing the shape already gives them.
 */
function Tooltip({ variant = 'solid', roundness = 'lg', defaultIndex }: ChartTooltipSlotProps) {
  const { formatValue } = useBoxPlot()

  return (
    <ChartTooltip
      cursor={false}
      defaultIndex={defaultIndex}
      content={(props) => {
        const { active, payload } = props as unknown as {
          active?: boolean
          payload?: { payload?: ResolvedBox }[]
        }
        const box = payload?.[0]?.payload
        if (!active || !box) return <span className="p-4" />

        const rows: [string, number][] = [
          ['Maximum', box.max],
          ['Upper quartile', box.q3],
          ['Median', box.median],
          ['Lower quartile', box.q1],
          ['Minimum', box.min],
        ]

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
            <div className="font-medium text-(--ink)">{box.name}</div>
            {rows.map(([name, value]) => (
              <div key={name} className="flex justify-between gap-4 leading-none">
                <span className="text-(--ink-3-aa)">{name}</span>
                <span className="font-mono font-medium tabular-nums text-(--ink)">
                  {formatValue(value)}
                </span>
              </div>
            ))}
            {/* Sample size sits with the summary rather than under the box: a
                median over six points and a median over six thousand are the
                same mark, and this is the only place the difference appears. */}
            {box.count !== undefined && (
              <div className="flex justify-between gap-4 leading-none">
                <span className="text-(--ink-3-aa)">Observations</span>
                <span className="font-mono font-medium tabular-nums text-(--ink)">
                  {box.count.toLocaleString()}
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

BoxPlot.Boxes = Boxes
BoxPlot.XAxis = XAxis
BoxPlot.YAxis = YAxis
BoxPlot.Grid = Grid
BoxPlot.Tooltip = Tooltip
BoxPlot.Background = Background
BoxPlot.ReferenceLine = ReferenceLine
BoxPlot.ReferenceBand = ReferenceBand
BoxPlot.Annotation = Annotation

export default BoxPlot
