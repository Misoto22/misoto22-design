import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '../../lib/cn'
import { CONTROL_BASE, CONTROL_BORDER, isInvalid } from '../../lib/control'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Paints the resting border with `--danger` and reflects `aria-invalid`. */
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

/**
 * A single line of text entry.
 *
 * Shares `CONTROL_BASE` with Textarea and Select, so the three cannot drift
 * apart. Pair with `Field` for the label, hint and error — an input with a
 * placeholder and no label is not labelled, because the placeholder disappears
 * the moment anyone types.
 *
 * @example
 * <Field label="Email" htmlFor="email"><Input id="email" type="email" /></Field>
 */
export function Input({ invalid, className, ref, 'aria-invalid': ariaInvalid, ...rest }: InputProps) {
  const bad = isInvalid(invalid, ariaInvalid)
  return (
    <input
      ref={ref}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={cn(CONTROL_BASE, bad ? CONTROL_BORDER.invalid : CONTROL_BORDER.resting, className)}
      {...rest}
    />
  )
}

export default Input
