'use client'

import { useMemo, type ComponentProps, type CSSProperties } from 'react'
import { Tooltip as RechartsTooltip } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { DefaultTooltipContentProps } from 'recharts'
import { cn } from '../../lib/cn'
import { colorStops, cssName, seriesFromPayload, useChart } from './chart'

/**
 * The tooltip's corner, on the system's radius ladder.
 *
 * Three steps, not the four this was ported with: the ladder has four rungs and
 * the fourth is the pill, which is a shape rather than a corner. An `xl` that
 * resolved to "the same as lg, but 4px more" would be a fifth step invented for
 * one component.
 */
export type ChartTooltipRoundness = 'sm' | 'md' | 'lg'

/** The tooltip's ground: the page's own, or a translucent plate over the plot. */
export type ChartTooltipVariant = 'solid' | 'frosted'

/** How a series is marked beside its value. */
export type ChartTooltipIndicator = 'dot' | 'line' | 'dashed'

const ROUNDNESS: Record<ChartTooltipRoundness, string> = {
  sm: 'rounded-(--radius-sm)',
  md: 'rounded-(--radius)',
  lg: 'rounded-(--radius-lg)',
}

const VARIANT: Record<ChartTooltipVariant, string> = {
  solid: 'bg-(--chart-surface)',
  // The one place the system reaches for a backdrop filter. It is not a shadow
  // — law 2 bans blurred DEPTH — it is the plot showing through a plate that
  // sits on it, which is why the plate still needs its hairline to read as one.
  frosted: 'bg-(--chart-surface)/75 backdrop-blur-sm',
}

export interface ChartTooltipContentProps
  extends Omit<
      DefaultTooltipContentProps<ValueType, NameType>,
      'accessibilityLayer' | 'formatter' | 'labelFormatter'
    >,
    Pick<ComponentProps<typeof RechartsTooltip>, 'formatter' | 'labelFormatter' | 'active'> {
  className?: string
  labelClassName?: string
  /** Drops the row of series marks, leaving only the label. */
  hideIndicator?: boolean
  /** Drops the heading row — the date, the category. */
  hideLabel?: boolean
  indicator?: ChartTooltipIndicator
  /** The row field holding a series name, when it is not the `dataKey`. */
  nameKey?: string
  /** The row field holding the heading, when it is not the axis value. */
  labelKey?: string
  /** The chart's selected series, so the tooltip dims the rest with the plot. */
  selected?: string | null
  roundness?: ChartTooltipRoundness
  variant?: ChartTooltipVariant
}

/**
 * What the hover tooltip prints: a heading, then one row per series.
 *
 * Values are set in the mono face and `tabular-nums` so a column of numbers
 * lines up as the pointer moves along the axis — without it the row width
 * changes under the cursor and the reader chases it.
 */
export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  nameKey,
  labelKey,
  selected,
  roundness = 'lg',
  variant = 'solid',
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const heading = useMemo(() => {
    if (hideLabel || !payload?.length) return null

    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? 'value'}`
    const series = seriesFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string' ? (config[label]?.label ?? label) : series?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium text-(--ink)', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }
    if (!value) return null
    return <div className={cn('font-medium text-(--ink)', labelClassName)}>{value}</div>
  }, [config, hideLabel, label, labelClassName, labelFormatter, labelKey, payload])

  // An empty span rather than null: returning nothing lets Recharts reset the
  // tooltip's position to the origin, so the next hover animates in from the
  // top-left corner of the chart instead of from where the pointer is.
  if (!active || !payload?.length) return <span className="p-4" />

  const nested = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'grid min-w-32 items-start gap-1.5 border border-(--rule-2) px-2.5 py-1.5 text-xs',
        ROUNDNESS[roundness],
        VARIANT[variant],
        className,
      )}
    >
      {!nested ? heading : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== 'none')
          .map((item, index) => {
            const named =
              nameKey && item.payload
                ? (item.payload as Record<string, unknown>)[nameKey]
                : undefined
            const key = `${named ?? item.name ?? item.dataKey ?? 'value'}`
            const series = seriesFromPayload(config, item, key)
            const stops = colorStops(series)

            return (
              <div
                key={index}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-(--ink-3-aa)',
                  indicator === 'dot' && 'items-center',
                  selected != null && selected !== item.dataKey && 'opacity-30',
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, payload)
                ) : (
                  <>
                    {series?.icon ? (
                      <series.icon />
                    ) : (
                      !hideIndicator && (
                        <span
                          aria-hidden
                          className={cn('shrink-0 rounded-[2px]', {
                            'size-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent!':
                              indicator === 'dashed',
                            'my-0.5': nested && indicator === 'dashed',
                          })}
                          style={swatchStyle(key, stops, indicator === 'dashed')}
                        />
                      )
                    )}
                    <div
                      className={cn(
                        'flex flex-1 justify-between gap-4 leading-none',
                        nested ? 'items-end' : 'items-center',
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nested ? heading : null}
                        <span className="text-(--ink-3-aa)">{series?.label ?? item.name}</span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium tabular-nums text-(--ink)">
                          {typeof item.value === 'number'
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

/**
 * The series swatch: one colour, or the same gradient the mark is painted with.
 *
 * A dashed indicator has no fill — it IS its border — so the paint moves to
 * `borderColor`, which cannot take a gradient and takes the first stop instead.
 */
export function swatchStyle(key: string, stops: number, dashed = false): CSSProperties {
  const name = cssName(key)
  if (dashed) return { borderColor: `var(--color-${name}-0)` }
  if (stops <= 1) return { background: `var(--color-${name}-0)` }

  const gradient = Array.from({ length: stops }, (_, index) => {
    const offset = (index / (stops - 1)) * 100
    return `var(--color-${name}-${index}) ${offset}%`
  }).join(', ')

  // `to right` rather than a logical direction: the swatch mirrors the mark's
  // own gradient, and the mark is painted in SVG user space, which does not
  // flip with the document.
  return { background: `linear-gradient(to right, ${gradient})` }
}

/**
 * The Recharts tooltip, with the system's timing.
 *
 * 200ms is short enough that the panel keeps up with a pointer travelling the
 * axis, which is the whole failure mode a slower fade has.
 */
export function ChartTooltip({
  animationDuration = 200,
  ...rest
}: ComponentProps<typeof RechartsTooltip>) {
  return <RechartsTooltip animationDuration={animationDuration} {...rest} />
}
