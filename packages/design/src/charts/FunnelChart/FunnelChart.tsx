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
  Funnel as RechartsFunnel,
  FunnelChart as RechartsFunnelChart,
  LabelList,
} from 'recharts'
import { ChartContainer, colorStops, cssName, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import { ColorStops } from '../lib/paint'
import type { ChartTooltipSlotProps } from '../AreaChart/AreaChart'

/**
 * How each stage is painted.
 *
 * `stepped` is the honest default: every stage keeps the same fill and the
 * TAPER carries the drop. A ramp that also darkens each stage encodes the same
 * fact twice and invites the reader to compare two things that are one.
 */
export type FunnelVariant = 'stepped' | 'ramp'

interface FunnelChartContextValue {
  config: ChartConfig
  nameKey: string
  dataKey: string
  data: Record<string, unknown>[]
}

const FunnelChartContext = createContext<FunnelChartContextValue | null>(null)

function useFunnelChart(): FunnelChartContextValue {
  const context = useContext(FunnelChartContext)
  if (!context) throw new Error('A funnel chart part must be rendered inside <FunnelChart>')
  return context
}

export interface FunnelChartProps<TData extends Record<string, unknown>> {
  /** Stage names → their label and paint. Keys must match the `nameKey` values. */
  config: ChartConfig
  /** The stages, widest first. Order is the funnel; it is not sorted for you. */
  data: TData[]
  /** The row field holding each stage's number. */
  dataKey: keyof TData & string
  /** The row field naming each stage. */
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
  /** The composed parts — `<Funnel>`, `<Tooltip>`. */
  children: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Escape hatch onto the raw Recharts chart element. */
  chartProps?: ComponentProps<typeof RechartsFunnelChart>
  /** Drops the hidden table view. Only correct when the page prints the data itself. */
  hideDataTable?: boolean
}

/**
 * Stages that only ever narrow — a signup flow, a hiring pipeline, a checkout.
 *
 * The caveat is the same one every funnel has: the taper encodes a RATIO
 * between neighbouring stages, and the eye reads the enclosed area, so a funnel
 * exaggerates a shallow drop and flattens a steep one. Where the exact fall-off
 * is the point, put the percentages on the stages — `<Funnel.Label>` does — or
 * use a `<BarChart>`, which encodes each stage on one honest scale.
 *
 * Reach for `<SankeyChart>` instead when the flow can SPLIT rather than only
 * shrink: a funnel has one path through it by construction.
 *
 * @example
 * <FunnelChart title="Signup funnel" config={config} data={stages} dataKey="people" nameKey="stage">
 *   <FunnelChart.Funnel>
 *     <FunnelChart.Label />
 *   </FunnelChart.Funnel>
 *   <FunnelChart.Tooltip />
 * </FunnelChart>
 */
export function FunnelChart<TData extends Record<string, unknown>>({
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
  hideDataTable = false,
}: FunnelChartProps<TData>) {
  const chartId = useId().replace(/:/g, '')

  const context = useMemo<FunnelChartContextValue>(
    () => ({ config, nameKey, dataKey, data }),
    [config, data, dataKey, nameKey],
  )

  return (
    <FunnelChartContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={
          hideDataTable
            ? false
            : { rows: data, rowKey: nameKey, columns: [{ key: dataKey, label: 'Value' }] }
        }
      >
        <ChartContainer config={config}>
          <RechartsFunnelChart id={chartId} accessibilityLayer {...chartProps}>
            {children}
            <defs>
              {Object.entries(config).map(([key, series]) => (
                <linearGradient
                  key={key}
                  id={`${chartId}-stage-${cssName(key)}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <ColorStops dataKey={cssName(key)} stops={colorStops(series)} />
                </linearGradient>
              ))}
            </defs>
          </RechartsFunnelChart>
        </ChartContainer>
      </ChartFigure>
    </FunnelChartContext.Provider>
  )
}

export interface FunnelProps {
  variant?: FunnelVariant
  /** Whether the funnel narrows downward or along the inline axis. */
  orientation?: 'vertical' | 'horizontal'
  /** Gap between stages, in pixels. */
  gap?: number
  /** `<FunnelChart.Label>`. */
  children?: ReactNode
  funnelProps?: Omit<ComponentProps<typeof RechartsFunnel>, 'data' | 'dataKey'>
}

/** The stages themselves. */
function Funnel({
  variant = 'stepped',
  orientation = 'vertical',
  gap = 2,
  children,
  funnelProps,
}: FunnelProps) {
  const { config, data, dataKey, nameKey } = useFunnelChart()
  const chartId = useId().replace(/:/g, '')

  // `ramp` walks the series ramp stage by stage; `stepped` holds slot one for
  // all of them and lets the shape do the talking.
  const painted = data.map((row, index) => {
    const name = String(row[nameKey])
    const slot = variant === 'ramp' ? `var(--series-${(index % 8) + 1})` : undefined
    return {
      ...row,
      fill: slot ?? (name in config ? `url(#${chartId}-stage-${cssName(name)})` : 'var(--series-1)'),
    }
  })

  return (
    <>
      <RechartsFunnel
        dataKey={dataKey}
        nameKey={nameKey}
        data={painted}
        isAnimationActive={false}
        // A surface-coloured stroke rather than a transparent gap: the stages
        // touch by construction, and a hairline of the page between them is
        // what makes two similar stages countable.
        stroke="var(--chart-surface)"
        strokeWidth={gap}
        orientation={orientation}
        {...funnelProps}
      >
        {children}
      </RechartsFunnel>
      <defs>
        {Object.entries(config).map(([key, series]) => (
          <linearGradient
            key={key}
            id={`${chartId}-stage-${cssName(key)}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <ColorStops dataKey={cssName(key)} stops={colorStops(series)} />
          </linearGradient>
        ))}
      </defs>
    </>
  )
}

export interface FunnelLabelProps {
  /** The field printed on each stage. Defaults to the stage's name. */
  dataKey?: string
  /** Where the label sits relative to its stage. */
  position?: ComponentProps<typeof LabelList>['position']
  labelListProps?: Omit<ComponentProps<typeof LabelList>, 'dataKey'>
}

/**
 * Names printed on the stages.
 *
 * Worth reaching for: a funnel's taper is a ratio the eye reads badly, and a
 * printed number is the relief for that.
 */
function Label({ dataKey, position = 'right', labelListProps }: FunnelLabelProps) {
  const { nameKey } = useFunnelChart()

  return (
    <LabelList
      dataKey={dataKey ?? nameKey}
      position={position}
      stroke="none"
      fontSize={12}
      className="fill-(--ink)"
      {...labelListProps}
    />
  )
}

/** The hover panel. No heading: the stage's own name is the row label. */
function Tooltip({ variant, roundness, defaultIndex }: ChartTooltipSlotProps) {
  const { nameKey } = useFunnelChart()

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

FunnelChart.Funnel = Funnel
FunnelChart.Label = Label
FunnelChart.Tooltip = Tooltip

export default FunnelChart
