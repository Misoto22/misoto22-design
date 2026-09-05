import type { Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { CONTROL_BASE, CONTROL_BORDER, isInvalid } from '../../lib/control'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Paints the resting border with `--danger` and reflects `aria-invalid`. */
  invalid?: boolean
  ref?: Ref<HTMLTextAreaElement>
}

/**
 * Multi-line text entry.
 *
 * Resizes vertically only: horizontal resize lets a reader drag the control
 * past the measure and past the page's own gutter.
 *
 * @example
 * <Field label="Notes" htmlFor="notes"><Textarea id="notes" rows={4} /></Field>
 */
export function Textarea({
  invalid,
  className,
  ref,
  'aria-invalid': ariaInvalid,
  ...rest
}: TextareaProps) {
  const bad = isInvalid(invalid, ariaInvalid)
  return (
    <textarea
      ref={ref}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={cn(
        CONTROL_BASE,
        'min-h-24 resize-y',
        bad ? CONTROL_BORDER.invalid : CONTROL_BORDER.resting,
        className,
      )}
      {...rest}
    />
  )
}

export default Textarea
