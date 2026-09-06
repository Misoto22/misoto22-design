'use client'

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  type ComponentProps,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  LabelList as RechartsLabelList,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  Sector,
  type PieSectorShapeProps,
} from 'recharts'
import { motion, useReducedMotion } from 'motion/react'
import { ChartContainer, colorStops, cssName, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { type ChartEmptyProps } from '../lib/empty'
import { useChartSelection } from '../lib/selection'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartLegend, ChartLegendContent } from '../lib/legend'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import { LoadingIndicator } from '../lib/loading'
import { ColorStops } from '../lib/paint'
import type { ChartLegendSlotProps, ChartTooltipSlotProps } from '../AreaChart/AreaChart'

/** Equal wedges the skeleton is built from. */
const LOADING_SECTORS = 5

/** One full pulse of the loading wave, in seconds. */
const LOADING_PULSE = 2

/**
 * How a sector is painted.
 *
 * One variant, and the honesty is deliberate: a wedge is a small, awkwardly
 * shaped area, and a texture inside one reads as noise rather than as identity.
 * Where a bar chart differentiates by fill, a pie differentiates by the gap
 * between sectors — which is what `paddingAngle` is for — and by its legend.
 */
export type PieVariant = 'gradient'

interface PieChartContextValue {
  config: ChartConfig
  data: Record<string, unknown>[]
  dataKey: string
  nameKey: string
  isLoading: boolean
  selectedSector: string | null
  selectSector: (sector: string | null) => void
}

const PieChartContext = createContext<PieChartContextValue | null>(null)

function usePieChart(): PieChartContextValue {
  const context = useContext(PieChartContext)
  if (!context) throw new Error('A pie chart part must be rendered inside <PieChart>')
  return context
}

export interface PieChartProps<TData extends Record<string, unknown>> {
  /** Sector names → their label and paint. Keys must match the `nameKey` values. */
  config: ChartConfig
  /** The rows the chart draws. One entry per point, bar or category. */
  data: TData[]
  /** The row field holding each sector's number. */
  dataKey: keyof TData & string
  /** The row field holding each sector's name. */
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
  chartProps?: ComponentProps<typeof RechartsPieChart>
  /** The sector lit on first render, when the chart keeps its own selection. */
  defaultSelectedSector?: string | null
  /**
   * The selected sector, driven from outside.
   *
   * Give this and the chart follows it; leave it undefined and the chart keeps
   * its own, starting from `defaultSelectedSector`.
   */
  selectedSector?: string | null
  /** Fires when the selection changes, and with null when it is cleared. */
  onSelectionChange?: (selection: { name: string; value: number } | null) => void
  /**
   * Swaps the marks for an animated skeleton, keeping the measured height so
   * the page does not jump when the data lands.
   */
  isLoading?: boolean
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
 * Parts of one whole.
 *
 * Worth saying plainly: a pie answers "roughly what share" and nothing more
 * precise. Comparing two adjacent wedges by eye is unreliable past about five
 * of them, and comparing a wedge across two pies is worse. When the reader
 * needs to rank or compare, a `<BarChart>` answers the same question better.
 *
 * @example
 * <PieChart title="Visitors by browser" config={config} data={data} dataKey="visitors" nameKey="browser">
 *   <PieChart.Pie innerRadius="55%" />
 *   <PieChart.Tooltip />
 *   <PieChart.Legend />
 * </PieChart>
 */
export function PieChart<TData extends Record<string, unknown>>({
  config,
  data,
  dataKey,
  nameKey,
  title,
  showTitle,
  description,
  children,
  className,
  chartProps,
  defaultSelectedSector = null,
  selectedSector: controlledSector,
  onSelectionChange,
  isLoading = false,
  hideDataTable = false,
  empty,
}: PieChartProps<TData>) {
  // Not a literal. Two pies on one page shared a hard-coded id in the shape
  // this was ported from, so the second one inherited the first one's paint.
  const chartId = useId().replace(/:/g, '')

  const report = useCallback(
    (name: string | null) => {
      if (name === null) {
        onSelectionChange?.(null)
        return
      }
      const row = data.find((item) => item[nameKey] === name)
      if (row) onSelectionChange?.({ name, value: row[dataKey] as number })
    },
    [data, dataKey, nameKey, onSelectionChange],
  )

  const [selectedSector, selectSector] = useChartSelection(
    controlledSector,
    defaultSelectedSector,
    report,
  )

  const context = useMemo<PieChartContextValue>(
    () => ({ config, data, dataKey, nameKey, isLoading, selectedSector, selectSector }),
    [config, data, dataKey, isLoading, nameKey, selectSector, selectedSector],
  )

  return (
    <PieChartContext.Provider value={context}>
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
                rowKey: nameKey,
                columns: [{ key: dataKey, label: 'Value' }],
              }
        }
        isEmpty={!isLoading && data.length === 0}
        empty={empty}
      >
        <ChartContainer config={config}>
          <RechartsPieChart id={chartId} accessibilityLayer {...chartProps}>
            {children}
          </RechartsPieChart>
        </ChartContainer>
        <LoadingIndicator isLoading={isLoading} />
      </ChartFigure>
    </PieChartContext.Provider>
  )
}

export interface PieProps {
  variant?: PieVariant
  /** Above zero makes it a donut, which is easier to read than a full pie. */
  innerRadius?: number | string
  outerRadius?: number | string
  /** Rounds each wedge's corners. */
  cornerRadius?: number
  /**
   * Degrees between wedges. Negative overlaps them, which the sector's own
   * surface-coloured stroke then separates — the "stacked cards" look.
   */
  paddingAngle?: number
  startAngle?: number
  endAngle?: number
  isClickable?: boolean
  /** Sector names drawn with a halo — for the one wedge that is the point. */
  glowingSectors?: string[]
  /** `<PieChart.Label>`. */
  children?: ReactNode
  pieProps?: Omit<ComponentProps<typeof RechartsPie>, 'data' | 'dataKey' | 'nameKey'>
}

/** Stable identity, so the default never re-triggers the memo below. */
const NO_GLOW: string[] = []

/** The wedges themselves, with their gradients scoped to this pie's id. */
function Pie({
  variant = 'gradient',
  innerRadius = 0,
  outerRadius = '80%',
  cornerRadius = 0,
  paddingAngle = 0,
  startAngle = 0,
  endAngle = 360,
  isClickable = false,
  glowingSectors = NO_GLOW,
  children,
  pieProps,
}: PieProps) {
  const { config, data, dataKey, nameKey, isLoading, selectedSector, selectSector } = usePieChart()
  const id = useId().replace(/:/g, '')

  if (isLoading) {
    return (
      <RechartsPie
        data={LOADING_DATA}
        dataKey="value"
        nameKey="name"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        cornerRadius={cornerRadius}
        paddingAngle={paddingAngle}
        startAngle={startAngle}
        endAngle={endAngle}
        strokeWidth={0}
        isAnimationActive={false}
        shape={(props) => <LoadingSector {...props} />}
      />
    )
  }

  const label = resolveLabel(children, dataKey)
  const painted = data.map((row) => ({
    ...row,
    fill: `url(#${id}-colors-${cssName(String(row[nameKey]))})`,
  }))

  return (
    <>
      <RechartsPie
        data={painted}
        dataKey={dataKey}
        nameKey={nameKey}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        cornerRadius={cornerRadius}
        paddingAngle={paddingAngle}
        startAngle={startAngle}
        endAngle={endAngle}
        strokeWidth={0}
        style={isClickable ? { cursor: 'pointer' } : undefined}
        onClick={(_, index) => {
          if (!isClickable) return
          const name = data[index]?.[nameKey] as string
          selectSector(selectedSector === name ? null : name)
        }}
        shape={(props: PieSectorShapeProps) => {
          const name = String(data[props.index ?? 0]?.[nameKey] ?? '')
          const isGlowing = glowingSectors.includes(name)
          const dimmed = isClickable && selectedSector !== null && selectedSector !== name

          return (
            <Sector
              {...props}
              fill={`url(#${id}-colors-${cssName(name)})`}
              filter={isGlowing ? `url(#${id}-glow-${cssName(name)})` : undefined}
              // A negative padding angle overlaps the wedges; the surface-
              // coloured stroke is what re-separates them into stacked cards.
              stroke={paddingAngle < 0 ? 'var(--chart-surface)' : 'none'}
              strokeWidth={paddingAngle < 0 ? 5 : 0}
              opacity={dimmed ? 0.15 : 1}
              className="transition-opacity duration-(--duration-base)"
            />
          )
        }}
        {...pieProps}
      >
        {label}
      </RechartsPie>
      <defs>
        <SectorGradients id={id} config={config} variant={variant} />
        {glowingSectors.map((name) => (
          <filter
            key={name}
            id={`${id}-glow-${cssName(name)}`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
    </>
  )
}

export interface PieLabelProps {
  /** The field printed on each wedge. Defaults to the pie's value key. */
  dataKey?: string
  labelListProps?: Omit<ComponentProps<typeof RechartsLabelList>, 'dataKey'>
}

/**
 * Numbers printed on the wedges. A slot — the parent reads it.
 *
 * Worth reaching for: a pie's whole weakness is that a wedge's angle is hard to
 * read, and a printed number removes the guess entirely.
 */
const Label: FC<PieLabelProps> = () => null

/** Lifts a `<Label>` out of the pie's children into a Recharts label list. */
function resolveLabel(children: ReactNode, valueKey: string): ReactNode {
  let label: ReactNode = null

  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== Label) return
    const { dataKey, labelListProps } = (child as ReactElement<PieLabelProps>).props

    label = (
      <RechartsLabelList
        dataKey={dataKey ?? valueKey}
        stroke="none"
        fontSize={12}
        fontWeight={500}
        // Reversed out of the wedge, which is the only ground it ever sits on.
        className="fill-(--chart-surface)"
        {...labelListProps}
      />
    )
  })

  return label
}

/**
 * One diagonal gradient per sector.
 *
 * Diagonal rather than horizontal: a wedge is a radial shape, and a gradient
 * running corner to corner reads as light across the whole pie rather than as
 * a seam through each slice.
 */
function SectorGradients({
  id,
  config,
}: {
  id: string
  config: ChartConfig
  /** Reserved: the pie has one fill variant. See `PieVariant`. */
  variant: PieVariant
}) {
  return (
    <>
      {Object.entries(config).map(([key, series]) => (
        <linearGradient
          key={key}
          id={`${id}-colors-${cssName(key)}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <ColorStops dataKey={cssName(key)} stops={colorStops(series)} />
        </linearGradient>
      ))}
    </>
  )
}

/** The hover panel. No heading: the wedge's own name is the row label. */
function Tooltip({ variant, roundness, defaultIndex }: ChartTooltipSlotProps) {
  const { isLoading, nameKey } = usePieChart()
  if (isLoading) return null

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      content={
        <ChartTooltipContent nameKey={nameKey} hideLabel roundness={roundness} variant={variant} />
      }
    />
  )
}

/**
 * The key. Under the pie and centred by default, because a pie's sectors are
 * named nowhere else — unlike a bar chart, which has a category axis.
 */
function Legend({
  variant,
  align = 'center',
  verticalAlign = 'bottom',
  isClickable = false,
}: ChartLegendSlotProps) {
  const { nameKey, selectedSector, selectSector } = usePieChart()

  return (
    <ChartLegend
      verticalAlign={verticalAlign}
      align={align}
      content={
        <ChartLegendContent
          selected={selectedSector}
          onSelectChange={selectSector}
          isClickable={isClickable}
          nameKey={nameKey}
          variant={variant}
        />
      }
    />
  )
}

/** The decorative plate behind the pie. Compose it before `<Pie>`. */
function Background({ variant = 'dots' }: { variant?: ChartBackgroundVariant }) {
  return <ChartBackground variant={variant} />
}

/** Equal wedges for the skeleton. */
const LOADING_DATA = Array.from({ length: LOADING_SECTORS }, (_, index) => ({
  name: `loading-${index}`,
  value: 100 / LOADING_SECTORS,
}))

/**
 * One skeleton wedge, pulsing on a stagger so the wave travels round the pie.
 * Under `prefers-reduced-motion` it holds at a flat mid-opacity instead.
 */
function LoadingSector(props: ComponentProps<typeof Sector> & { index?: number }) {
  const { index = 0, ...sector } = props
  const reduceMotion = useReducedMotion()
  const delay = (index / LOADING_SECTORS) * LOADING_PULSE

  if (reduceMotion) {
    return (
      <g opacity={0.3} className="text-(--ink)">
        <Sector {...sector} fill="currentColor" />
      </g>
    )
  }

  return (
    <motion.g
      className="text-(--ink)"
      initial={{ opacity: 0.15 }}
      animate={{ opacity: [0.15, 0.5, 0.15] }}
      transition={{ duration: LOADING_PULSE, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Sector {...sector} fill="currentColor" />
    </motion.g>
  )
}

PieChart.Pie = Pie
PieChart.Label = Label
PieChart.Tooltip = Tooltip
PieChart.Legend = Legend
PieChart.Background = Background

export default PieChart
