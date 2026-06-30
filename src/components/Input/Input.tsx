import { clsx } from 'clsx'
import type { InputHTMLAttributes, Ref } from 'react'

/**
 * Shared control base for text-entry primitives (Input / Textarea / Select).
 * The border *color* is intentionally not baked in here — callers toggle it so
 * the invalid state reliably wins over the resting border.
 */
const BASE =
  'w-full px-3.5 py-2.5 text-sm rounded-(--radius) bg-(--background-elevated) text-(--foreground) border placeholder:text-(--secondary-text) transition-colors duration-200 focus:border-(--accent) focus:outline-none focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Paints the resting border with `--danger`; also reflected as `aria-invalid`. */
  invalid?: boolean
  className?: string
  ref?: Ref<HTMLInputElement>
}

/**
 * Token-styled text input matching Button's control idiom.
 *
 * @example
 * <Input placeholder="you@example.com" />
 * <Input invalid value={email} onChange={(e) => setEmail(e.target.value)} />
 */
export function Input({
  invalid,
  className,
  ref,
  'aria-invalid': ariaInvalid,
  ...rest
}: InputProps) {
  const isInvalid = invalid === true || ariaInvalid === true || ariaInvalid === 'true'
  return (
    <input
      ref={ref}
      aria-invalid={ariaInvalid ?? (invalid ? true : undefined)}
      className={clsx(
        BASE,
        isInvalid ? 'border-(--danger)' : 'border-(--border-color)',
        className,
      )}
      {...rest}
    />
  )
}

export default Input
