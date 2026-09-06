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
  ReferenceLine as RechartsReferenceLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  usePlotArea,
} from 'recharts'
import { ChartContainer, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { type ChartEmptyProps } from '../lib/empty'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartTooltip } from '../lib/tooltip'
import { BarHatchedFill, SeriesGradient } from '../lib/paint'
import { Annotation, ReferenceBand, ReferenceLine } from '../lib/annotations'
import { axisLabel } from '../lib/axis'
import { defaultTick } from '../lib/format'
import { cn } from '../../lib/cn'
import type { ChartXAxisProps, ChartYAxisProps } from '../BarChart/BarChart'
import type { ChartTooltipSlotProps } from '../AreaChart/AreaChart'

/** The series a chart with only one of them falls back to. */
const DEFAULT_CONFIG: ChartConfig = { value: { label: 'Change' } }

const CHART_MARGIN = { top: 20, right: 12, bottom: 0, left: 12 }

/** The corner every bar rounds to. */
const BAR_RADIUS = 2

/** How a step moves the running total. */
export type WaterfallStepType = 'delta' | 'total'

/** Which way a bar goes, which is what its texture encodes. */
export type WaterfallDirection = 'increase' | 'decrease' | 'total'

export interface WaterfallStep {
  /** The step's name on the category axis. Doubles as its key. */
  name: string
  /**
   * The signed change this step makes, or — on a `total` step — the absolute
   * figure the running total is set to.
   *
   * Omit it on a `total` and the running total is used, which is the right
   * default for the closing bar: an end total typed by hand can disagree with
   * the deltas above it, and the chart would draw the disagreement without
   * saying anything.
   */
  value?: number
  /**
   * `delta` (the default) adds `value` to the running total and floats the bar
   * where that lands. `total` plants a bar on the baseline — an opening
   * balance, a subtotal, a closing figure.
   */
  type?: WaterfallStepType
}

/** A step with its span, its direction and its running total worked out. */
interface ResolvedStep extends WaterfallStep {
  type: WaterfallStepType
  /**
   * What this step moved the total by. On a `total` step that is the gap it
   * closes — zero whenever the deltas above it already add up to it.
   */
  change: number
  /** The running total once this step has been applied. */
  total: number
  /**
   * The bar's two ends on the value axis, LOW first.
   *
   * Ascending because Recharts reads a floating bar's range that way and
   * collapses a descending one to nothing — which is every decrease in the
   * cascade. Which end the running total is at is recovered from `total`
   * rather than from the order here.
   */
  span: [number, number]
  direction: WaterfallDirection
}

/** A bar's two ends, low first — see `ResolvedStep.span`. */
function ascending(a: number, b: number): [number, number] {
  return a <= b ? [a, b] : [b, a]
}

/** The steps, walked in order, each carrying the total it leaves behind. */
function resolve(data: WaterfallStep[]): ResolvedStep[] {
  let running = 0

  return data.map((step) => {
    const type = step.type ?? 'delta'

    if (type === 'total') {
      const total = step.value ?? running
      const resolved: ResolvedStep = {
        ...step,
        type,
        change: total - running,
        total,
        span: ascending(0, total),
        direction: 'total',
      }
      running = total
      return resolved
    }

    const change = step.value ?? 0
    const from = running
    running += change

    return {
      ...step,
      type,
      change,
      total: running,
      span: ascending(from, running),
      direction: change < 0 ? 'decrease' : 'increase',
    }
  })
}

interface WaterfallContextValue {
  config: ChartConfig
  seriesKey: string
  steps: ResolvedStep[]
  formatValue: (value: number) => string
}

const WaterfallContext = createContext<WaterfallContextValue | null>(null)

function useWaterfall(): WaterfallContextValue {
  const context = useContext(WaterfallContext)
  if (!context) throw new Error('A waterfall part must be rendered inside <WaterfallChart>')
  return context
}

export interface WaterfallChartProps {
  /**
   * The single series — its label and its paint. Only the FIRST entry is read;
   * a waterfall has one quantity and as many bars as it has steps.
   */
  config?: ChartConfig
  /**
   * The steps, in the order they are applied. Order is the arithmetic: the
   * chart does not sort, because a different order is a different total at
   * every intermediate bar.
   */
  data: WaterfallStep[]
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /** The composed parts — axes, grid, tooltip, and `<WaterfallChart.Bars>`. */
  children: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Escape hatch onto the raw Recharts chart element. */
  chartProps?: ComponentProps<typeof RechartsBarChart>
  /** Formats every number the chart prints — ticks, labels, tooltip, table. */
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
 * How a total got from one figure to another — an opening balance, the signed
 * contributions that moved it, and where it closed.
 *
 * The form for "why did this change", which a pair of bars cannot answer and a
 * pie chart answers wrongly, because contributions can be NEGATIVE and a slice
 * cannot. Reach for `<BarChart>` when the parts do not have to add up to the
 * gap between two totals, and for `<FunnelChart>` when the quantity only ever
 * shrinks.
 *
 * **The connectors are the claim to be careful about.** They draw the steps as
 * a sequence — this happened, then this — and most breakdowns are not
 * sequential at all: churn and expansion in the same month are simultaneous,
 * and the order they are listed in is an editorial choice. The arithmetic
 * survives any order; the STORY does not, and a reader will take the leftmost
 * bar as the first cause. Two related traps: the intermediate bars are floating
 * lengths read against no baseline, so a small step high up the cascade is hard
 * to compare with a large one near zero; and any step that is itself a net of
 * two larger opposing movements is invisible as such. Where the order is
 * arbitrary, say so in the `description`.
 *
 * Recharts earns its place for the axes, grid and tooltip. Each bar is a
 * floating range — from the running total to the new one — with a custom shape
 * over it, because Recharts has no waterfall mark and the connectors have to be
 * drawn from the same geometry as the bars they join.
 *
 * @example
 * <WaterfallChart title="Revenue bridge, FY25" data={steps}>
 *   <WaterfallChart.Grid />
 *   <WaterfallChart.XAxis />
 *   <WaterfallChart.YAxis label="AUD" />
 *   <WaterfallChart.Tooltip />
 *   <WaterfallChart.Bars showValues />
 * </WaterfallChart>
 *
 * @example
 * const steps = [
 *   { name: 'FY24', value: 1200, type: 'total' as const },
 *   { name: 'New', value: 340 },
 *   { name: 'Churn', value: -180 },
 *   // No value: the closing bar is whatever the deltas add up to.
 *   { name: 'FY25', type: 'total' as const },
 * ]
 */
export function WaterfallChart({
  config = DEFAULT_CONFIG,
  data,
  title,
  showTitle,
  description,
  children,
  className,
  chartProps,
  formatValue = defaultTick,
  hideDataTable = false,
  empty,
}: WaterfallChartProps) {
  const chartId = useId().replace(/:/g, '')
  const seriesKey = Object.keys(config)[0] ?? 'value'
  const steps = useMemo(() => resolve(data), [data])

  const context = useMemo<WaterfallContextValue>(
    () => ({ config, seriesKey, steps, formatValue }),
    [config, seriesKey, steps, formatValue],
  )

  const isEmpty = empty !== false && steps.length === 0

  return (
    <WaterfallContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={
          hideDataTable
            ? false
            : {
                rows: steps as unknown as Record<string, unknown>[],
                rowKey: 'name',
                columns: [
                  { key: 'change', label: 'Change' },
                  { key: 'total', label: 'Running total' },
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
            data={steps}
            barCategoryGap="25%"
            {...chartProps}
          >
            {children}
          </RechartsBarChart>
        </ChartContainer>
      </ChartFigure>
    </WaterfallContext.Provider>
  )
}

export interface WaterfallBarsProps {
  /** The bars' corner. */
  radius?: number
  /**
   * Joins each bar's closing edge to where the next one starts.
   *
   * On by default: without them a waterfall is a row of bars floating at
   * unrelated heights, and the cascade — which is the entire point of the form
   * — has to be reconstructed by the reader.
   */
  connectors?: boolean
  /**
   * Prints each step's signed change above or below its bar.
   *
   * Worth more here than on most charts: an intermediate bar has no baseline
   * under it, so its length is the one thing a reader cannot get off the axis.
   */
  showValues?: boolean
  /** Escape hatch onto the underlying Recharts bar. */
  barProps?: ComponentProps<typeof RechartsBar>
}

/**
 * The bars and the connectors between them.
 *
 * Increases and totals take the solid series fill; decreases take the 45°
 * hatch. Texture rather than a second colour, because the whole set has to stay
 * legible in greyscale and under forced colours — and a total is told from an
 * increase by geometry instead, since it is the only kind of bar that stands on
 * the baseline.
 */
function Bars({
  radius = BAR_RADIUS,
  connectors = true,
  showValues = false,
  barProps,
}: WaterfallBarsProps) {
  const { config, seriesKey, steps, formatValue } = useWaterfall()
  const id = useId().replace(/:/g, '')

  const shared = {
    id,
    seriesKey,
    radius,
    connectors,
    showValues,
    stepCount: steps.length,
    formatValue,
  }

  return (
    <>
      {/* The baseline the totals stand on. A waterfall without a visible zero
          asks the reader to take the floating bars on trust. */}
      <RechartsReferenceLine y={0} stroke="var(--chart-grid)" strokeWidth={1} />
      <RechartsBar
        dataKey={(row: unknown) => (row as ResolvedStep).span}
        name={seriesKey}
        isAnimationActive={false}
        fill="transparent"
        shape={(props: unknown) => <StepShape {...(props as StepGeometry)} {...shared} />}
        activeBar={(props: unknown) => <StepShape {...(props as StepGeometry)} {...shared} />}
        {...barProps}
      />
      <defs>
        <SeriesGradient id={id} dataKey={seriesKey} config={config} direction="vertical" />
        <BarHatchedFill id={id} dataKey={seriesKey} />
      </defs>
    </>
  )
}

/** The geometry Recharts hands a custom bar shape, plus the step behind it. */
interface StepGeometry {
  x?: number
  y?: number
  width?: number
  height?: number
  index?: number
  payload?: ResolvedStep
}

interface StepShapeProps extends StepGeometry {
  id: string
  seriesKey: string
  radius: number
  connectors: boolean
  showValues: boolean
  stepCount: number
  formatValue: (value: number) => string
}

/** One step: its bar, its connector to the next step, and its label. */
function StepShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = -1,
  payload,
  id,
  seriesKey,
  radius,
  connectors,
  showValues,
  stepCount,
  formatValue,
}: StepShapeProps) {
  const plot = usePlotArea()

  if (!payload) return null

  const step = payload
  const fill =
    step.direction === 'decrease'
      ? `url(#${id}-hatched-${seriesKey})`
      : `url(#${id}-colors-${seriesKey})`

  // Which edge of the rect the running total lands on. Everything downstream —
  // the connector's height, where the label sits — hangs off this one fact,
  // and it is a comparison rather than a re-derived scale so it stays right
  // whatever domain the axis ends up with.
  const closesAtTop = step.total >= step.span[1]
  const closingY = closesAtTop ? y : y + height

  // A zero-change step has no rect to see. It still has to appear, or the
  // cascade silently loses a category and the axis stops matching the bars.
  const drawnHeight = Math.max(height, 1)

  // Recharts leaves a gap between category bands, and the connector has to
  // cross it. One band is the plot's width over the number of steps, so the
  // next bar's near edge is exactly one band along from this one's.
  const band = plot && stepCount > 0 ? plot.width / stepCount : width
  const hasNext = index >= 0 && index < stepCount - 1

  return (
    <g>
      {connectors && hasNext && (
        <line
          x1={x + width}
          y1={closingY}
          x2={x + band}
          y2={closingY}
          stroke="var(--chart-cursor)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      <rect x={x} y={y} width={width} height={drawnHeight} rx={radius || undefined} fill={fill} />
      {showValues && (
        <text
          x={x + width / 2}
          // Above a rise, below a fall — so the label never sits inside the bar
          // it is describing and never collides with the connector leaving it.
          y={closesAtTop ? y - 6 : y + drawnHeight + 13}
          textAnchor="middle"
          className="fill-(--ink) font-mono text-[11px] font-medium tabular-nums"
          style={{ pointerEvents: 'none' }}
        >
          {step.direction === 'total'
            ? formatValue(step.total)
            : `${step.change > 0 ? '+' : ''}${formatValue(step.change)}`}
        </text>
      )}
    </g>
  )
}

/** The step axis. */
function XAxis({
  dataKey = 'name',
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  label,
  ...rest
}: ChartXAxisProps) {
  return (
    <RechartsXAxis
      dataKey={dataKey}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      {...rest}
    >
      {axisLabel(label, 'x')}
    </RechartsXAxis>
  )
}

/** The value axis. */
function YAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  width = 'auto',
  label,
  tickFormatter,
  ...rest
}: ChartYAxisProps) {
  const { formatValue } = useWaterfall()

  return (
    <RechartsYAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      width={width}
      tickFormatter={tickFormatter ?? formatValue}
      {...rest}
    >
      {axisLabel(label, 'y')}
    </RechartsYAxis>
  )
}

/** Rules across the value axis. */
function Grid({
  strokeDasharray = '3 3',
  vertical = false,
  ...rest
}: ComponentProps<typeof CartesianGrid>) {
  return <CartesianGrid strokeDasharray={strokeDasharray} vertical={vertical} {...rest} />
}

/**
 * The hover panel, printing the change AND the total it leaves behind.
 *
 * The generic tooltip would print the bar's raw span, which is a pair of
 * running totals and reads as two unrelated numbers. Both facts a waterfall
 * carries — what this step did, and where the total stood afterwards — are
 * named here instead.
 */
function Tooltip({ variant = 'solid', roundness = 'lg', defaultIndex }: ChartTooltipSlotProps) {
  const { formatValue } = useWaterfall()

  return (
    <ChartTooltip
      cursor={false}
      defaultIndex={defaultIndex}
      content={(props) => {
        const { active, payload } = props as unknown as {
          active?: boolean
          payload?: { payload?: ResolvedStep }[]
        }
        const step = payload?.[0]?.payload
        if (!active || !step) return <span className="p-4" />

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
            <div className="font-medium text-(--ink)">{step.name}</div>
            {step.direction !== 'total' && (
              <div className="flex justify-between gap-4 leading-none">
                <span className="text-(--ink-3-aa)">Change</span>
                <span className="font-mono font-medium tabular-nums text-(--ink)">
                  {step.change > 0 ? '+' : ''}
                  {formatValue(step.change)}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4 leading-none">
              <span className="text-(--ink-3-aa)">
                {step.direction === 'total' ? 'Total' : 'Running total'}
              </span>
              <span className="font-mono font-medium tabular-nums text-(--ink)">
                {formatValue(step.total)}
              </span>
            </div>
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

WaterfallChart.Bars = Bars
WaterfallChart.XAxis = XAxis
WaterfallChart.YAxis = YAxis
WaterfallChart.Grid = Grid
WaterfallChart.Tooltip = Tooltip
WaterfallChart.Background = Background
WaterfallChart.ReferenceLine = ReferenceLine
WaterfallChart.ReferenceBand = ReferenceBand
WaterfallChart.Annotation = Annotation

export default WaterfallChart
