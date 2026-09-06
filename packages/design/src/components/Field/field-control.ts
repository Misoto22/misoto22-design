'use client'

import { createContext, useContext } from 'react'

/**
 * The one thing a `Field` cannot hand its control as a prop: where its label is.
 *
 * Everything else the field decides — the id, `aria-describedby`,
 * `aria-required`, `aria-invalid` — travels as props on the cloned child, and a
 * control that swallowed them was simply not forwarding them to the element
 * that carries the role. That is a bug in the control, not a missing channel.
 *
 * A NAME is different. A trigger whose text is its value has to be named by the
 * label AND by itself, which is two ids in one `aria-labelledby`; a group has to
 * point BACK at the label, because `<label for>` does not bind to a
 * `role="radiogroup"`. Neither can be expressed by a value the field computes on
 * its own, so the label's id is published here and the control assembles the
 * rest.
 */
export interface FieldControl {
  /** The label element's id, or undefined when the field has no label. */
  labelId?: string
}

const FieldControlContext = createContext<FieldControl | null>(null)

export const FieldControlProvider = FieldControlContext.Provider

/**
 * The enclosing `Field`'s label, if there is one.
 *
 * Null is a supported state, not a failure: every control here works outside a
 * field, and each names itself from its own `label` prop when it must.
 */
export function useFieldControl(): FieldControl | null {
  return useContext(FieldControlContext)
}
