'use client'

import { Label } from '@radix-ui/react-label'
import { cloneElement, isValidElement, useId } from 'react'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { DEV, warn } from '../../lib/warn'

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Visible label text; renders a `--danger` asterisk when `required`. */
  label?: ReactNode
  /**
   * The control's `id`. Optional: when omitted, the field generates one and
   * puts it on the control child itself, so the label still points at
   * something. Pass it explicitly when the id has to be stable across renders
   * — a form library referencing it by name, say.
   */
  htmlFor?: string
  /** Helper copy shown below the control when there is no `error`. */
  hint?: ReactNode
  /** Validation message; takes precedence over `hint` when present. */
  error?: ReactNode
  required?: boolean
  children: ReactNode
}

type WirableControl = ReactElement<{
  id?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  'aria-invalid'?: boolean | 'true' | 'false'
}>

/**
 * A labelled form row: label, control, and the one message below it.
 *
 * The visible message is only half of accessible validation — it must also
 * reach the control. This wires `aria-describedby`, `aria-required` and
 * `aria-invalid` onto the single control child so the requirement and the error
 * are announced, not merely drawn (WCAG 1.3.1 / 3.3.1 / 4.1.2).
 *
 * An earlier version derived the message id from `htmlFor`, which meant a
 * caller who left `htmlFor` off got a hint that was rendered and never
 * announced — the failure was invisible in the browser and total for a screen
 * reader. The id is now generated when it is not supplied.
 *
 * `hint` and `error` are one slot, not two stacked messages: when a field is
 * wrong, the thing to read is what is wrong with it.
 *
 * @example
 * <Field label="Email" required hint="We never share it."><Input type="email" /></Field>
 * @example
 * <Field label="Name" error="Name is required."><Input /></Field>
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
  const generatedId = useId()
  const controlId = htmlFor ?? generatedId
  const message = error ?? hint
  const messageId = message != null ? `${controlId}-${error != null ? 'error' : 'hint'}` : undefined

  let control = children
  if (isValidElement(children)) {
    const child = children as WirableControl
    control = cloneElement(child, {
      id: child.props.id ?? controlId,
      'aria-describedby':
        [child.props['aria-describedby'], messageId].filter(Boolean).join(' ') || undefined,
      'aria-required': required || child.props['aria-required'] || undefined,
      'aria-invalid':
        error != null ? (child.props['aria-invalid'] ?? true) : child.props['aria-invalid'],
    })
  } else if (DEV) {
    warn({
      code: 'FIELD_CONTROL_NOT_WIRED',
      problem:
        "Field's child is not a single React element, so the label, aria-describedby, aria-required and aria-invalid were not applied to any control.",
      field: 'children',
      fix: 'Put exactly one control element directly inside Field. For a row of controls, give each its own Field and lay them out around it.',
      component: 'Field',
    })
  }

  if (DEV && isValidElement(children) && typeof children.type === 'string') {
    // A wrapper is the failure this exists for, and it is the one that looks
    // most correct: `<Field><div><Input /></div></Field>` renders, and the
    // label points at the DIV. The id, the describedby and the invalid state
    // all land on a box, the control inside gets none of them, and a browser
    // shows nothing wrong.
    //
    // Narrowed to HOST elements because that is the half that can be decided:
    // a lowercase tag either takes a label or it does not. A function component
    // might forward its props to a real control, and warning on those would
    // fire on every correct use of Input, Select and the rest.
    const LABELLABLE = ['input', 'select', 'textarea', 'button', 'meter', 'output', 'progress']
    if (!LABELLABLE.includes(children.type)) {
      warn({
        code: 'FIELD_CONTROL_NOT_LABELLABLE',
        problem: `Field's child is a <${children.type}>, which cannot take a label — so the id, aria-describedby, aria-required and aria-invalid were applied to it rather than to a control.`,
        field: 'children',
        fix: 'Put the control itself directly inside Field, with no wrapper. For a row of controls, give each its own Field and lay them out around it.',
        component: 'Field',
      })
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
      {label != null && (
        <Label htmlFor={controlId} className="text-sm text-(--ink)">
          {label}
          {required && (
            <span className="text-(--danger)" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </Label>
      )}
      {control}
      {message != null && (
        <p
          id={messageId}
          className={cn('m-0 text-xs', error != null ? 'text-(--danger)' : 'text-(--ink-3-aa)')}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default Field
