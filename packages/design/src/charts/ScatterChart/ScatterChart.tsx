'use client'

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import {
  CartesianGrid,
  Scatter as RechartsScatter,
  ScatterChart as RechartsScatterChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  ZAxis as RechartsZAxis,
} from 'recharts'
import { ChartContainer, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartLegend, ChartLegendContent } from '../lib/legend'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import { GlowFilter, SeriesGradient } from '../lib/paint'
import { Annotation, ReferenceBand, ReferenceLine } from '../lib/annotations'
import { axisLabel } from '../lib/axis'
import { defaultTick } from '../lib/format'
import type { ChartLegendSlotProps, ChartTooltipSlotProps } from '../AreaChart/AreaChart'

const CHART_MARGIN = { top: 12, right: 16, bottom: 0, left: 8 }

/**
 * The mark each point is drawn as.
 *
 * Shape is doing what hue does elsewhere: with the monochrome ramp, two
 * overlapping clouds separate far better by circle-versus-cross than by two
 * steps of grey, and shape survives overprinting where a lightness step does
 * not.
 */
export type ScatterShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'ring'

/** How a point is filled — solid, hollow, or the series gradient. */
export type ScatterVariant = 'solid' | 'outline' | 'gradient'

interface ScatterChartContextValue {
  config: ChartConfig
  isLoading: boolean
  selectedDataKey: string | null
  selectDataKey: (dataKey: string | null) => void
}

const ScatterChartContext = createContext<ScatterChartContextValue | null>(null)

function useScatterChart(): ScatterChartContextValue {
  const context = useContext(ScatterChartContext)
  if (!context) throw new Error('A scatter chart part must be rendered inside <ScatterChart>')
  return context
}

/** The rows a scatter chart reads its hidden table view from. */
export interface ScatterTable {
  rows: Record<string, unknown>[]
  /** The field naming each row. */
  rowKey?: string
  columns: { key: string; label: ReactNode }[]
}

export interface ScatterChartProps {
  /** Series keys → their label and paint. Declaration order is ramp order. */
  config: ChartConfig
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /** The composed parts — axes, grid, tooltip, legend, and the marks themselves. */
  children: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Escape hatch onto the raw Recharts chart element. */
  chartProps?: ComponentProps<typeof RechartsScatterChart>
  /** The series lit on first render. Selection dims every other series. */
  defaultSelectedDataKey?: string | null
  /** Fires when the selection changes, and with null when it is cleared. */
  onSelectionChange?: (selectedDataKey: string | null) => void
  /**
   * The rows behind the hidden table view, with the fields to print. Scatter
   * data lives on each `<Scatter>` rather than on the root, so unlike every
   * other chart here the table cannot be inferred — it is declared.
   */
  table?: ScatterTable | false
}

/**
 * Two measures against each other, one mark per observation — the shape for
 * "is there a relationship here".
 *
 * The only chart in the set whose x axis is a NUMBER rather than a category,
 * which is the whole point: a scatter answers correlation, clustering and
 * outliers, and none of those questions survive being bucketed into a bar.
 *
 * Past three series, shape stops separating them and the answer is small
 * multiples — one chart per series, same axes — rather than a fourth mark.
 *
 * @example
 * <ScatterChart title="Load time against bundle size" config={config}>
 *   <ScatterChart.Grid />
 *   <ScatterChart.XAxis dataKey="kb" name="Bundle" unit=" kB" />
 *   <ScatterChart.YAxis dataKey="ms" name="Load" unit=" ms" />
 *   <ScatterChart.Tooltip />
 *   <ScatterChart.Scatter dataKey="desktop" data={desktop} />
 * </ScatterChart>
 */
export function ScatterChart({
  config,
  title,
  showTitle,
  description,
  children,
  className,
  chartProps,
  defaultSelectedDataKey = null,
  onSelectionChange,
  table,
}: ScatterChartProps) {
  const chartId = useId().replace(/:/g, '')
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(defaultSelectedDataKey)

  const selectDataKey = useCallback(
    (next: string | null) => {
      setSelectedDataKey(next)
      onSelectionChange?.(next)
    },
    [onSelectionChange],
  )

  const context = useMemo<ScatterChartContextValue>(
    () => ({ config, isLoading: false, selectedDataKey, selectDataKey }),
    [config, selectDataKey, selectedDataKey],
  )

  return (
    <ScatterChartContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={table}
      >
        <ChartContainer config={config}>
          <RechartsScatterChart id={chartId} accessibilityLayer margin={CHART_MARGIN} {...chartProps}>
            {children}
          </RechartsScatterChart>
        </ChartContainer>
      </ChartFigure>
    </ScatterChartContext.Provider>
  )
}

/** The SVG path for one mark, centred on the origin at radius `r`. */
function shapePath(shape: ScatterShape, r: number): string {
  switch (shape) {
    case 'square':
      return `M${-r},${-r}h${r * 2}v${r * 2}h${-r * 2}z`
    case 'triangle':
      return `M0,${-r}L${r},${r}L${-r},${r}z`
    case 'diamond':
      return `M0,${-r}L${r},0L0,${r}L${-r},0z`
    case 'cross': {
      const a = r * 0.34
      return `M${-a},${-r}h${a * 2}v${r - a}h${r - a}v${a * 2}h${-(r - a)}v${r - a}h${-a * 2}v${-(r - a)}h${-(r - a)}v${-a * 2}h${r - a}z`
    }
    default:
      return `M0,${-r}A${r},${r} 0 1,1 0,${r}A${r},${r} 0 1,1 0,${-r}z`
  }
}

export interface ScatterProps {
  /** The series key. Must exist on the config. */
  dataKey: string
  /** This series' observations. */
  data: Record<string, unknown>[]
  shape?: ScatterShape
  variant?: ScatterVariant
  /** Mark radius in pixels. Ignored when a `<ScatterChart.ZAxis>` sizes them. */
  size?: number
  /** A halo behind the cloud — for the one series that is the point. */
  glowing?: boolean
  /** Lets a click on this series select it, dimming the rest. */
  isClickable?: boolean
  scatterProps?: Omit<ComponentProps<typeof RechartsScatter>, 'data' | 'dataKey'>
}

/** One cloud of observations. */
function Scatter({
  dataKey,
  data,
  shape = 'circle',
  variant = 'solid',
  size = 5,
  glowing = false,
  isClickable = false,
  scatterProps,
}: ScatterProps) {
  const { config, selectedDataKey, selectDataKey } = useScatterChart()
  const id = useId().replace(/:/g, '')

  const isSelected = selectedDataKey === dataKey
  const dimmed = selectedDataKey !== null && !isSelected
  const paint = `url(#${id}-colors-${dataKey})`

  return (
    <>
      <RechartsScatter
        name={dataKey}
        dataKey={dataKey}
        data={data}
        isAnimationActive={false}
        style={isClickable ? { cursor: 'pointer' } : undefined}
        onClick={() => {
          if (!isClickable) return
          selectDataKey(isSelected ? null : dataKey)
        }}
        shape={(props: { cx?: number; cy?: number; payload?: unknown; r?: number }) => {
          const { cx, cy } = props
          if (cx === undefined || cy === undefined) return <g />
          // `r` arrives only when a ZAxis is sizing the marks.
          const radius = typeof props.r === 'number' && props.r > 0 ? props.r : size
          const hollow = variant === 'outline' || shape === 'ring'

          return (
            <g
              transform={`translate(${cx}, ${cy})`}
              opacity={dimmed ? 0.2 : 1}
              filter={glowing ? `url(#${id}-glow-${dataKey})` : undefined}
              className="transition-opacity duration-(--duration-base)"
            >
              {shape === 'ring' ? (
                <circle
                  r={radius}
                  fill="none"
                  stroke={paint}
                  strokeWidth={Math.max(1.2, radius * 0.32)}
                />
              ) : (
                <path
                  d={shapePath(shape, radius)}
                  fill={hollow ? 'none' : paint}
                  stroke={hollow ? paint : 'var(--chart-surface)'}
                  // A surface-coloured ring on a solid mark is the 2px spacer
                  // that keeps two overlapping observations countable.
                  strokeWidth={hollow ? 1.4 : 1}
                />
              )}
            </g>
          )
        }}
        {...scatterProps}
      />
      <defs>
        <SeriesGradient id={id} dataKey={dataKey} config={config} />
        {glowing && <GlowFilter id={id} dataKey={dataKey} spread={5} intensity={0.8} />}
      </defs>
    </>
  )
}

/** The horizontal measure. Numeric by default — a scatter has no categories. */
function XAxis({
  type = 'number',
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  tickFormatter = defaultTick,
  label,
  ...rest
}: Omit<ComponentProps<typeof RechartsXAxis>, 'label'> & { label?: string }) {
  return (
    <RechartsXAxis
      type={type}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      tickFormatter={tickFormatter}
      {...rest}
    >
      {axisLabel(label, 'x')}
    </RechartsXAxis>
  )
}

/** The vertical measure. */
function YAxis({
  type = 'number',
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  width = 'auto',
  tickFormatter = defaultTick,
  label,
  ...rest
}: Omit<ComponentProps<typeof RechartsYAxis>, 'label'> & { label?: string }) {
  return (
    <RechartsYAxis
      type={type}
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      width={width}
      tickFormatter={tickFormatter}
      {...rest}
    >
      {axisLabel(label, 'y')}
    </RechartsYAxis>
  )
}

/**
 * A third measure, mapped to each mark's AREA rather than its radius.
 *
 * Radius is the wrong encoding and the common mistake: doubling a radius
 * quadruples the ink, so a value twice as large reads as four times as large.
 * `range` is in area units, which is what Recharts scales — so the default
 * below is a ×4 area span, not a ×4 radius.
 */
function ZAxis({
  range = [40, 400],
  ...rest
}: ComponentProps<typeof RechartsZAxis>) {
  return <RechartsZAxis range={range} {...rest} />
}

/** Rules on both axes — a scatter is read in two directions. */
function Grid({
  strokeDasharray = '3 3',
  ...rest
}: ComponentProps<typeof CartesianGrid>) {
  return <CartesianGrid strokeDasharray={strokeDasharray} {...rest} />
}

/**
 * The hover panel, with a crosshair on both axes.
 *
 * `cursor` is a pair of rules rather than a band: a scatter point is located by
 * two coordinates, and a single vertical cursor answers only half of that.
 */
function Tooltip({ variant, roundness, defaultIndex, cursor = true }: ChartTooltipSlotProps) {
  const { selectedDataKey } = useScatterChart()

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={cursor ? { strokeDasharray: '3 3' } : false}
      content={
        <ChartTooltipContent selected={selectedDataKey} roundness={roundness} variant={variant} />
      }
    />
  )
}

/** The key. Required above one series. */
function Legend({
  variant,
  align = 'right',
  verticalAlign = 'top',
  isClickable = false,
}: ChartLegendSlotProps) {
  const { selectedDataKey, selectDataKey } = useScatterChart()

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedDataKey}
          onSelectChange={selectDataKey}
          isClickable={isClickable}
          variant={variant}
        />
      }
    />
  )
}

/** The decorative plate behind the plot. */
function Background({ variant }: { variant: ChartBackgroundVariant }) {
  return <ChartBackground variant={variant} />
}

ScatterChart.Scatter = Scatter
ScatterChart.XAxis = XAxis
ScatterChart.YAxis = YAxis
ScatterChart.ZAxis = ZAxis
ScatterChart.Grid = Grid
ScatterChart.Tooltip = Tooltip
ScatterChart.Legend = Legend
ScatterChart.ReferenceLine = ReferenceLine
ScatterChart.ReferenceBand = ReferenceBand
ScatterChart.Annotation = Annotation
ScatterChart.Background = Background

export default ScatterChart
