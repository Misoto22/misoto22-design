'use client'

import { clsx } from 'clsx'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentProps } from 'react'

export interface SwitchProps extends ComponentProps<typeof SwitchPrimitive.Root> {
  className?: string
}

/**
 * Token-styled toggle wrapping Radix. Pair with `Field` for a label at the call
 * site. Works controlled (`checked` + `onCheckedChange`) or uncontrolled
 * (`defaultChecked`).
 *
 * @example
 * <label className="flex items-center gap-2 text-sm">
 *   <Switch defaultChecked /> Email notifications
 * </label>
 */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={clsx(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-(--radius-pill) bg-(--border-color) px-0.5 transition-colors duration-200 data-[state=checked]:bg-(--accent) focus-visible:outline-2 focus-visible:outline-(--accent) outline-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-4 translate-x-0 rounded-(--radius-pill) bg-(--on-dark) shadow-(--shadow-sm) transition-transform duration-200 data-[state=checked]:translate-x-4" />
    </SwitchPrimitive.Root>
  )
}

export default Switch
