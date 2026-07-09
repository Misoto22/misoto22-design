import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import type { Ref, SelectHTMLAttributes } from 'react'

/** Input's control base, plus native-arrow suppression and room for the chevron. */
const BASE =
  'w-full appearance-none cursor-pointer px-3.5 py-2.5 pr-9 text-sm rounded-(--radius) bg-(--background-elevated) text-(--foreground) border transition-colors duration-200 focus:border-(--accent) focus-visible:outline-2 focus-visible:outline-(--ring) outline-offset-2 disabled:opacity-50 disabled:pointer-events-none'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Paints the resting border with `--danger`; also reflected as `aria-invalid`. */
  invalid?: boolean
  className?: string
  ref?: Ref<HTMLSelectElement>
}

/**
 * Styled native `<select>` — accessible by default. Pass `<option>`s as children.
 *
 * @example
 * <Select defaultValue="au">
 *   <option value="au">Australia</option>
 *   <option value="nz">New Zealand</option>
 * </Select>
 */
export function Select({
  invalid,
  className,
  ref,
  children,
  'aria-invalid': ariaInvalid,
  ...rest
}: SelectProps) {
  const isInvalid = invalid === true || ariaInvalid === true || ariaInvalid === 'true'
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
        className={clsx(
          BASE,
          isInvalid ? 'border-(--danger)' : 'border-(--border-color)',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-(--secondary-text)"
        aria-hidden
      />
    </div>
  )
}

export default Select
