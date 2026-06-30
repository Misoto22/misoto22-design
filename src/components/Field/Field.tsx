import { clsx } from 'clsx'
import { Label } from '@radix-ui/react-label'
import type { ReactNode } from 'react'

export interface FieldProps {
  /** Visible label text; renders a `--danger` asterisk when `required`. */
  label?: ReactNode
  /** Wires the label to the control's `id` for click-to-focus + a11y. */
  htmlFor?: string
  /** Helper copy shown below the control when there is no `error`. */
  hint?: ReactNode
  /** Validation message; takes precedence over `hint` when present. */
  error?: ReactNode
  required?: boolean
  children: ReactNode
  className?: string
}

/**
 * Labelled form row that composes around any control (Input, Select, Checkbox…).
 *
 * @example
 * <Field label="Email" htmlFor="email" required hint="We never share it.">
 *   <Input id="email" type="email" />
 * </Field>
 *
 * @example
 * <Field label="Name" htmlFor="name" error="Name is required.">
 *   <Input id="name" invalid />
 * </Field>
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label != null && (
        <Label htmlFor={htmlFor} className="text-sm text-(--foreground)">
          {label}
          {required && <span className="text-(--danger)"> *</span>}
        </Label>
      )}
      {children}
      {error != null ? (
        <p className="text-xs text-(--danger)">{error}</p>
      ) : hint != null ? (
        <p className="text-xs text-(--secondary-text)">{hint}</p>
      ) : null}
    </div>
  )
}

export default Field
