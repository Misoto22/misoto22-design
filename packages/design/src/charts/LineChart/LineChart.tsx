'use client'

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useMemo,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  CartesianGrid,
  Curve,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from 'recharts'
import type { CurveProps } from 'recharts'
import { useReducedMotion } from 'motion/react'
import { ChartContainer, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { useChartSelection } from '../lib/selection'
import { type ChartEmptyProps } from '../lib/empty'
import { axisLabel } from '../lib/axis'
import { defaultTick } from '../lib/format'
import { Annotation, ReferenceBand, ReferenceLine } from '../lib/annotations'
import { Values, findSlot, resolveValues, type ValuesProps } from '../lib/values'
import {
  ChartSonifyButton,
  Sonify,
  useChartSonifySeries,
  type SonifyProps,
} from '../lib/sonify-control'

/**
 * The axis props, with `label` narrowed to a string.
 *
 * Recharts' own `label` accepts a render function and a config object, neither
 * of which a call site should be reaching for to name an axis — and both of
 * which would let a consumer opt out of the system's own axis type styling
 * without noticing.
 */
export type ChartXAxisProps = Omit<ComponentProps<typeof RechartsXAxis>, 'label'> & {
  /** What this axis measures. Say the unit here or in the series label, once. */
  label?: string
}

export type ChartYAxisProps = Omit<ComponentProps<typeof RechartsYAxis>, 'label'> & {
  /** What this axis measures. Say the unit here or in the series label, once. */
  label?: string
}

import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartDot, type ChartDotVariant } from '../lib/dot'
import { ChartLegend, ChartLegendContent } from '../lib/legend'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import { Brush, ChartBrush, type BrushProps, type ChartBrushRange } from '../lib/brush'
import { ChartControls, Toolbar, type ToolbarProps } from '../lib/toolbar'
import { useChartZoom } from '../lib/zoom'
import { LoadingIndicator, LoadingShimmer, LOADING_KEY, useLoadingRows } from '../lib/loading'
import {
  AnimatedDashedStroke,
  GlowFilter,
  RevealMask,
  SeriesGradient,
  type ChartRevealType,
} from '../lib/paint'
import type {
  AreaStrokeVariant,
  ChartCurveType,
  ChartLegendSlotProps,
  ChartTooltipSlotProps,
} from '../AreaChart/AreaChart'

const STROKE_WIDTH = 1.6

/** The dash and gap of a buffer segment, in user units. */
const BUFFER_DASH = 4
const BUFFER_GAP = 3

/**
 * Room around the plot, so the first and last tick labels are not sliced by the
 * container's edge. Recharts' own default is 5px on every side, which is not
 * enough for a label centred on the axis's first point.
 */
const CHART_MARGIN = { top: 8, right: 12, bottom: 0, left: 12 }

/** How a line is drawn. Same vocabulary as an area's stroke. */
export type LineStrokeVariant = AreaStrokeVariant

interface LineChartContextValue {
  config: ChartConfig
  /** The rows on screen, so a mark can label its own extremes. */
  rows: Record<string, unknown>[]
  curveType: ChartCurveType
  animationType: ChartRevealType
  isLoading: boolean
  selectedDataKey: string | null
  selectDataKey: (dataKey: string | null) => void
}

const LineChartContext = createContext<LineChartContextValue | null>(null)

function useLineChart(): LineChartContextValue {
  const context = useContext(LineChartContext)
  if (!context) throw new Error('A line chart part must be rendered inside <LineChart>')
  return context
}

type ValidateKeys<TData, TConfig> = {
  [K in keyof TConfig]: K extends keyof TData ? ChartConfig[string] : never
}

export interface LineChartProps<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
> {
  config: TConfig & ValidateKeys<TData, TConfig>
  /** The rows the chart draws. One entry per point, bar or category. */
  data: TData[]
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /**
   * The composed parts — axes, grid, tooltip, legend, and the marks
   * themselves.
   */
  children: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Escape hatch onto the raw Recharts chart element. */
  chartProps?: ComponentProps<typeof RechartsLineChart>
  /**
   * How the line between two points is interpolated. Every mark inherits it
   * unless it says otherwise.
   */
  curveType?: ChartCurveType
  animationType?: ChartRevealType
  /** The series lit on first render, when the chart keeps its own selection. */
  defaultSelectedDataKey?: string | null
  /**
   * The selected series, driven from outside.
   *
   * Give this and the chart follows it; leave it undefined and the chart keeps
   * its own, starting from `defaultSelectedDataKey`.
   */
  selectedDataKey?: string | null
  /** Fires when the selection changes, and with null when it is cleared. */
  onSelectionChange?: (selectedDataKey: string | null) => void
  /**
   * Swaps the marks for an animated skeleton, keeping the measured height so
   * the page does not jump when the data lands.
   */
  isLoading?: boolean
  /** How many points the skeleton draws. */
  loadingPoints?: number
  /**
   * The row field on the category axis. Needed by the brush and by the table
   * view.
   */
  xDataKey?: keyof TData & string
  /**
   * Drops the hidden table view. Only correct when the page prints the data
   * itself.
   */
  hideDataTable?: boolean
  /**
   * What the chart shows when it has nothing to draw.
   *
   * Rendered instead of the plot whenever `data` is empty and the chart is not
   * loading — the state a real dashboard reaches within a week, and the one an
   * empty pair of axes is indistinguishable from a failed load. `false` keeps
   * the axes, for a chart whose emptiness is itself the reading.
   */
  empty?: ChartEmptyProps | false
}

/**
 * Several series compared over a continuous axis — the shape for "which of
 * these is going where".
 *
 * The difference from `<AreaChart>` is what the reader is asked to do: an area
 * says "read the magnitude under this", a line says "compare these against each
 * other". Filling four overlapping series makes the second question unanswerable,
 * which is why a line chart has no fill variant to offer.
 *
 * @example
 * <LineChart title="Visitors per month" config={config} data={data}>
 *   <LineChart.Grid />
 *   <LineChart.XAxis dataKey="month" />
 *   <LineChart.Tooltip />
 *   <LineChart.Line dataKey="desktop">
 *     <LineChart.Dot variant="border" />
 *   </LineChart.Line>
 * </LineChart>
 */
export function LineChart<
  TData extends Record<string, unknown>,
  TConfig extends Record<string, ChartConfig[string]>,
>({
  config,
  data,
  title,
  showTitle,
  description,
  children,
  className,
  chartProps,
  curveType = 'linear',
  animationType = 'forward',
  defaultSelectedDataKey = null,
  selectedDataKey: controlledDataKey,
  onSelectionChange,
  isLoading = false,
  loadingPoints,
  xDataKey,
  hideDataTable = false,
  empty,
}: LineChartProps<TData, TConfig>) {
  const chartId = useId().replace(/:/g, '')
  const { rows: loadingData, onShimmerExit } = useLoadingRows(isLoading, loadingPoints)
  // One window, two views of it: the brush strip below the plot and the
  // toolbar above it both read and write this. See `useChartZoom` for why they
  // are not two separate windows.
  const zoom = useChartZoom({ data, xDataKey })

  // The brush, the toolbar and the sonify control are declared as children but
  // never rendered into the Recharts tree — they live in the figure, outside
  // the SVG.
  const { brushSlot, toolbarSlot, sonifySlot, chartChildren } = useMemo(() => {
    const parts = Children.toArray(children)
    const element = parts.find((child) => isValidElement(child) && child.type === Brush)
    const props = (isValidElement(element) ? element.props : {}) as BrushProps
    return {
      brushSlot: { present: isValidElement(element), ...props },
      toolbarSlot: findSlot<ToolbarProps>(parts, Toolbar),
      sonifySlot: findSlot<SonifyProps>(parts, Sonify),
      chartChildren: parts.filter(
        (child) =>
          !(
            isValidElement(child) &&
            (child.type === Brush || child.type === Toolbar || child.type === Sonify)
          ),
      ),
    }
  }, [children])

  const columns = useMemo(
    () => Object.entries(config).map(([key, series]) => ({ key, label: series.label })),
    [config],
  )

  const showBrush = brushSlot.present && !isLoading
  const showToolbar = toolbarSlot !== null && !isLoading
  // `empty === false` keeps the axes, for a chart whose emptiness is the
  // reading — a monitoring panel that should show a flat, silent range rather
  // than a message.
  const isEmpty = !isLoading && empty !== false && data.length === 0
  const displayData =
    isLoading ? loadingData : showBrush || showToolbar ? zoom.visibleData : data

  // The rows on screen, so a brushed range sounds like what it looks like. A
  // skeleton or an empty chart yields no finite value, which is what leaves the
  // control disabled rather than playing silence.
  const sonifySeries = useChartSonifySeries(
    sonifySlot,
    displayData as Record<string, unknown>[],
    config,
    xDataKey,
  )

  const [selectedDataKey, selectDataKey] = useChartSelection(
    controlledDataKey,
    defaultSelectedDataKey,
    onSelectionChange,
  )

  const context = useMemo<LineChartContextValue>(
    () => ({ config, rows: displayData as Record<string, unknown>[], curveType, animationType, isLoading, selectedDataKey, selectDataKey }),
    [animationType, config, curveType, displayData, isLoading, selectDataKey, selectedDataKey],
  )

  return (
    <LineChartContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={
          hideDataTable
            ? false
            : { rows: data, rowKey: xDataKey, columns }
        }
        isEmpty={isEmpty}
        empty={empty}
      >
        {sonifySlot && (
          <ChartSonifyButton {...sonifySlot} title={title} series={sonifySeries} />
        )}
        <ChartControls
          toolbar={showToolbar ? toolbarSlot : null}
          zoom={zoom}
          title={title}
          rows={data}
          columns={columns}
          rowKey={xDataKey}
        >
        <ChartContainer
          config={config}
          footer={
            showBrush && (
              <ChartBrush
                data={data}
                config={config}
                xDataKey={xDataKey}
                variant="line"
                curveType={curveType}
                height={brushSlot.height}
                formatLabel={brushSlot.formatLabel}
                className="mt-1"
                {...zoom.brushProps}
                onChange={(range: ChartBrushRange) => {
                  zoom.brushProps.onChange(range)
                  brushSlot.onChange?.(range)
                }}
              />
            )
          }
        >
          <RechartsLineChart
            id={chartId}
            accessibilityLayer
            margin={CHART_MARGIN}
            data={displayData}
            {...chartProps}
          >
            {chartChildren}
            {isLoading && (
              <LoadingLine chartId={chartId} curveType={curveType} onShimmerExit={onShimmerExit} />
            )}
          </RechartsLineChart>
        </ChartContainer>
        </ChartControls>
        <LoadingIndicator isLoading={isLoading} />
      </ChartFigure>
    </LineChartContext.Provider>
  )
}

export interface LineProps {
  dataKey: string
  strokeVariant?: LineStrokeVariant
  strokeWidth?: number
  curveType?: ChartCurveType
  animationType?: ChartRevealType
  connectNulls?: boolean
  isClickable?: boolean
  /** A halo around the line — for the one series that is the point of the figure. */
  glowing?: boolean
  /**
   * Draws the LAST segment dashed.
   *
   * The idiom for a projection or a period still open: the line reaches the
   * same point either way, but the last leg is visibly a different kind of fact.
   */
  buffer?: boolean
  children?: ReactNode
  lineProps?: ComponentProps<typeof RechartsLine>
}

/** One line series, with its own gradient, glow and reveal scoped to its id. */
function Line({
  dataKey,
  strokeVariant = 'solid',
  strokeWidth = STROKE_WIDTH,
  curveType,
  animationType,
  connectNulls = false,
  isClickable = false,
  glowing = false,
  buffer = false,
  children,
  lineProps,
}: LineProps) {
  const {
    config,
    curveType: defaultCurve,
    animationType: defaultAnimation,
    isLoading,
    rows,
    selectedDataKey,
    selectDataKey,
  } = useLineChart()
  const id = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()

  if (isLoading) return null

  const resolvedCurve = curveType ?? defaultCurve
  const reveal: ChartRevealType = reduceMotion ? 'none' : (animationType ?? defaultAnimation)
  const maskId = reveal === 'none' ? undefined : `${id}-reveal-mask`

  const isSelected = selectedDataKey === dataKey
  const hasSelection = selectedDataKey !== null
  const opacity = hasSelection && !isSelected ? { stroke: 0.3, dot: 0.3 } : { stroke: 1, dot: 1 }

  const { dot, activeDot } = resolveDots(children, id, dataKey, opacity.dot, maskId)
  const labels = resolveValues(
    findSlot<ValuesProps>(children, Values),
    rows.map((row) => Number(row[dataKey])).filter(Number.isFinite),
  )

  const animateDash = strokeVariant === 'animated-dashed' && !hasSelection && !reduceMotion
  const isDashed = strokeVariant !== 'solid'

  return (
    <>
      <g>
        {isClickable && (
          // A 15px transparent line under the visible one. A 1.6px stroke is
          // not a pointer target, and WCAG 2.5.8 asks for 24; this is the
          // cheapest way to give a hairline a real hit area.
          <RechartsLine
            type={resolvedCurve}
            dataKey={dataKey}
            connectNulls={connectNulls}
            stroke="transparent"
            strokeWidth={15}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            legendType="none"
            tooltipType="none"
            style={{ cursor: 'pointer' }}
            onClick={() => selectDataKey(isSelected ? null : dataKey)}
          />
        )}
        <RechartsLine
          type={resolvedCurve}
          dataKey={dataKey}
          connectNulls={connectNulls}
          strokeOpacity={opacity.stroke}
          stroke={`url(#${id}-colors-${dataKey})`}
          filter={glowing ? `url(#${id}-glow-${dataKey})` : undefined}
          dot={dot}
          activeDot={activeDot}
          strokeWidth={strokeWidth}
          // A buffer line writes its own dasharray from the measured path, so
          // the static one has to stay out of its way.
          strokeDasharray={buffer ? undefined : isDashed ? '5 5' : undefined}
          shape={buffer ? bufferShape : undefined}
          isAnimationActive={false}
          style={{
            ...(maskId ? { mask: `url(#${maskId})` } : {}),
            ...(isClickable ? { cursor: 'pointer' } : {}),
          }}
          onClick={() => {
            if (!isClickable) return
            selectDataKey(isSelected ? null : dataKey)
          }}
          {...lineProps}
        >
          {animateDash && <AnimatedDashedStroke dash={5} />}
          {labels}
        </RechartsLine>
      </g>
      <defs>
        {reveal !== 'none' && <RevealMask id={id} type={reveal} />}
        <SeriesGradient id={id} dataKey={dataKey} config={config} />
        {glowing && <GlowFilter id={id} dataKey={dataKey} spread={10} intensity={2} />}
      </defs>
    </>
  )
}

export interface DotProps {
  variant?: ChartDotVariant
}

/** The resting point marker for the line it is composed inside. A slot. */
const Dot: FC<DotProps> = () => null

/** The marker under the pointer. */
const ActiveDot: FC<DotProps> = () => null

function resolveDots(
  children: ReactNode,
  id: string,
  dataKey: string,
  dotOpacity: number,
  maskId: string | undefined,
) {
  let dot: ComponentProps<typeof RechartsLine>['dot'] = false
  let activeDot: ComponentProps<typeof RechartsLine>['activeDot'] = false

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const { variant } = (child as ReactElement<DotProps>).props

    if (child.type === Dot) {
      dot = (
        <ChartDot
          variant={variant}
          dataKey={dataKey}
          chartId={id}
          fillOpacity={dotOpacity}
          maskId={maskId}
        />
      )
    }
    if (child.type === ActiveDot) {
      activeDot = (
        <ChartDot variant={variant} dataKey={dataKey} chartId={id} fillOpacity={dotOpacity} />
      )
    }
  })

  return { dot, activeDot }
}

type CurvePoint = NonNullable<NonNullable<CurveProps['points']>[number]>
type DrawablePoint = CurvePoint & { x: number; y: number }

function isDrawable(point: CurvePoint): point is DrawablePoint {
  return typeof point.x === 'number' && typeof point.y === 'number'
}

/**
 * Binary-searches a path for the length at which it reaches `targetX`.
 *
 * `getPointAtLength` is the browser's own curve solver, so this is exact for
 * every curve type rather than only for straight segments — which is what an
 * arithmetic split on the point list would give.
 */
function lengthAtX(path: SVGPathElement, totalLength: number, targetX: number): number {
  let low = 0
  let high = totalLength
  // Half a pixel is well under what a dash boundary can show.
  while (high - low > 0.5) {
    const mid = (low + high) / 2
    if (path.getPointAtLength(mid).x < targetX) low = mid
    else high = mid
  }
  return (low + high) / 2
}

/**
 * A line whose last segment is dashed and whose body is not.
 *
 * `stroke-dasharray` has no way to say "solid until here": the pattern repeats
 * from the path's start. So the solid run is written as a single leading dash of
 * exactly the measured length, followed by enough dash/gap pairs to cover the
 * rest — which needs the path's real length, which needs the DOM.
 *
 * The ref callback runs during commit, before paint, so there is no frame where
 * the line is drawn undashed.
 */
function bufferShape(props: CurveProps) {
  const { points, ...rest } = props
  if (!points || points.length < 2) return <Curve {...props} />

  const drawable = points.filter(isDrawable)
  if (drawable.length < 2) return <Curve {...props} />

  const splitX = drawable[drawable.length - 2]!.x

  return (
    <g
      ref={(group) => {
        const path = group?.querySelector('path')
        if (!path) return

        const total = path.getTotalLength()
        const solid = lengthAtX(path, total, splitX)
        const remaining = total - solid
        const repeats = Math.ceil(remaining / (BUFFER_DASH + BUFFER_GAP)) + 1
        const dashes = Array.from({ length: repeats }, () => `${BUFFER_DASH} ${BUFFER_GAP}`).join(' ')

        path.setAttribute('stroke-dasharray', `${solid} 0 ${dashes}`)
      }}
    >
      <Curve {...rest} points={drawable} />
    </g>
  )
}

/** The category axis. */
function XAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  label,
  ...rest
}: ChartXAxisProps) {
  const { isLoading } = useLineChart()
  if (isLoading) return null
  return (
    <RechartsXAxis
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
  minTickGap = 8,
  width = 'auto',
  tickFormatter = defaultTick,
  label,
  ...rest
}: ChartYAxisProps) {
  const { isLoading } = useLineChart()
  if (isLoading) return null
  return (
    <RechartsYAxis
      tickLine={tickLine}
      axisLine={axisLine}
      tickMargin={tickMargin}
      minTickGap={minTickGap}
      width={width}
      tickFormatter={tickFormatter}
      {...rest}
    >
      {axisLabel(label, 'y')}
    </RechartsYAxis>
  )
}

/** Horizontal dashed rules. */
function Grid({
  vertical = false,
  strokeDasharray = '3 3',
  ...rest
}: ComponentProps<typeof CartesianGrid>) {
  return <CartesianGrid vertical={vertical} strokeDasharray={strokeDasharray} {...rest} />
}

/** The hover panel, with a crosshair along the axis. */
function Tooltip({ variant, roundness, defaultIndex, cursor = true }: ChartTooltipSlotProps) {
  const { isLoading, selectedDataKey } = useLineChart()
  if (isLoading) return null

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={cursor ? { strokeDasharray: '3 3', strokeWidth: 1 } : false}
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
  const { selectedDataKey, selectDataKey } = useLineChart()

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
  const { isLoading } = useLineChart()
  if (isLoading) return null
  return <ChartBackground variant={variant} />
}

/** The skeleton drawn in place of the real lines. */
function LoadingLine({
  chartId,
  curveType,
  onShimmerExit,
}: {
  chartId: string
  curveType: ChartCurveType
  onShimmerExit: () => void
}) {
  return (
    <>
      <RechartsLine
        type={curveType}
        dataKey={LOADING_KEY}
        stroke="currentColor"
        strokeOpacity={0.5}
        strokeWidth={STROKE_WIDTH}
        isAnimationActive={false}
        legendType="none"
        tooltipType="none"
        activeDot={false}
        dot={false}
        className="text-(--ink)"
        style={{ mask: `url(#${chartId}-loading-mask)` }}
      />
      <defs>
        <LoadingShimmer id={chartId} onShimmerExit={onShimmerExit} />
      </defs>
    </>
  )
}

LineChart.Line = Line
LineChart.Dot = Dot
LineChart.ActiveDot = ActiveDot
LineChart.XAxis = XAxis
LineChart.YAxis = YAxis
LineChart.Grid = Grid
LineChart.Tooltip = Tooltip
LineChart.Legend = Legend
LineChart.Background = Background
LineChart.ReferenceLine = ReferenceLine
LineChart.ReferenceBand = ReferenceBand
LineChart.Annotation = Annotation
LineChart.Values = Values
LineChart.Brush = Brush
LineChart.Toolbar = Toolbar
LineChart.Sonify = Sonify

export default LineChart
