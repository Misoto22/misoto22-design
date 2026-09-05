'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { useEffect, useRef, type ComponentProps, type FocusEvent, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * How recently an arrow key was pressed, in milliseconds, for selection to
 * still count as "caused by" it.
 *
 * A boolean cleared on `keyup` — which is how the upstream primitive tracks
 * this — loses the race: the roving focus moves through a React state update,
 * and by the time the commit lands and the element takes focus, a normal
 * keypress has already released. The result is a group whose arrow keys move
 * the outline and select nothing, which is half the ARIA radiogroup pattern
 * missing. A timestamp cannot be cleared out from under the focus handler.
 */
const ARROW_GRACE_MS = 300

export type RadioGroupProps = ComponentProps<typeof RadioGroupPrimitive.Root>

/**
 * A set of mutually exclusive choices.
 *
 * Radix owns the roving tabindex, so the whole group is ONE tab stop and the
 * arrow keys move between options — which is what the ARIA radiogroup pattern
 * requires and what a stack of hand-rolled `<input type="radio">` wrappers
 * usually gets wrong.
 *
 * @example
 * <RadioGroup defaultValue="light" aria-label="Theme">
 *   <RadioGroupItem value="light">Light</RadioGroupItem>
 *   <RadioGroupItem value="dark">Dark</RadioGroupItem>
 * </RadioGroup>
 */
export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return <RadioGroupPrimitive.Root className={cn('flex flex-col gap-2.5', className)} {...props} />
}

export interface RadioGroupItemProps
  extends Omit<ComponentProps<typeof RadioGroupPrimitive.Item>, 'children'> {
  /** The visible label. Rendered inside the `<label>` that wraps the control. */
  children: ReactNode
}

/**
 * One option, and its label, as a single click target.
 *
 * The `<label>` wraps both, so the whole row is clickable — a bare 18px circle
 * is below every pointer-target guideline and is miserable on a phone. It is
 * also what gives the control its accessible name: remove the wrapper and the
 * radio has no name at all.
 *
 * Selection follows focus, which is the half of the pattern that makes a
 * radiogroup usable from the keyboard: moving to an option chooses it, so
 * nobody has to press an extra key to commit. That is implemented here rather
 * than inherited, because the upstream primitive gates it on a flag cleared by
 * `keyup` and loses the race against its own focus move — see ARROW_GRACE_MS.
 * Re-selecting an already-selected option is a no-op, so this stays correct
 * even where the upstream path does fire.
 */
export function RadioGroupItem({ children, className, id, onFocus, ...props }: RadioGroupItemProps) {
  const arrowPressedAt = useRef(0)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.startsWith('Arrow')) arrowPressedAt.current = Date.now()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const selectOnArrowFocus = (event: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event)
    if (Date.now() - arrowPressedAt.current < ARROW_GRACE_MS) event.currentTarget.click()
  }

  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 text-sm text-(--ink-2)', className)}>
      <RadioGroupPrimitive.Item
        id={id}
        onFocus={selectOnArrowFocus}
        className="grid size-[18px] shrink-0 place-items-center rounded-full border border-(--rule-2) bg-(--paper) transition-colors duration-(--duration-fast) data-[state=checked]:border-(--ink) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none"
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-(--ink)" />
      </RadioGroupPrimitive.Item>
      {children}
    </label>
  )
}

export default RadioGroup
