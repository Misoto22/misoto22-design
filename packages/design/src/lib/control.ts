/**
 * The one text-control look, shared by Input, Textarea and Select.
 *
 * These three had each carried their own copy of the class string. Three copies
 * drift: the padding stayed in step, but the focus treatment and the disabled
 * opacity did not, and a form ended up with a select that dimmed differently
 * from the input beside it. One export, three consumers.
 *
 * The padding comes from the density tokens, so a subtree marked
 * `data-density="compact"` tightens its fields along with its buttons.
 *
 * The border COLOUR is deliberately not in here. It is toggled per control so
 * the invalid state reliably wins over the resting border rather than relying
 * on which utility Tailwind happened to emit last.
 */
export const CONTROL_BASE =
  'w-full rounded-(--radius) border bg-(--paper) px-(--field-px) py-(--field-py) text-sm text-(--ink) transition-colors duration-(--duration-fast) placeholder:text-(--ink-3-aa) hover:border-(--rule-hard) focus:border-(--ink) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none'

/** Resting vs invalid border, named so a call site never writes the colour. */
export const CONTROL_BORDER = {
  resting: 'border-(--rule-2)',
  invalid: 'border-(--danger)',
} as const

/**
 * Reads the invalid state from either spelling.
 *
 * `invalid` is the ergonomic prop; `aria-invalid` is what a form library sets.
 * A control that honours only one of them silently loses the error styling for
 * whichever half of the ecosystem it did not anticipate.
 */
export function isInvalid(invalid?: boolean, ariaInvalid?: boolean | 'true' | 'false' | string): boolean {
  return invalid === true || ariaInvalid === true || ariaInvalid === 'true'
}
