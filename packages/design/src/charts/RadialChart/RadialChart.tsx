'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import {
  PolarAngleAxis,
  RadialBar as RechartsRadialBar,
  RadialBarChart as RechartsRadialBarChart,
  Sector,
} from 'recharts'
import type { SectorProps } from 'recharts'
import type { TypedDataKey } from 'recharts/types/util/typedDataKey'
import { useReducedMotion } from 'motion/react'
import { ChartContainer, colorStops, cssName, type ChartConfig } from '../lib/chart'
import { findSlot } from '../lib/values'
import { ChartFigure } from '../lib/figure'
import { type ChartEmptyProps } from '../lib/empty'
import { useChartSelection } from '../lib/selection'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartLegend, ChartLegendContent } from '../lib/legend'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import { LoadingIndicator } from '../lib/loading'
import { ColorStops } from '../lib/paint'
import type { ChartLegendSlotProps, ChartTooltipSlotProps } from '../AreaChart/AreaChart'

const CORNER_RADIUS = 5
const BAR_SIZE = 14
const LOADING_BARS = 5

/** One skeleton morph, in milliseconds. */
const LOADING_CYCLE = 1500

/**
 * The arc the bars are drawn on.
 *
 * `full` is a ring; `semi` is the half-circle a gauge wants, with the centre
 * dropped so the arc sits in the middle of its own box rather than at the top.
 */
export type RadialVariant = 'full' | 'semi'

/** The angles and centre each arc shape needs. */
const ARC: Record<RadialVariant, { startAngle: number; endAngle: number; cx: string; cy: string }> =
  {
    // Starting at 90° and running to -270° draws the ring clockwise from noon,
    // which is the direction a reader expects a total to fill in.
    full: { startAngle: 90, endAngle: -270, cx: '50%', cy: '50%' },
    semi: { startAngle: 180, endAngle: 0, cx: '50%', cy: '70%' },
  }

interface RadialChartContextValue {
  config: ChartConfig
  nameKey: string
  isLoading: boolean
  selectedBar: string | null
  selectBar: (name: string | null, value?: number) => void
}

/**
 * The row field holding each bar's number, however the call site said it.
 *
 * `valueKey` is the explicit answer; the arc's own `dataKey` is the one every
 * call site already gives. Reading the slot means the legend reports the same
 * number the arc does, and the table gets built for a chart that named neither
 * — which used to render no table at all.
 */
function valueField(valueKey: string | undefined, children: ReactNode): string | null {
  return valueKey ?? findSlot<RadialBarProps>(children, RadialBar)?.dataKey ?? null
}

const RadialChartContext = createContext<RadialChartContextValue | null>(null)

function useRadialChart(): RadialChartContextValue {
  const context = useContext(RadialChartContext)
  if (!context) throw new Error('A radial chart part must be rendered inside <RadialChart>')
  return context
}

export interface RadialChartProps<TData extends Record<string, unknown>> {
  /** Bar names → their label and paint. Keys must match the `nameKey` values. */
  config: ChartConfig
  /** The rows the chart draws. One entry per point, bar or category. */
  data: TData[]
  /** The row field naming each bar. */
  nameKey: keyof TData & string
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
  chartProps?: ComponentProps<typeof RechartsRadialBarChart>
  /** The arc shape — a full ring, or the half circle a gauge wants. */
  variant?: RadialVariant
  /**
   * What a full sweep is worth.
   *
   * Without it the scale comes from the data, so the largest bar always fills
   * the arc — which is right for a comparison and wrong for a gauge. Set it
   * (typically 100) whenever a single value has to read against a fixed total,
   * or "62%" and "98%" will look identical.
   */
  max?: number
  /** Where the arc starts, from the centre. */
  innerRadius?: number | string
  /** Where the arc ends. */
  outerRadius?: number | string
  /** The bar lit on first render, when the chart keeps its own selection. */
  defaultSelectedBar?: string | null
  /**
   * The selected bar, driven from outside.
   *
   * Give this and the chart follows it; leave it undefined and the chart keeps
   * its own, starting from `defaultSelectedBar`.
   */
  selectedBar?: string | null
  /** Fires when the selection changes, and with null when it is cleared. */
  onSelectionChange?: (selection: { name: string; value: number } | null) => void
  /**
   * Swaps the marks for an animated skeleton, keeping the measured height so
   * the page does not jump when the data lands.
   */
  isLoading?: boolean
  /**
   * The row field holding each bar's number, for the table view and for the
   * selection the legend reports.
   *
   * Falls back to the `dataKey` of the composed `<RadialChart.RadialBar>`, so
   * the usual call site needs neither.
   */
  valueKey?: keyof TData & string
  /**
   * Drops the hidden table view. Only correct when the page prints the data
   * itself.
   */
  hideDataTable?: boolean
  /**
   * What the chart shows when it has nothing to draw. `false` keeps the empty
   * plot, for a chart whose emptiness is itself the reading.
   */
  empty?: ChartEmptyProps | false
}

/**
 * Values on an arc — a gauge, or a small set of totals against one scale.
 *
 * The caveat worth knowing before reaching for it: a radial bar's LENGTH is its
 * value, but its RADIUS is not, so an inner bar and an outer bar of the same
 * value are drawn different lengths. That makes it a poor comparison and a good
 * single-value gauge; past about four bars, a `<BarChart>` is the honest choice.
 *
 * @example
 * <RadialChart title="Storage used" config={config} data={data} nameKey="tier" max={100}>
 *   <RadialChart.RadialBar dataKey="used" />
 *   <RadialChart.Tooltip />
 * </RadialChart>
 */
export function RadialChart<TData extends Record<string, unknown>>({
  config,
  data,
  nameKey,
  title,
  showTitle,
  description,
  children,
  className,
  chartProps,
  variant = 'full',
  max,
  innerRadius = '30%',
  outerRadius = '100%',
  defaultSelectedBar = null,
  selectedBar: controlledBar,
  onSelectionChange,
  isLoading = false,
  valueKey,
  hideDataTable = false,
  empty,
}: RadialChartProps<TData>) {
  const chartId = useId().replace(/:/g, '')
  const loadingData = useLoadingBars(isLoading)
  const arc = ARC[variant]
  const valueSource = valueField(valueKey, children)

  const [selectedBar, setSelection] = useChartSelection(
    controlledBar,
    defaultSelectedBar,
    undefined,
  )

  const selectBar = useCallback(
    (name: string | null, value?: number) => {
      setSelection(name)
      if (!onSelectionChange) return
      if (name === null) {
        onSelectionChange(null)
        return
      }
      // The arc hands its own number in; the legend has only a name, and used
      // to be given a zero on its behalf — so one selection reported two
      // different values depending on which control the reader used. The row is
      // where the legend's number comes from now.
      const row = valueSource ? data.find((entry) => String(entry[nameKey]) === name) : undefined
      const resolved = value ?? (row && valueSource ? Number(row[valueSource]) : Number.NaN)
      onSelectionChange({ name, value: Number.isFinite(resolved) ? resolved : 0 })
    },
    [data, nameKey, onSelectionChange, setSelection, valueSource],
  )

  const painted = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        fill: `url(#${chartId}-colors-${cssName(String(row[nameKey]))})`,
      })),
    [chartId, data, nameKey],
  )

  const context = useMemo<RadialChartContextValue>(
    () => ({ config, nameKey, isLoading, selectedBar, selectBar }),
    [config, isLoading, nameKey, selectBar, selectedBar],
  )

  return (
    <RadialChartContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={
          hideDataTable || !valueSource
            ? false
            : { rows: data, rowKey: nameKey, columns: [{ key: valueSource, label: 'Value' }] }
        }
        isEmpty={!isLoading && data.length === 0}
        empty={empty}
      >
        <ChartContainer config={config}>
          <RechartsRadialBarChart
            id={chartId}
            data={isLoading ? loadingData : painted}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={arc.startAngle}
            endAngle={arc.endAngle}
            cx={arc.cx}
            cy={arc.cy}
            {...chartProps}
          >
            {max != null && max > 0 && (
              <PolarAngleAxis type="number" domain={[0, max]} tick={false} axisLine={false} />
            )}
            {children}
            {isLoading && <LoadingRadialBar />}
            <defs>
              {Object.entries(config).map(([key, series]) => (
                <linearGradient
                  key={key}
                  id={`${chartId}-colors-${cssName(key)}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <ColorStops dataKey={cssName(key)} stops={colorStops(series)} />
                </linearGradient>
              ))}
            </defs>
          </RechartsRadialBarChart>
        </ChartContainer>
        <LoadingIndicator isLoading={isLoading} />
      </ChartFigure>
    </RadialChartContext.Provider>
  )
}

export interface RadialBarProps {
  /** The row field holding each bar's number. */
  dataKey: string
  cornerRadius?: number
  /** How thick each arc is, in pixels. */
  barSize?: number
  /** Draws the unfilled remainder behind each bar. Required reading for a gauge. */
  showTrack?: boolean
  isClickable?: boolean
  radialBarProps?: Omit<ComponentProps<typeof RechartsRadialBar>, 'dataKey'>
}

/** The arcs. One per row. */
function RadialBar({
  dataKey,
  cornerRadius = CORNER_RADIUS,
  barSize = BAR_SIZE,
  showTrack = true,
  isClickable = false,
  radialBarProps,
}: RadialBarProps) {
  const { nameKey, isLoading, selectedBar, selectBar } = useRadialChart()

  if (isLoading) return null

  return (
    <RechartsRadialBar
      dataKey={dataKey as TypedDataKey<Record<string, unknown>>}
      cornerRadius={cornerRadius}
      barSize={barSize}
      background={showTrack}
      style={isClickable ? { cursor: 'pointer' } : undefined}
      onClick={(payload, index) => {
        if (!isClickable) return
        const row = payload as Record<string, unknown>
        const name = (row?.[nameKey] as string | undefined) ?? String(index)
        selectBar(selectedBar === name ? null : name, Number(row?.[dataKey] ?? 0))
      }}
      shape={(props: SectorProps) => {
        const name = (props as unknown as Record<string, unknown>)[nameKey] as string
        const isSelected = selectedBar === null || selectedBar === name

        return (
          <Sector
            {...props}
            opacity={isClickable && !isSelected ? 0.15 : 1}
            className="transition-opacity duration-(--duration-base)"
          />
        )
      }}
      {...radialBarProps}
    />
  )
}

/** The hover panel. No heading: the bar's own name is the row label. */
function Tooltip({ variant, roundness, defaultIndex }: ChartTooltipSlotProps) {
  const { nameKey, isLoading } = useRadialChart()
  if (isLoading) return null

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      cursor={false}
      content={
        <ChartTooltipContent nameKey={nameKey} hideLabel roundness={roundness} variant={variant} />
      }
    />
  )
}

/** The key. Under the arc and centred — nothing else names the bars. */
function Legend({
  variant,
  align = 'center',
  verticalAlign = 'bottom',
  isClickable = false,
}: ChartLegendSlotProps) {
  const { nameKey, isLoading, selectedBar, selectBar } = useRadialChart()
  if (isLoading) return null

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedBar}
          onSelectChange={selectBar}
          isClickable={isClickable}
          nameKey={nameKey}
          variant={variant}
        />
      }
    />
  )
}

/** The decorative plate behind the arc. */
function Background({ variant = 'dots' }: { variant?: ChartBackgroundVariant }) {
  const { isLoading } = useRadialChart()
  if (isLoading) return null
  return <ChartBackground variant={variant} />
}

/** A deterministic bar length, so the server and the client agree. */
function sweep(index: number, cycle: number): number {
  const x = Math.sin(index * 53.9 + cycle * 173.1) * 13_759.3
  return 40 + (x - Math.floor(x)) * 60
}

/** The skeleton's arcs, re-rolled once per cycle. */
function useLoadingBars(isLoading: boolean) {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => setCycle((previous) => previous + 1), LOADING_CYCLE)
    return () => clearInterval(timer)
  }, [isLoading])

  return useMemo(
    () =>
      Array.from({ length: LOADING_BARS }, (_, index) => ({
        name: `loading-${index}`,
        value: sweep(index, cycle),
      })),
    [cycle],
  )
}

/** The skeleton arcs, morphing while the data is in flight. */
function LoadingRadialBar() {
  const reduceMotion = useReducedMotion()

  return (
    <RechartsRadialBar
      dataKey="value"
      cornerRadius={CORNER_RADIUS}
      barSize={BAR_SIZE}
      background
      className="text-(--ink)"
      isAnimationActive={!reduceMotion}
      animationDuration={LOADING_CYCLE}
      animationEasing="ease-in-out"
      shape={(props: SectorProps) => <Sector {...props} fill="currentColor" fillOpacity={0.25} />}
    />
  )
}

RadialChart.RadialBar = RadialBar
RadialChart.Tooltip = Tooltip
RadialChart.Legend = Legend
RadialChart.Background = Background

export default RadialChart
