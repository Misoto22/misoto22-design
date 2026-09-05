'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root>

/**
 * A setting that takes effect immediately.
 *
 * Distinct from `Checkbox`, and the distinction is not cosmetic: a switch
 * applies on flip, a checkbox applies on submit. A switch inside a form with a
 * Save button is a lie about when the change happened.
 *
 * The track fills with ink when on and the thumb is paper with a hairline —
 * rather than a white thumb floating on a drop shadow, which this system does
 * not have. The off state is a filled rule-coloured track, so the control still
 * reads as a control on a white page.
 *
 * @example
 * <Field label="Email notifications"><Switch defaultChecked /></Field>
 */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-(--radius-pill) border border-(--rule-2) bg-(--stone) px-0.5 transition-colors duration-(--duration-fast) data-[state=checked]:border-(--ink) data-[state=checked]:bg-(--ink) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-3.5 translate-x-0 rounded-full bg-(--paper) transition-transform duration-(--duration-fast) ease-(--ease-out-expo) data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4" />
    </SwitchPrimitive.Root>
  )
}

export default Switch
