'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import { useState, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { warnBlankName } from '../../lib/warn'

export interface SliderProps extends ComponentProps<typeof SliderPrimitive.Root> {
  /**
   * Names the control. Required: a slider with no name announces only a number,
   * and a number with no noun is not information.
   *
   * A range slider (two thumbs) needs one name per thumb — pass an array.
   */
  label: string | [string, string]
  /**
   * Prints the current value beside the label.
   *
   * A two-thumb range prints both names and both values, in the same order —
   * the heading used to print the first name over a pair of numbers, which read
   * as "Minimum" over "10 – 90".
   */
  showValue?: boolean
  /**
   * Renders the value with a unit or a currency, e.g. `(n) => n + '%'`.
   *
   * Reaches assistive tech as well as the readout: it becomes each thumb's
   * `aria-valuetext`, so a thumb showing "$1,200" announces that rather than the
   * bare number. Left off, the platform announces the value itself.
   */
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
 * Inside a `Field`, the hint, the error and the requirement land on the THUMB,
 * which is the element carrying `role="slider"` — on the root they would sit on
 * a `<span>` with no role and announce nothing. The NAME still comes from
 * `label` here: a field's label above a slider points at that same roleless
 * root, so it neither names the control nor clicks through to it.
 *
 * @example
 * <Slider label="Quality" defaultValue={[80]} max={100} step={5} showValue format={(n) => `${n}%`} />
 */
export function Slider({
  label,
  showValue = false,
  format,
  className,
  onValueChange,
  'aria-describedby': describedBy,
  'aria-required': ariaRequired,
  'aria-invalid': ariaInvalid,
  ...props
}: SliderProps) {
  const names = Array.isArray(label) ? label : [label]

  // The other five guarded naming props are plain strings; this one is a
  // string or a pair, so the first name is what is checked — a range whose
  // lower thumb has no name is the same silence as a single one with none.
  // It catches a blank, not an absent: `label` is required, so a missing one
  // is a type error everywhere except a caller that has already left the
  // types behind.
  warnBlankName('Slider', 'label', names[0], 'the thumb is announced with no name and its value describes nothing')

  // Tracked here, not read off the props. An uncontrolled slider's
  // `defaultValue` never changes, so the printed figure sat at its starting
  // number while the thumb moved — the one thing `showValue` exists to avoid.
  //
  // The fallback is the primitive's own — one thumb at the minimum. The thumbs
  // are rendered from THIS array rather than from Radix's, so an empty one is a
  // track with nothing on it to drag, which is what `<Slider label="Volume" />`
  // used to render.
  const [uncontrolled, setUncontrolled] = useState<number[]>(
    props.defaultValue ?? [props.min ?? 0],
  )
  const current = props.value ?? uncontrolled

  const handleChange = (next: number[]) => {
    if (props.value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const print = format ?? String
  // One name per thumb, in the thumbs' own order, so the heading lines up with
  // the numbers under it. A single name stays a single name however many thumbs
  // there are — a price filter called "Price" is not "Price – Price".
  const heading =
    names.length > 1 ? current.map((_, index) => names[index] ?? names[0]).join(' – ') : names[0]

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3',
        // On the wrapper, and driven by the prop: the thumb is a <span>, so a
        // `disabled:` variant compiles to `&:disabled` and matches nothing —
        // the control was drawn exactly like a live one while refusing to move.
        // The wrapper is also what dims the readout above the track.
        props.disabled && 'opacity-(--disabled-opacity) pointer-events-none',
        className,
      )}
    >
      {showValue && (
        <div className="flex items-baseline justify-between mono-meta text-(--ink-3-aa)">
          <span>{heading}</span>
          <span className="tabular-nums text-(--ink)">
            {current.map((value) => print(value)).join(' – ')}
          </span>
        </div>
      )}
      <SliderPrimitive.Root
        className="group relative flex w-full touch-none select-none items-center py-3"
        onValueChange={handleChange}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-(--radius-pill) bg-(--stone) transition-[height] duration-(--duration-fast) group-hover:h-1.5">
          <SliderPrimitive.Range className="absolute h-full bg-(--accent)" />
        </SliderPrimitive.Track>
        {current.map((value, index) => (
          <SliderPrimitive.Thumb
            key={index}
            aria-label={names[index] ?? names[0]}
            // The thumb is what carries role="slider", so this is where a
            // Field's description and requirement have to land — on the root
            // they sit on a <span> with no role, which announces nothing.
            aria-describedby={describedBy}
            aria-required={ariaRequired}
            aria-invalid={ariaInvalid}
            // Only when a format was given: setting it otherwise would replace
            // the platform's own reading of the value with the same digits.
            aria-valuetext={format ? format(value) : undefined}
            // The visible thumb is 16px; the `before` pseudo-element widens the
            // hit area to 44px without changing what is drawn.
            // `transition-transform` and not `all`: the thumb's own position is
            // set by Radix as a `left` percentage, and transitioning that would
            // make it lag the pointer. Only the grow-on-grab is animated.
            className="relative block size-4 rounded-(--radius-pill) border border-(--accent) bg-(--paper) transition-[transform,background-color] duration-(--duration-fast) ease-(--ease-out-expo) before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:scale-110 hover:bg-(--stone) active:scale-125 data-[state=active]:scale-125 motion-reduce:transition-none"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  )
}

export default Slider
