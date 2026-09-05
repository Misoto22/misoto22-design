'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'

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
 * is below every pointer-target guideline and is miserable on a phone.
 */
export function RadioGroupItem({ children, className, id, ...props }: RadioGroupItemProps) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 text-sm text-(--ink-2)', className)}>
      <RadioGroupPrimitive.Item
        id={id}
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
