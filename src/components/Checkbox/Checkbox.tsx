'use client'

import { clsx } from 'clsx'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'

export interface CheckboxProps extends ComponentProps<typeof CheckboxPrimitive.Root> {
  className?: string
}

/**
 * Token-styled checkbox wrapping Radix. Pair with `Field` for a label at the
 * call site. Works controlled (`checked` + `onCheckedChange`) or uncontrolled
 * (`defaultChecked`).
 *
 * @example
 * <label className="flex items-center gap-2 text-sm">
 *   <Checkbox defaultChecked /> Subscribe to updates
 * </label>
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={clsx(
        'inline-flex size-[18px] shrink-0 items-center justify-center rounded-(--radius-sm) border border-(--border-color) bg-(--background-elevated) text-(--on-dark) transition-colors duration-200 data-[state=checked]:bg-(--accent) data-[state=checked]:border-(--accent) focus-visible:outline-2 focus-visible:outline-(--accent) outline-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export default Checkbox
