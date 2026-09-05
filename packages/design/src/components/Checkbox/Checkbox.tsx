'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root>

/**
 * A choice that takes effect when the form is submitted.
 *
 * Supports the indeterminate state (`checked="indeterminate"`), which is what a
 * "select all" header needs when only some rows are selected — a plain
 * unchecked box there tells the reader the opposite of the truth.
 *
 * Pair with `Field`, or wrap it in a `<label>` at the call site so the words
 * beside it are part of the click target.
 *
 * @example
 * <label className="flex items-center gap-2.5 text-sm">
 *   <Checkbox defaultChecked /> Subscribe to updates
 * </label>
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'inline-flex size-[18px] shrink-0 items-center justify-center rounded-(--radius-xs) border border-(--rule-2) bg-(--paper) text-(--accent-foreground) transition-colors duration-(--duration-fast) data-[state=checked]:border-(--accent) data-[state=checked]:bg-(--accent) data-[state=indeterminate]:border-(--accent) data-[state=indeterminate]:bg-(--accent) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === 'indeterminate' ? (
          <Minus className="size-3" strokeWidth={3} aria-hidden />
        ) : (
          <Check className="size-3" strokeWidth={3} aria-hidden />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export default Checkbox
