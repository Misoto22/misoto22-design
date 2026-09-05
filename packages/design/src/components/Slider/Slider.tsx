'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import { useState, type ComponentProps } from 'react'
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
  onValueChange,
  ...props
}: SliderProps) {
  const names = Array.isArray(label) ? label : [label]

  // Tracked here, not read off the props. An uncontrolled slider's
  // `defaultValue` never changes, so the printed figure sat at its starting
  // number while the thumb moved — the one thing `showValue` exists to avoid.
  const [uncontrolled, setUncontrolled] = useState<number[]>(props.defaultValue ?? [])
  const current = props.value ?? uncontrolled

  const handleChange = (next: number[]) => {
    if (props.value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

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
        className="group relative flex w-full touch-none select-none items-center py-3"
        onValueChange={handleChange}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-(--radius-pill) bg-(--stone) transition-[height] duration-(--duration-fast) group-hover:h-1.5">
          <SliderPrimitive.Range className="absolute h-full bg-(--ink)" />
        </SliderPrimitive.Track>
        {current.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            aria-label={names[index] ?? names[0]}
            // The visible thumb is 16px; the `before` pseudo-element widens the
            // hit area to 44px without changing what is drawn.
            // `transition-transform` and not `all`: the thumb's own position is
            // set by Radix as a `left` percentage, and transitioning that would
            // make it lag the pointer. Only the grow-on-grab is animated.
            className="relative block size-4 rounded-full border border-(--ink) bg-(--paper) transition-[transform,background-color] duration-(--duration-fast) ease-(--ease-out-expo) before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:scale-110 hover:bg-(--stone) active:scale-125 data-[state=active]:scale-125 disabled:opacity-(--disabled-opacity) motion-reduce:transition-none"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  )
}

export default Slider
