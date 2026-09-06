'use client'

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  Bar as RechartsBar,
  CartesianGrid,
  ComposedChart as RechartsComposedChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from 'recharts'
import { motion, useReducedMotion } from 'motion/react'
import { ChartContainer, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { useChartSelection } from '../lib/selection'
import { type ChartEmptyProps } from '../lib/empty'
import { axisLabel } from '../lib/axis'
import { defaultTick } from '../lib/format'
import { Annotation, ReferenceBand, ReferenceLine } from '../lib/annotations'
import { Values, findSlot, resolveValues, type ValuesProps } from '../lib/values'

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
  BarDuotoneFill,
  BarGradientFill,
  BarHatchedFill,
  BarStrippedFill,
  GlowFilter,
  REVEAL_EASE,
  RevealMask,
  SeriesGradient,
  type ChartRevealType,
} from '../lib/paint'
import type { BarVariant } from '../BarChart/BarChart'
import type {
  AreaStrokeVariant,
  ChartCurveType,
  ChartLegendSlotProps,
  ChartTooltipSlotProps,
} from '../AreaChart/AreaChart'

const STROKE_WIDTH = 2
const BAR_RADIUS = 4
const GROW_DURATION = 0.5
const GROW_STAGGER = 0.05

/**
 * Room around the plot, so the first and last tick labels are not sliced by the
 * container's edge. Recharts' own default is 5px on every side, which is not
 * enough for a label centred on the axis's first point.
 */
const CHART_MARGIN = { top: 8, right: 12, bottom: 0, left: 12 }

interface ComposedChartContextValue {
  config: ChartConfig
  /** The rows on screen, so a mark can label its own extremes. */
  rows: Record<string, unknown>[]
  curveType: ChartCurveType
  animationType: ChartRevealType
  introStartedAt: number
  dataLength: number
  isLoading: boolean
  hoveredIndex: number | null
  selectedDataKey: string | null
  selectDataKey: (dataKey: string | null) => void
}

const ComposedChartContext = createContext<ComposedChartContextValue | null>(null)

function useComposedChart(): ComposedChartContextValue {
  const context = useContext(ComposedChartContext)
  if (!context) throw new Error('A composed chart part must be rendered inside <ComposedChart>')
  return context
}

type ValidateKeys<TData, TConfig> = {
  [K in keyof TConfig]: K extends keyof TData ? ChartConfig[string] : never
}

export interface ComposedChartProps<
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
  chartProps?: ComponentProps<typeof RechartsComposedChart>
  /**
   * How the line between two points is interpolated. Every mark inherits it
   * unless it says otherwise.
   */
  curveType?: ChartCurveType
  animationType?: ChartRevealType
  barGap?: number
  barCategoryGap?: number
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
  /** How many bars the skeleton draws. */
  loadingBars?: number
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
 * Bars and lines over one axis — the shape for "the volume, and the rate it
 * moved at".
 *
 * One axis, always. Two measures at different scales belong in two charts or
 * indexed to a common base; a second y-scale lets the author choose where the
 * lines cross, which is the single most misleading thing a chart can do.
 *
 * @example
 * <ComposedChart title="Revenue and profit" config={config} data={data}>
 *   <ComposedChart.Grid />
 *   <ComposedChart.XAxis dataKey="month" />
 *   <ComposedChart.Tooltip />
 *   <ComposedChart.Bar dataKey="revenue" variant="duotone" />
 *   <ComposedChart.Line dataKey="profit" />
 * </ComposedChart>
 */
export function ComposedChart<
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
  barGap,
  barCategoryGap,
  defaultSelectedDataKey = null,
  selectedDataKey: controlledDataKey,
  onSelectionChange,
  isLoading = false,
  loadingBars,
  xDataKey,
  hideDataTable = false,
  empty,
}: ComposedChartProps<TData, TConfig>) {
  const chartId = useId().replace(/:/g, '')
  const [introStartedAt] = useState(() => Date.now())
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { rows: loadingData, onShimmerExit } = useLoadingRows(isLoading, loadingBars ?? 12)
  // One window, two views of it: the brush strip below the plot and the
  // toolbar above it both read and write this. See `useChartZoom` for why they
  // are not two separate windows.
  const zoom = useChartZoom({ data, xDataKey })

  // The brush and the toolbar are declared as children but never rendered into
  // the Recharts tree — one is a footer under the plot and the other a row
  // above it, and both live outside the SVG.
  const { brushSlot, toolbarSlot, chartChildren } = useMemo(() => {
    const parts = Children.toArray(children)
    const element = parts.find((child) => isValidElement(child) && child.type === Brush)
    const props = (isValidElement(element) ? element.props : {}) as BrushProps
    return {
      brushSlot: { present: isValidElement(element), ...props },
      toolbarSlot: findSlot<ToolbarProps>(parts, Toolbar),
      chartChildren: parts.filter(
        (child) => !(isValidElement(child) && (child.type === Brush || child.type === Toolbar)),
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
  const displayData = showBrush || showToolbar ? zoom.visibleData : data

  const [selectedDataKey, selectDataKey] = useChartSelection(
    controlledDataKey,
    defaultSelectedDataKey,
    onSelectionChange,
  )

  const context = useMemo<ComposedChartContextValue>(
    () => ({
      config,
      rows: displayData as Record<string, unknown>[],
      curveType,
      animationType,
      introStartedAt,
      dataLength: displayData.length,
      isLoading,
      hoveredIndex,
      selectedDataKey,
      selectDataKey,
    }),
    [
      animationType,
      config,
      curveType,
      displayData,
      hoveredIndex,
      introStartedAt,
      isLoading,
      selectDataKey,
      selectedDataKey,
    ],
  )

  return (
    <ComposedChartContext.Provider value={context}>
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
                variant="area"
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
          <RechartsComposedChart
            id={chartId}
            accessibilityLayer
            margin={CHART_MARGIN}
            data={isLoading ? loadingData : displayData}
            barGap={barGap}
            barCategoryGap={barCategoryGap}
            // The hovered column, read from Recharts' own tooltip cursor. This
            // was the missing half of `enableHoverHighlight`: the state existed
            // and was cleared on leave, but nothing ever set it, so the
            // highlight never fired.
            onMouseMove={(state) => {
              const index = (state as { activeTooltipIndex?: number } | undefined)
                ?.activeTooltipIndex
              setHoveredIndex(typeof index === 'number' ? index : null)
            }}
            onMouseLeave={() => setHoveredIndex(null)}
            {...chartProps}
          >
            {chartChildren}
            {isLoading && <LoadingBar chartId={chartId} onShimmerExit={onShimmerExit} />}
          </RechartsComposedChart>
        </ChartContainer>
        </ChartControls>
        <LoadingIndicator isLoading={isLoading} />
      </ChartFigure>
    </ComposedChartContext.Provider>
  )
}

export interface ComposedBarProps {
  dataKey: string
  variant?: BarVariant
  radius?: number
  /** A halo behind the bars. */
  glowing?: boolean
  animationType?: ChartRevealType
  isClickable?: boolean
  /** Dims this series while another COLUMN is hovered. */
  enableHoverHighlight?: boolean
  /** `<ComposedChart.Values>`. */
  children?: ReactNode
  barProps?: ComponentProps<typeof RechartsBar>
}

/** One bar series inside a composed chart. */
function Bar({
  dataKey,
  variant = 'default',
  radius = BAR_RADIUS,
  glowing = false,
  animationType,
  isClickable = false,
  enableHoverHighlight = false,
  children,
  barProps,
}: ComposedBarProps) {
  const {
    config,
    animationType: defaultAnimation,
    introStartedAt,
    dataLength,
    isLoading,
    rows,
    hoveredIndex,
    selectedDataKey,
    selectDataKey,
  } = useComposedChart()
  const id = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()

  if (isLoading) return null

  const isSelected = selectedDataKey === null || selectedDataKey === dataKey
  const reveal: ChartRevealType = reduceMotion ? 'none' : (animationType ?? defaultAnimation)

  return (
    <>
      <RechartsBar
        dataKey={dataKey}
        fill={`url(#${id}-colors-${dataKey})`}
        radius={radius}
        isAnimationActive={false}
        style={isClickable || enableHoverHighlight ? { cursor: 'pointer' } : undefined}
        shape={(props: unknown) => {
          const geometry = props as BarGeometry
          const index = typeof geometry.index === 'number' ? geometry.index : -1

          return (
            <ComposedBarShape
              {...geometry}
              id={id}
              dataKey={dataKey}
              variant={variant}
              barRadius={radius}
              filter={glowing ? `url(#${id}-glow-${dataKey})` : undefined}
              fillOpacity={barOpacity({
                isClickable,
                isSelected,
                selectedDataKey,
                enableHoverHighlight,
                hoveredIndex,
                index,
              })}
              isClickable={isClickable}
              enableHoverHighlight={enableHoverHighlight}
              animationType={reveal}
              dataLength={dataLength}
              introStartedAt={introStartedAt}
              onSelect={() => {
                if (!isClickable) return
                selectDataKey(selectedDataKey === dataKey ? null : dataKey)
              }}
            />
          )
        }}
        {...barProps}
      >
        {resolveValues(
          findSlot<ValuesProps>(children, Values),
          rows.map((row) => Number(row[dataKey])).filter(Number.isFinite),
        )}
      </RechartsBar>
      <defs>
        <SeriesGradient id={id} dataKey={dataKey} config={config} direction="vertical" />
        {variant === 'hatched' && <BarHatchedFill id={id} dataKey={dataKey} />}
        {variant === 'duotone' && <BarDuotoneFill id={id} dataKey={dataKey} config={config} />}
        {variant === 'duotone-reverse' && (
          <BarDuotoneFill id={id} dataKey={dataKey} config={config} reverse />
        )}
        {variant === 'gradient' && <BarGradientFill id={id} dataKey={dataKey} />}
        {variant === 'stripped' && <BarStrippedFill id={id} dataKey={dataKey} />}
        {glowing && <GlowFilter id={id} dataKey={dataKey} />}
      </defs>
    </>
  )
}

interface BarGeometry {
  x?: number
  y?: number
  width?: number
  height?: number
  index?: number
  background?: { x?: number; y?: number; width?: number; height?: number }
  [key: string]: unknown
}

/** One drawn bar, with an invisible full-column rect keeping it hoverable. */
function ComposedBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  background,
  index = -1,
  id,
  dataKey,
  variant,
  barRadius,
  filter,
  fillOpacity,
  isClickable,
  enableHoverHighlight,
  animationType,
  dataLength,
  introStartedAt,
  onSelect,
}: BarGeometry & {
  id: string
  dataKey: string
  variant: BarVariant
  barRadius: number
  filter?: string
  fillOpacity: number
  isClickable: boolean
  enableHoverHighlight: boolean
  animationType: ChartRevealType
  dataLength: number
  introStartedAt: number
  onSelect: () => void
}) {
  const cursor = isClickable || enableHoverHighlight ? { cursor: 'pointer' } : undefined
  const grow = growAnimation(animationType, index, dataLength, introStartedAt) ?? {}
  const fill =
    variant === 'default'
      ? `url(#${id}-colors-${dataKey})`
      : `url(#${id}-${variant}-${dataKey})`

  const hitArea = (
    <rect
      x={background?.x ?? x}
      y={background?.y ?? y}
      width={background?.width ?? width}
      height={background?.height ?? height}
      fill="transparent"
    />
  )

  if (variant === 'stripped') {
    return (
      <g style={cursor} onClick={onSelect}>
        <motion.g
          {...grow}
          filter={filter}
          opacity={fillOpacity}
          className="transition-opacity duration-(--duration-base)"
        >
          <rect x={x} y={y} width={width} height={height} fill={fill} />
          <rect x={x} y={y} width={width} height={2} fill={`url(#${id}-colors-${dataKey})`} />
        </motion.g>
        {hitArea}
      </g>
    )
  }

  return (
    <g style={cursor} onClick={onSelect}>
      <motion.g {...grow}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={barRadius}
          ry={barRadius}
          fill={fill}
          opacity={fillOpacity}
          filter={filter}
          className="transition-opacity duration-(--duration-base)"
        />
      </motion.g>
      {hitArea}
    </g>
  )
}

/** The staggered grow-in, anchored to the chart rather than to the bar's mount. */
function growAnimation(
  animationType: ChartRevealType,
  index: number,
  dataLength: number,
  introStartedAt: number,
) {
  if (animationType === 'none' || index < 0 || dataLength <= 0) return null

  const lastIndex = dataLength - 1
  const centre = lastIndex / 2

  let step: number
  switch (animationType) {
    case 'reverse':
      step = lastIndex - index
      break
    case 'center-out':
      step = Math.abs(index - centre)
      break
    case 'edges-in':
      step = centre - Math.abs(index - centre)
      break
    default:
      step = index
  }

  const startMs = step * GROW_STAGGER * 1000
  const endMs = startMs + GROW_DURATION * 1000
  const elapsed = Date.now() - introStartedAt
  if (elapsed >= endMs) return null

  const from = elapsed <= startMs ? 0 : (elapsed - startMs) / (GROW_DURATION * 1000)

  return {
    initial: { scaleY: from },
    animate: { scaleY: 1 },
    transition: {
      duration: (endMs - Math.max(elapsed, startMs)) / 1000,
      ease: REVEAL_EASE,
      delay: Math.max(0, startMs - elapsed) / 1000,
    },
    style: { originY: 1 },
  }
}

/** How lit a bar is, given the selection and the hovered column. */
function barOpacity({
  isClickable,
  isSelected,
  selectedDataKey,
  enableHoverHighlight,
  hoveredIndex,
  index,
}: {
  isClickable: boolean
  isSelected: boolean
  selectedDataKey: string | null
  enableHoverHighlight: boolean
  hoveredIndex: number | null
  index: number
}) {
  const selectionOpacity = isClickable && selectedDataKey !== null ? (isSelected ? 1 : 0.15) : 1
  if (enableHoverHighlight && hoveredIndex !== null) {
    return hoveredIndex === index ? selectionOpacity : selectionOpacity * 0.3
  }
  return selectionOpacity
}

export interface ComposedLineProps {
  dataKey: string
  strokeVariant?: AreaStrokeVariant
  curveType?: ChartCurveType
  animationType?: ChartRevealType
  connectNulls?: boolean
  glowing?: boolean
  isClickable?: boolean
  children?: ReactNode
  lineProps?: ComponentProps<typeof RechartsLine>
}

/** One line series inside a composed chart. */
function Line({
  dataKey,
  strokeVariant = 'solid',
  curveType,
  animationType,
  connectNulls = false,
  glowing = false,
  isClickable = false,
  children,
  lineProps,
}: ComposedLineProps) {
  const {
    config,
    curveType: defaultCurve,
    animationType: defaultAnimation,
    isLoading,
    rows,
    selectedDataKey,
    selectDataKey,
  } = useComposedChart()
  const id = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()

  if (isLoading) return null

  const resolvedCurve = curveType ?? defaultCurve
  const reveal: ChartRevealType = reduceMotion ? 'none' : (animationType ?? defaultAnimation)
  const maskId = reveal === 'none' ? undefined : `${id}-reveal-mask`

  const hasSelection = selectedDataKey !== null
  const dimmed = hasSelection && selectedDataKey !== dataKey
  const opacity = dimmed ? { stroke: 0.3, dot: 0.3 } : { stroke: 1, dot: 1 }

  const { dot, activeDot } = resolveDots(children, id, dataKey, opacity.dot, maskId)
  const labels = resolveValues(
    findSlot<ValuesProps>(children, Values),
    rows.map((row) => Number(row[dataKey])).filter(Number.isFinite),
  )
  const animateDash = strokeVariant === 'animated-dashed' && !hasSelection && !reduceMotion
  const isDashed = strokeVariant !== 'solid'

  const select = () => {
    if (!isClickable) return
    selectDataKey(selectedDataKey === dataKey ? null : dataKey)
  }

  return (
    <>
      {isClickable && (
        // A 20px transparent line under the visible one, giving a 2px stroke a
        // pointer target a finger can hit.
        <RechartsLine
          type={resolvedCurve}
          dataKey={dataKey}
          connectNulls={connectNulls}
          stroke="transparent"
          strokeWidth={20}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
          legendType="none"
          tooltipType="none"
          style={{ cursor: 'pointer' }}
          onClick={select}
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
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={isDashed ? '5 5' : undefined}
        isAnimationActive={false}
        style={{
          ...(maskId ? { mask: `url(#${maskId})` } : {}),
          // The hit line underneath owns the pointer; without this the visible
          // line swallows the click it is sitting on top of.
          ...(isClickable ? { cursor: 'pointer', pointerEvents: 'none' } : {}),
        }}
        {...lineProps}
      >
        {animateDash && <AnimatedDashedStroke dash={5} />}
        {labels}
      </RechartsLine>
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

/** The category axis. */
function XAxis({
  tickLine = false,
  axisLine = false,
  tickMargin = 8,
  minTickGap = 8,
  label,
  ...rest
}: ChartXAxisProps) {
  const { isLoading } = useComposedChart()
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

/** The value axis — the only one, by design. */
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
  const { isLoading } = useComposedChart()
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
  const { isLoading, selectedDataKey } = useComposedChart()
  if (isLoading) return null

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={cursor ? { strokeDasharray: '3 3', strokeWidth: STROKE_WIDTH } : false}
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
  const { selectedDataKey, selectDataKey } = useComposedChart()

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
  const { isLoading } = useComposedChart()
  if (isLoading) return null
  return <ChartBackground variant={variant} />
}

/** The skeleton drawn in place of the real marks. */
function LoadingBar({ chartId, onShimmerExit }: { chartId: string; onShimmerExit: () => void }) {
  return (
    <>
      <RechartsBar
        dataKey={LOADING_KEY}
        fill="currentColor"
        fillOpacity={0.15}
        radius={BAR_RADIUS}
        isAnimationActive={false}
        legendType="none"
        className="text-(--ink)"
        style={{ mask: `url(#${chartId}-loading-mask)` }}
      />
      <defs>
        <LoadingShimmer id={chartId} onShimmerExit={onShimmerExit} />
      </defs>
    </>
  )
}

ComposedChart.Bar = Bar
ComposedChart.Line = Line
ComposedChart.Dot = Dot
ComposedChart.ActiveDot = ActiveDot
ComposedChart.XAxis = XAxis
ComposedChart.YAxis = YAxis
ComposedChart.Grid = Grid
ComposedChart.Tooltip = Tooltip
ComposedChart.Legend = Legend
ComposedChart.Background = Background
ComposedChart.ReferenceLine = ReferenceLine
ComposedChart.ReferenceBand = ReferenceBand
ComposedChart.Annotation = Annotation
ComposedChart.Values = Values
ComposedChart.Brush = Brush
ComposedChart.Toolbar = Toolbar

export default ComposedChart
