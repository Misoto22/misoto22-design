import { clsx } from 'clsx'
import type { Ref, TextareaHTMLAttributes } from 'react'

/** Same control idiom as Input, with a comfortable min height and vertical resize. */
const BASE =
  'w-full min-h-24 resize-y px-3.5 py-2.5 text-sm rounded-(--radius) bg-(--background-elevated) text-(--foreground) border placeholder:text-(--secondary-text) transition-colors duration-200 focus:border-(--accent) focus-visible:outline-2 focus-visible:outline-(--ring) outline-offset-2 disabled:opacity-50 disabled:pointer-events-none'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Paints the resting border with `--danger`; also reflected as `aria-invalid`. */
  invalid?: boolean
  className?: string
  ref?: Ref<HTMLTextAreaElement>
}

/**
 * Token-styled multi-line text input.
 *
 * @example
 * <Textarea placeholder="Tell us more…" rows={4} />
 * <Textarea invalid value={notes} onChange={(e) => setNotes(e.target.value)} />
 */
export function Textarea({
  invalid,
  className,
  ref,
  'aria-invalid': ariaInvalid,
  ...rest
}: TextareaProps) {
  const isInvalid = invalid === true || ariaInvalid === true || ariaInvalid === 'true'
  return (
    <textarea
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

export default Textarea
