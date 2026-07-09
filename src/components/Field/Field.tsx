import { clsx } from 'clsx'
import { Label } from '@radix-ui/react-label'
import { cloneElement, isValidElement } from 'react'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
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
  ...rest
}: FieldProps) {
  // The visible message is only half of accessible validation — it must also be
  // announced by the control. Wire an id'd message onto the single control child
  // via aria-describedby, plus aria-required/aria-invalid, so the requirement and
  // error reach assistive tech, not just sighted users (WCAG 1.3.1/3.3.1/4.1.2).
  const message = error ?? hint
  const messageId =
    htmlFor && message != null ? `${htmlFor}-${error != null ? 'error' : 'hint'}` : undefined

  let control = children
  if (isValidElement(children) && (messageId != null || required || error != null)) {
    const child = children as ReactElement<{
      'aria-describedby'?: string
      'aria-required'?: boolean
      'aria-invalid'?: boolean | 'true' | 'false'
    }>
    control = cloneElement(child, {
      'aria-describedby':
        [child.props['aria-describedby'], messageId].filter(Boolean).join(' ') || undefined,
      'aria-required': required || child.props['aria-required'] || undefined,
      'aria-invalid': error != null ? (child.props['aria-invalid'] ?? true) : child.props['aria-invalid'],
    })
  }

  return (
    <div className={clsx('flex flex-col gap-1.5', className)} {...rest}>
      {label != null && (
        <Label htmlFor={htmlFor} className="text-sm text-(--foreground)">
          {label}
          {required && <span className="text-(--danger)"> *</span>}
        </Label>
      )}
      {control}
      {error != null ? (
        <p id={messageId} className="text-xs text-(--danger)">
          {error}
        </p>
      ) : hint != null ? (
        <p id={messageId} className="text-xs text-(--secondary-text)">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default Field
