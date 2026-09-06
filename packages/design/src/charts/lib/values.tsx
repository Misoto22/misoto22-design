'use client'

import { Children, isValidElement, type FC, type ReactElement, type ReactNode } from 'react'
import { LabelList } from 'recharts'
import { defaultTick } from './format'

/**
 * The props of the first child of a given type, or null.
 *
 * Every configuration slot in the package is read this way — a component that
 * renders nothing, whose PROPS are the configuration. It reads better at the
 * call site than a prop bag (`<Chart.Values show="last" />` beside the mark it
 * labels, rather than `valuesShow="last"` on the mark) and it keeps the marks'
 * prop lists from growing a section per optional decoration.
 */
export function findSlot<TProps>(children: ReactNode, type: unknown): TProps | null {
  let found: TProps | null = null
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === type) {
      found = (child as ReactElement<TProps>).props
    }
  })
  return found
}

/**
 * Which points get their number printed.
 *
 * The default is `last`, and the default matters more here than usual: a
 * number on every point is the most common way a chart is spoiled, because the
 * labels then compete with the shape they are annotating and the reader loses
 * both. What a reader almost always wants is the number they would otherwise
 * have to trace back to the axis for — the latest value, or the two ends.
 *
 * `all` exists for the case it is right for: five or six bars, no line, and the
 * exact figures ARE the point. Past that it is a table wearing a chart.
 */
export type ValueLabelMode = 'all' | 'first' | 'last' | 'first-last' | 'extremes'

export interface ValuesProps {
  /** Which points are labelled. */
  show?: ValueLabelMode
  /** Formats each number. Defaults to the axis's own compact formatting. */
  formatValue?: (value: number) => string
  /** Where the label sits relative to its point. */
  position?: 'top' | 'bottom' | 'inside' | 'right'
}

/**
 * Prints the numbers on a series.
 *
 * A slot: it renders nothing itself, and the mark it is composed inside reads
 * its props.
 *
 * @example
 * <BarChart.Bar dataKey="visitors">
 *   <BarChart.Values show="all" />
 * </BarChart.Bar>
 */
export const Values: FC<ValuesProps> = () => null

/** Whether the point at `index` is one of the labelled ones. */
function shows(mode: ValueLabelMode, index: number, count: number, value: number, values: number[]): boolean {
  switch (mode) {
    case 'all':
      return true
    case 'first':
      return index === 0
    case 'first-last':
      return index === 0 || index === count - 1
    case 'extremes': {
      // The min and the max, which is what "which was the worst month" asks
      // for and what an axis cannot answer without counting gridlines.
      const min = Math.min(...values)
      const max = Math.max(...values)
      return value === min || value === max
    }
    default:
      return index === count - 1
  }
}

/**
 * Turns a composed `<Values>` slot into a Recharts label list.
 *
 * `values` is the whole series, needed because `extremes` cannot be decided
 * one point at a time — and Recharts hands a label renderer one point at a
 * time.
 */
export function resolveValues(
  slot: ValuesProps | null,
  values: number[],
  fallbackPosition: ValuesProps['position'] = 'top',
) {
  if (!slot) return null

  const mode = slot.show ?? 'last'
  const format = slot.formatValue ?? defaultTick
  const count = values.length

  return (
    <LabelList
      position={slot.position ?? fallbackPosition}
      offset={8}
      content={(raw) => {
        // Recharts types x/y/width as `string | number`, because a label can be
        // positioned in percentages. Everything that reaches this renderer is
        // resolved geometry, so the coercion is the honest read.
        const props = raw as {
          index?: number
          value?: unknown
          x?: string | number
          y?: string | number
          width?: string | number
        }
        const index = props.index ?? -1
        const value = Number(props.value)
        if (index < 0 || !Number.isFinite(value)) return null
        if (!shows(mode, index, count, value, values)) return null

        const x = Number(props.x ?? 0) + Number(props.width ?? 0) / 2
        const y = Number(props.y ?? 0) - 6

        return (
          <text
            x={x}
            y={y}
            textAnchor="middle"
            // Mono and tabular, like every other number in the system: a column
            // of labels that jitters as the digits change reads as noise.
            className="fill-(--ink) font-mono text-[11px] font-medium tabular-nums"
            style={{ pointerEvents: 'none' }}
          >
            {format(value)}
          </text>
        )
      }}
    />
  )
}
