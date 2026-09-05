import { ChevronDown } from 'lucide-react'
import type { Ref, SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { CONTROL_BASE, CONTROL_BORDER, isInvalid } from '../../lib/control'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Paints the resting border with `--danger` and reflects `aria-invalid`. */
  invalid?: boolean
  ref?: Ref<HTMLSelectElement>
}

/**
 * A native `<select>`, restyled.
 *
 * Native on purpose. A listbox rebuilt in divs has to re-implement typeahead,
 * the mobile picker, and every platform's own keyboard conventions — and the
 * system gains nothing visible for it, because the only part worth styling is
 * the closed control, which is exactly the part the browser lets us style.
 *
 * @example
 * <Select defaultValue="au"><option value="au">Australia</option></Select>
 */
export function Select({
  invalid,
  className,
  ref,
  children,
  'aria-invalid': ariaInvalid,
  ...rest
}: SelectProps) {
  const bad = isInvalid(invalid, ariaInvalid)
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
        className={cn(
          CONTROL_BASE,
          'cursor-pointer appearance-none pr-9',
          bad ? CONTROL_BORDER.invalid : CONTROL_BORDER.resting,
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--ink-3-aa)"
        aria-hidden
      />
    </div>
  )
}

export default Select
