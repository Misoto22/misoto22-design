'use client'

import { Label } from '@radix-ui/react-label'
import { cloneElement, isValidElement, useId } from 'react'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { DEV, warn } from '../../lib/warn'
import { FieldControlProvider } from './field-control'

/**
 * Where the control sits relative to its label.
 *
 * `stacked` is the form row: label, control, message, down the page.
 *
 * `row` is the settings row: the label and its `description` in a column at the
 * inline start, the control at the inline end, one rhythm down a settings
 * screen. It is a layout, not a second component — the label wiring, the
 * required marker and the message slot are the same three things either way,
 * and a `SettingRow` beside this would be all three of them written twice.
 */
export type FieldLayout = 'stacked' | 'row'

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
  /**
   * A second line under the LABEL, explaining what the setting does.
   *
   * Distinct from `hint`, which sits under the control and belongs to the input
   * — "We never share it". This belongs to the thing being switched on, and it
   * is what makes a settings row a settings row. Both reach the control through
   * `aria-describedby`, so a row that has a description and an error announces
   * both.
   */
  description?: ReactNode
  /** Helper copy shown below the control when there is no `error`. */
  hint?: ReactNode
  /** Validation message; takes precedence over `hint` when present. */
  error?: ReactNode
  required?: boolean
  /** Where the control sits relative to its label. See {@link FieldLayout}. */
  layout?: FieldLayout
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
 * wrong, the thing to read is what is wrong with it. `description` is a
 * different slot again — it explains the SETTING, not the input, and it is what
 * `layout="row"` puts under the label to make a settings row.
 *
 * **How the wiring reaches the control.** `cloneElement` puts the four
 * attributes on the single child, and each control forwards them to whatever
 * element carries the role — which is the child itself for `Input`, `Textarea`,
 * `NativeSelect`, `Checkbox`, `Switch` and any host element written by hand, and
 * a trigger, a group or a thumb further down for `Select`, `Combobox`,
 * `DatePicker`, `Slider`, `RadioGroup` and `ToggleGroup`. The composites used to
 * drop them on the floor, which drew a hint under a control that never announced
 * it; a wrapper that appears to wire things up and does not is worse than one
 * that never claimed to.
 *
 * The label's own id travels separately, through context, because a name is the
 * one thing a prop cannot carry: a trigger whose text is its VALUE is named by
 * the label AND by itself, so `<Field label="Region"><Select/></Field>`
 * announces "Region, Australia" rather than either half.
 *
 * Three things stay out of reach, and each of them is the control's own markup
 * rather than a gap in this wiring. A `<label for>` binds only to a labellable
 * element, so the words do not click through to a `RadioGroup`, a `ToggleGroup`
 * or a `Slider`: the first two are a `role="radiogroup"` named by pointing back
 * at the label instead, exactly as a `<legend>` is, and the third carries
 * `role="slider"` on a thumb below a roleless root. `required` reaches a control
 * as `aria-required`, which `DatePicker`'s plain `<button>` trigger and a
 * multiple-value `ToggleGroup`'s `role="toolbar"` have nowhere to put; there the
 * asterisk is the only marker. And `aria-invalid` reaches `Slider`'s root rather
 * than its thumb, so an errored slider is drawn wrong without being announced
 * wrong.
 *
 * Each composite still takes its own `label` prop — that is what names it
 * standing outside a field, and `Select`, `Combobox` and `DatePicker` warn when
 * it is blank. It is no longer used INSTEAD of this one's.
 *
 * What no wiring can reach, the field says out loud in development rather than
 * failing silently: `FIELD_CONTROL_NOT_LABELLABLE` when the child is a host
 * element a label cannot bind to — the `<div>` wrapper that takes the id and
 * leaves the control inside it with nothing — and `FIELD_CONTROL_NOT_WIRED`
 * when there is no single element to wire at all.
 *
 * @example
 * <Field label="Email" required hint="We never share it."><Input type="email" /></Field>
 * @example
 * <Field label="Name" error="Name is required."><Input /></Field>
 * @example
 * <Field layout="row" label="Email notifications" description="A digest every Monday.">
 *   <Switch defaultChecked />
 * </Field>
 */
export function Field({
  label,
  htmlFor,
  description,
  hint,
  error,
  required,
  layout = 'stacked',
  children,
  className,
  ...rest
}: FieldProps) {
  const generatedId = useId()
  const controlId = htmlFor ?? generatedId
  const message = error ?? hint
  const messageId = message != null ? `${controlId}-${error != null ? 'error' : 'hint'}` : undefined
  const descriptionId = description != null ? `${controlId}-description` : undefined
  const labelId = label != null ? `${controlId}-label` : undefined

  let control = children
  if (isValidElement(children)) {
    const child = children as WirableControl
    control = cloneElement(child, {
      id: child.props.id ?? controlId,
      'aria-describedby':
        [child.props['aria-describedby'], descriptionId, messageId].filter(Boolean).join(' ') ||
        undefined,
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

  // The label's id, for the controls that have to name themselves from it —
  // everything else the field decided is already on the cloned child.
  const wired = <FieldControlProvider value={{ labelId }}>{control}</FieldControlProvider>

  const heading = (label != null || description != null) && (
    <div className="flex flex-col gap-1">
      {label != null && (
        <Label id={labelId} htmlFor={controlId} className="text-sm text-(--ink)">
          {label}
          {required && (
            <span className="text-(--danger)" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </Label>
      )}
      {description != null && (
        <p id={descriptionId} className="m-0 text-xs text-(--ink-3-aa)">
          {description}
        </p>
      )}
    </div>
  )

  const note = message != null && (
    <p
      id={messageId}
      className={cn('m-0 text-xs', error != null ? 'text-(--danger)' : 'text-(--ink-3-aa)')}
    >
      {message}
    </p>
  )

  if (layout === 'row') {
    return (
      <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
        {/* `items-start` and not `items-center`: a description of two lines
            would otherwise drag the switch down to the middle of the paragraph,
            and a column of settings rows would have its controls on five
            different lines. */}
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">{heading}</div>
          <div className="shrink-0">{wired}</div>
        </div>
        {note}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
      {heading}
      {wired}
      {note}
    </div>
  )
}

export default Field
