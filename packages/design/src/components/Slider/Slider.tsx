'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export interface SliderProps extends ComponentProps<typeof SliderPrimitive.Root> {
  /**
   * Names the control. Required: a slider with no name announces only a number,
   * and a number with no noun is not information.
   *
   * A range slider (two thumbs) needs one name per thumb — pass an array.
   */
  label: string | [string, string]
  /** Prints the current value beside the label. */
  showValue?: boolean
  /** Renders the value with a unit or a currency, e.g. `(n) => n + '%'`. */
  format?: (value: number) => string
}

/**
 * A value chosen along a range.
 *
 * Radix owns the keyboard contract — arrows step, Page keys jump, Home and End
 * reach the ends — and the ARIA that reports the value. What is here is the
 * look, and the labelling, which is the part a slider most often gets wrong: a
 * thumb that announces "42" and nothing else leaves a screen reader user with a
 * number and no idea what it measures.
 *
 * A 44px hit area sits invisibly around the 16px thumb, because a thumb sized
 * for the design is well under any pointer-target guideline.
 *
 * @example
 * <Slider label="Quality" defaultValue={[80]} max={100} step={5} showValue format={(n) => `${n}%`} />
 */
export function Slider({
  label,
  showValue = false,
  format = String,
  className,
  ...props
}: SliderProps) {
  const names = Array.isArray(label) ? label : [label]
  const current = props.value ?? props.defaultValue ?? []

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      {showValue && (
        <div className="flex items-baseline justify-between mono-meta text-(--ink-3-aa)">
          <span>{names[0]}</span>
          <span className="tabular-nums text-(--ink)">
            {current.map((value) => format(value)).join(' – ')}
          </span>
        </div>
      )}
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center py-3"
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-(--radius-pill) bg-(--stone)">
          <SliderPrimitive.Range className="absolute h-full bg-(--ink)" />
        </SliderPrimitive.Track>
        {current.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            aria-label={names[index] ?? names[0]}
            // The visible thumb is 16px; the `before` pseudo-element widens the
            // hit area to 44px without changing what is drawn.
            className="relative block size-4 rounded-full border border-(--ink) bg-(--paper) transition-colors duration-(--duration-fast) before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-(--stone) disabled:opacity-(--disabled-opacity)"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  )
}

export default Slider
