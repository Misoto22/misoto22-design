'use client'

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  PolarAngleAxis as RechartsPolarAngleAxis,
  PolarGrid as RechartsPolarGrid,
  PolarRadiusAxis as RechartsPolarRadiusAxis,
  Radar as RechartsRadar,
  RadarChart as RechartsRadarChart,
} from 'recharts'
import { useReducedMotion } from 'motion/react'
import { ChartContainer, colorStops, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartDot, type ChartDotVariant } from '../lib/dot'
import { ChartLegend, ChartLegendContent } from '../lib/legend'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import { LoadingIndicator } from '../lib/loading'
import { ColorStops, GlowFilter, SeriesGradient } from '../lib/paint'
import type { ChartLegendSlotProps, ChartTooltipSlotProps } from '../AreaChart/AreaChart'

const STROKE_WIDTH = 1
/**
 * How solid a filled radar is, as a multiplier on `--chart-fill`.
 *
 * Above 1 because a radar's fill is the mark itself rather than a wash under a
 * line — it has to hold its shape where two of them overlap.
 */
const FILL_STRENGTH = 2.2
const LOADING_POINTS = 6

/** One skeleton morph, in milliseconds. */
const LOADING_CYCLE = 1500

/**
 * Whether a radar is filled or left as an outline.
 *
 * `lines` is the honest default above two series: filled polygons overlap, and
 * the reader is then judging areas through two layers of translucency, which is
 * the one thing a radar is worst at.
 */
export type RadarVariant = 'filled' | 'lines'

interface RadarChartContextValue {
  config: ChartConfig
  isLoading: boolean
  selectedDataKey: string | null
  selectDataKey: (dataKey: string | null) => void
}

const RadarChartContext = createContext<RadarChartContextValue | null>(null)

function useRadarChart(): RadarChartContextValue {
  const context = useContext(RadarChartContext)
  if (!context) throw new Error('A radar chart part must be rendered inside <RadarChart>')
  return context
}

type ValidateKeys<TData, TConfig> = {
  [K in keyof TConfig]: K extends keyof TData ? ChartConfig[string] : never
}

export interface RadarChartProps<
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
  chartProps?: ComponentProps<typeof RechartsRadarChart>
  /** The series lit on first render. Selection dims every other series. */
  defaultSelectedDataKey?: string | null
  /** Fires when the selection changes, and with null when it is cleared. */
  onSelectionChange?: (selectedDataKey: string | null) => void
  /**
   * Swaps the marks for an animated skeleton, keeping the measured height so
   * the page does not jump when the data lands.
   */
  isLoading?: boolean
  /** How many points the skeleton draws. */
  loadingPoints?: number
  /** The row field naming each spoke. Used by the table view. */
  angleDataKey?: keyof TData & string
  /**
   * Drops the hidden table view. Only correct when the page prints the data
   * itself.
   */
  hideDataTable?: boolean
}

/**
 * A profile across several named dimensions — the shape for "what is this thing
 * strong and weak at".
 *
 * It reads a SHAPE, not a set of values: the area a radar encloses depends on
 * the order the spokes happen to be in, so it is the wrong chart for comparing
 * magnitudes and the right one for recognising a silhouette. Two or three
 * series at most.
 *
 * @example
 * <RadarChart title="Team skills" config={config} data={data} angleDataKey="skill">
 *   <RadarChart.PolarGrid />
 *   <RadarChart.PolarAngleAxis dataKey="skill" />
 *   <RadarChart.Tooltip />
 *   <RadarChart.Radar dataKey="current" />
 * </RadarChart>
 */
export function RadarChart<
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
  defaultSelectedDataKey = null,
  onSelectionChange,
  isLoading = false,
  loadingPoints,
  angleDataKey,
  hideDataTable = false,
}: RadarChartProps<TData, TConfig>) {
  const chartId = useId().replace(/:/g, '')
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(defaultSelectedDataKey)
  const loadingData = useLoadingShape(isLoading, loadingPoints)

  const selectDataKey = useCallback(
    (next: string | null) => {
      setSelectedDataKey(next)
      onSelectionChange?.(next)
    },
    [onSelectionChange],
  )

  const context = useMemo<RadarChartContextValue>(
    () => ({ config, isLoading, selectedDataKey, selectDataKey }),
    [config, isLoading, selectDataKey, selectedDataKey],
  )

  return (
    <RadarChartContext.Provider value={context}>
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
                rowKey: angleDataKey,
                columns: Object.entries(config).map(([key, series]) => ({
                  key,
                  label: series.label,
                })),
              }
        }
      >
        <ChartContainer config={config}>
          <RechartsRadarChart id={chartId} data={isLoading ? loadingData : data} {...chartProps}>
            {children}
            {isLoading && <LoadingRadar />}
          </RechartsRadarChart>
        </ChartContainer>
        <LoadingIndicator isLoading={isLoading} />
      </ChartFigure>
    </RadarChartContext.Provider>
  )
}

export interface RadarProps {
  dataKey: string
  variant?: RadarVariant
  /**
   * How solid the filled area is, 0–1. Left unset it follows `--chart-fill`,
   * which is what keeps it readable on both grounds.
   */
  fillOpacity?: number
  /** A halo around the outline — for the one series that is the point. */
  glowing?: boolean
  isClickable?: boolean
  children?: ReactNode
  radarProps?: Omit<ComponentProps<typeof RechartsRadar>, 'dataKey'>
}

/** One radar series, with its stroke, fill and glow scoped to its own id. */
function Radar({
  dataKey,
  variant = 'filled',
  fillOpacity,
  glowing = false,
  isClickable = false,
  children,
  radarProps,
}: RadarProps) {
  const { config, isLoading, selectedDataKey, selectDataKey } = useRadarChart()
  const id = useId().replace(/:/g, '')

  if (isLoading) return null

  const isSelected = selectedDataKey === null || selectedDataKey === dataKey
  const dimmed = isClickable && !isSelected
  // The fill recedes twice as far as the stroke. A dimmed outline still traces
  // its shape, which is what a radar is read by; a dimmed fill just muddies the
  // one that was picked.
  const opacity = { stroke: dimmed ? 0.2 : 1, fill: dimmed ? 0.1 : 1, dot: dimmed ? 0.2 : 1 }
  const isFilled = variant === 'filled'

  const { dot, activeDot } = resolveDots(children, id, dataKey, opacity.dot)
  // `--chart-fill` is a number, not a length, so it can be read into a
  // calc() the SVG attribute accepts — which is how the default follows the
  // ground without the component knowing which ground it is on.
  const filledStrength = `calc(var(--chart-fill) * ${FILL_STRENGTH})` as unknown as number
  const stops = colorStops(config[dataKey])

  return (
    <>
      <RechartsRadar
        dataKey={dataKey}
        stroke={`url(#${id}-stroke-${dataKey})`}
        strokeOpacity={opacity.stroke}
        strokeWidth={STROKE_WIDTH}
        fill={isFilled ? `url(#${id}-fill-${dataKey})` : 'none'}
        fillOpacity={isFilled ? (fillOpacity ?? filledStrength) * opacity.fill : 0}
        dot={dot}
        activeDot={activeDot}
        filter={glowing ? `url(#${id}-glow-${dataKey})` : undefined}
        className="transition-opacity duration-(--duration-base)"
        style={isClickable ? { cursor: 'pointer' } : undefined}
        onClick={() => {
          if (!isClickable) return
          selectDataKey(selectedDataKey === dataKey ? null : dataKey)
        }}
        {...radarProps}
      />
      <defs>
        {/* The dots read this one; the stroke and fill get their own below. */}
        <SeriesGradient id={id} dataKey={dataKey} config={config} />
        <linearGradient id={`${id}-stroke-${dataKey}`} x1="0" y1="0" x2="1" y2="1">
          <ColorStops dataKey={dataKey} stops={stops} />
        </linearGradient>
        {isFilled && (
          // Radial, and fading outward: a flat fill makes the outer ring — the
          // part carrying the shape — the least readable part of the mark.
          <radialGradient id={`${id}-fill-${dataKey}`} cx="50%" cy="50%" r="50%">
            <ColorStops
              dataKey={dataKey}
              stops={stops}
              opacities={
                stops === 1 ? [0.8, 0.3] : Array.from({ length: stops }, (_, i) => (i === 0 ? 0.8 : 0.3))
              }
            />
          </radialGradient>
        )}
        {glowing && <GlowFilter id={id} dataKey={dataKey} spread={4} intensity={0.6} />}
      </defs>
    </>
  )
}

export interface DotProps {
  variant?: ChartDotVariant
}

/** The resting point marker for the radar it is composed inside. A slot. */
const Dot: FC<DotProps> = () => null

/** The marker under the pointer. */
const ActiveDot: FC<DotProps> = () => null

function resolveDots(children: ReactNode, id: string, dataKey: string, dotOpacity: number) {
  let dot: ComponentProps<typeof RechartsRadar>['dot'] = false
  let activeDot: ComponentProps<typeof RechartsRadar>['activeDot'] = false

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const { variant } = (child as ReactElement<DotProps>).props

    if (child.type === Dot) {
      dot = <ChartDot variant={variant} dataKey={dataKey} chartId={id} fillOpacity={dotOpacity} />
    }
    if (child.type === ActiveDot) {
      activeDot = (
        <ChartDot variant={variant} dataKey={dataKey} chartId={id} fillOpacity={dotOpacity} />
      )
    }
  })

  return { dot, activeDot }
}

/**
 * The web behind the marks. `gridType="circle"` swaps the polygon for rings,
 * which reads as a scale rather than as a shape and suits a single series.
 */
function PolarGrid({
  gridType = 'polygon',
  stroke = 'var(--chart-grid)',
  strokeDasharray = '3 4',
  ...rest
}: ComponentProps<typeof RechartsPolarGrid>) {
  return (
    <RechartsPolarGrid
      gridType={gridType}
      stroke={stroke}
      strokeDasharray={strokeDasharray}
      {...rest}
    />
  )
}

/** The spoke labels around the perimeter. */
function PolarAngleAxis({
  tick = { fill: 'var(--chart-axis)', fontSize: 12 },
  tickLine = false,
  ...rest
}: ComponentProps<typeof RechartsPolarAngleAxis>) {
  const { isLoading } = useRadarChart()
  if (isLoading) return null
  return <RechartsPolarAngleAxis tick={tick} tickLine={tickLine} {...rest} />
}

/** The scale running out from the centre. */
function PolarRadiusAxis({
  tick = { fill: 'var(--chart-axis)', fontSize: 10 },
  tickLine = false,
  axisLine = false,
  ...rest
}: ComponentProps<typeof RechartsPolarRadiusAxis>) {
  const { isLoading } = useRadarChart()
  if (isLoading) return null
  return (
    <RechartsPolarRadiusAxis tick={tick} tickLine={tickLine} axisLine={axisLine} {...rest} />
  )
}

/** The hover panel. No crosshair: there is no straight axis to run one along. */
function Tooltip({ variant, roundness, defaultIndex }: ChartTooltipSlotProps) {
  const { isLoading, selectedDataKey } = useRadarChart()
  if (isLoading) return null

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={false}
      content={
        <ChartTooltipContent selected={selectedDataKey} roundness={roundness} variant={variant} />
      }
    />
  )
}

/** The key. Under the web and centred, since the spokes name dimensions, not series. */
function Legend({
  variant,
  align = 'center',
  verticalAlign = 'bottom',
  isClickable = false,
}: ChartLegendSlotProps) {
  const { isLoading, selectedDataKey, selectDataKey } = useRadarChart()
  if (isLoading) return null

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

/** The decorative plate behind the web. */
function Background({ variant = 'dots' }: { variant?: ChartBackgroundVariant }) {
  const { isLoading } = useRadarChart()
  if (isLoading) return null
  return <ChartBackground variant={variant} />
}

/** A deterministic spoke value, so the server and the client agree. */
function shape(index: number, cycle: number): number {
  const x = Math.sin(index * 91.7 + cycle * 47.3) * 21_942.7
  return 30 + (x - Math.floor(x)) * 70
}

/**
 * The skeleton's spokes, re-rolled once per cycle.
 *
 * An interval rather than the shimmer's exit callback: a radar's skeleton
 * animates by MORPHING between shapes, which is Recharts' own transition, so
 * there is no travelling highlight to synchronise against.
 */
function useLoadingShape(isLoading: boolean, points = LOADING_POINTS) {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => setCycle((previous) => previous + 1), LOADING_CYCLE)
    return () => clearInterval(timer)
  }, [isLoading])

  return useMemo(
    () =>
      Array.from({ length: points }, (_, index) => ({
        spoke: String.fromCharCode(65 + index),
        value: shape(index, cycle),
      })),
    [cycle, points],
  )
}

/** The skeleton radar, morphing between shapes while the data is in flight. */
function LoadingRadar() {
  const reduceMotion = useReducedMotion()

  return (
    <RechartsRadar
      dataKey="value"
      stroke="currentColor"
      strokeOpacity={0.3}
      strokeWidth={2}
      fill="currentColor"
      fillOpacity={0.1}
      dot={false}
      className="text-(--ink)"
      isAnimationActive={!reduceMotion}
      animationDuration={LOADING_CYCLE}
      animationEasing="ease-in-out"
    />
  )
}

RadarChart.Radar = Radar
RadarChart.Dot = Dot
RadarChart.ActiveDot = ActiveDot
RadarChart.PolarGrid = PolarGrid
RadarChart.PolarAngleAxis = PolarAngleAxis
RadarChart.PolarRadiusAxis = PolarRadiusAxis
RadarChart.Tooltip = Tooltip
RadarChart.Legend = Legend
RadarChart.Background = Background

export default RadarChart
