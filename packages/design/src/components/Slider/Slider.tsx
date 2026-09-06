'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import { Fragment, useRef, useState, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { clampToRange, parseNumber, snapToStep } from '../../lib/numeric'
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
   * Turns that readout into a box the number can be typed into, and implies
   * `showValue`.
   *
   * A slider is a control for a NEIGHBOURHOOD; someone who needs 1,150 rather
   * than roughly 1,200 is dragging a 16px thumb across a hundred steps to get
   * it. This is the way out, in the place the value already is, rather than a
   * second field beside the track that has to be kept in step by hand.
   *
   * The box shows `format`'s output at rest and the bare number while it has
   * focus, so a reader still sees "$1,200" and a typist is never asked to type
   * a currency symbol back.
   */
  editable?: boolean
  /**
   * Renders the value with a unit or a currency, e.g. `(n) => n + '%'`.
   *
   * Reaches assistive tech as well as the readout: it becomes each thumb's
   * `aria-valuetext`, so a thumb showing "$1,200" announces that rather than the
   * bare number. Left off, the platform announces the value itself.
   */
  format?: (value: number) => string
}

/** Which box is being typed into, and what is in it. Only one can have focus. */
interface Draft {
  index: number
  text: string
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
 * `editable` is the answer to the thing a slider cannot do. Reach for it
 * whenever the exact figure is the point — a budget, a timeout, a price — and
 * leave it off when the value is genuinely approximate, because a box invites
 * precision the setting may not have.
 *
 * Inside a `Field`, the hint, the error and the requirement land on the THUMB,
 * which is the element carrying `role="slider"` — on the root they would sit on
 * a `<span>` with no role and announce nothing. The NAME still comes from
 * `label` here: a field's label above a slider points at that same roleless
 * root, so it neither names the control nor clicks through to it.
 *
 * @example
 * <Slider label="Quality" defaultValue={[80]} max={100} step={5} showValue format={(n) => `${n}%`} />
 * @example
 * <Slider label="Monthly budget" defaultValue={[1200]} max={5000} step={50} editable format={(n) => `$${n}`} />
 */
export function Slider({
  label,
  showValue = false,
  editable = false,
  format,
  className,
  onValueChange,
  value: controlledValue,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
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
  const [uncontrolled, setUncontrolled] = useState<number[]>(defaultValue ?? [min])
  const current = controlledValue ?? uncontrolled

  // Mirrored into a ref because Escape clears the draft and blurs the box in
  // the SAME event: the state update has not been applied by the time the
  // blur handler runs, so a handler reading the state variable would see the
  // abandoned text and commit exactly what Escape was pressed to discard.
  const [draft, setDraft] = useState<Draft | null>(null)
  const draftRef = useRef<Draft | null>(null)
  const edit = (next: Draft | null) => {
    draftRef.current = next
    setDraft(next)
  }

  const handleChange = (next: number[]) => {
    if (controlledValue === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  /**
   * Commits one typed box, or reports that there was no number in it.
   *
   * A thumb is also bounded by its NEIGHBOURS, which is the bound a typed
   * value can cross and a dragged one cannot: typing 90 into the lower end of a
   * range whose upper end is at 70 would otherwise hand Radix an unsorted array
   * and leave the two thumbs crossed over.
   */
  const commit = (index: number, text: string): boolean => {
    const parsed = parseNumber(text)
    if (parsed === null) return false
    const lower = index > 0 ? (current[index - 1] ?? min) : min
    const upper = index < current.length - 1 ? (current[index + 1] ?? max) : max
    const next = clampToRange(snapToStep(parsed, step, min), Math.max(min, lower), Math.min(max, upper))
    if (next !== current[index]) handleChange(current.map((value, i) => (i === index ? next : value)))
    return true
  }

  const print = format ?? String
  // One name per thumb, in the thumbs' own order, so the heading lines up with
  // the numbers under it. A single name stays a single name however many thumbs
  // there are — a price filter called "Price" is not "Price – Price".
  const heading =
    names.length > 1 ? current.map((_, index) => names[index] ?? names[0]).join(' – ') : names[0]

  const readout = showValue || editable

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
      {readout && (
        <div className="flex items-baseline justify-between gap-4 mono-meta text-(--ink-3-aa)">
          <span>{heading}</span>
          {editable ? (
            <span className="flex items-baseline gap-1.5">
              {current.map((value, index) => {
                const editing = draft?.index === index
                const text = editing ? draft.text : print(value)
                return (
                  <Fragment key={index}>
                    {index > 0 && <span aria-hidden="true">–</span>}
                    <input
                      type="text"
                      // Not `type="number"`: the box holds `format`'s output at
                      // rest — "$1,200" — which a number input refuses to
                      // display and silently blanks. `inputMode` is what still
                      // brings up the numeric keypad on a phone.
                      inputMode="decimal"
                      // `disabled` on the wrapper is `pointer-events-none`,
                      // which a keyboard walks straight past. Without this, the
                      // one editable part of a disabled slider stays editable.
                      disabled={props.disabled}
                      value={text}
                      // The name has to differ from the thumb's: both carry the
                      // same value, and two controls announcing "Quality" is a
                      // reader hearing the same control twice.
                      aria-label={`${names[index] ?? names[0]}, exact value`}
                      aria-describedby={describedBy}
                      aria-required={ariaRequired}
                      aria-invalid={(editing && parseNumber(draft.text) === null) || ariaInvalid || undefined}
                      onFocus={() => edit({ index, text: String(value) })}
                      onChange={(event) => edit({ index, text: event.target.value })}
                      onBlur={() => {
                        const pending = draftRef.current
                        if (pending?.index === index) commit(index, pending.text)
                        edit(null)
                      }}
                      onKeyDown={(event) => {
                        const pending = draftRef.current
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          if (pending?.index === index && commit(index, pending.text)) edit(null)
                        }
                        if (event.key === 'Escape') {
                          event.preventDefault()
                          edit(null)
                          event.currentTarget.blur()
                        }
                      }}
                      className="w-20 rounded-(--radius-sm) border border-(--rule-2) bg-(--paper) px-1.5 py-0.5 text-end tabular-nums text-(--ink) transition-colors duration-(--duration-fast) hover:border-(--rule-hard) focus:border-(--ink) aria-invalid:border-(--danger)"
                    />
                  </Fragment>
                )
              })}
            </span>
          ) : (
            <span className="tabular-nums text-(--ink)">
              {current.map((value) => print(value)).join(' – ')}
            </span>
          )}
        </div>
      )}
      {/* Controlled from THIS component's state even when the caller left it
          uncontrolled, because the thumbs have to answer to more than dragging:
          a number typed into the readout never passes through Radix, so a Root
          holding its own `defaultValue` would keep the thumb where it was and
          leave the figure above it disagreeing with the track. `min`, `max` and
          `step` are passed on rather than spread for the same reason — the
          typed value is reconciled against them here. */}
      <SliderPrimitive.Root
        className="group relative flex w-full touch-none select-none items-center py-3"
        value={current}
        min={min}
        max={max}
        step={step}
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
