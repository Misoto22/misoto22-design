/**
 * The three things a numeric control has to do to a typed number, in one place.
 *
 * `Slider` and `NumberField` both take a number from a keyboard and both have
 * to reconcile it with `min`, `max` and `step`. Written twice they drift, and
 * they drift in the direction nobody tests: a slider that snaps 0.1 + 0.2 to
 * `0.30000000000000004` and a field beside it that prints `0.3`.
 *
 * The step base is `min`, not zero, because that is what the HTML step
 * algorithm uses — a range from 5 to 100 stepping by 10 lands on 15, not on 10.
 */

/**
 * Decimal places implied by a step.
 *
 * Snapping is arithmetic on binary floats, so a value that should be exactly
 * one step from the last one usually is not. Rounding the result to the step's
 * own precision is what stops that reaching a readout — and the step's own
 * precision is the most a caller can have meant.
 */
export function decimalsForStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 0
  const text = String(step)
  // Exponential notation carries its precision in the exponent, and `1e-7` has
  // no '.' to split on — `String(0.0000001)` is exactly that.
  const exponential = /e-(\d+)$/i.exec(text)
  if (exponential) return Number(exponential[1])
  return text.split('.')[1]?.length ?? 0
}

/** Rounds to the nearest step from `min`, at the step's own precision. */
export function snapToStep(value: number, step: number, min = 0): number {
  if (!Number.isFinite(step) || step <= 0) return value
  const base = Number.isFinite(min) ? min : 0
  const snapped = base + Math.round((value - base) / step) * step
  return Number(snapped.toFixed(decimalsForStep(step)))
}

/** Holds a value inside a range. An inverted range yields its own lower bound. */
export function clampToRange(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * A typed string as a number, or `null` when it is not one yet.
 *
 * `null` rather than `NaN` because the caller has to tell "not a number" from
 * "not finished being typed" and act the same way on both: leave the committed
 * value alone. `Number('')` is `0`, which is the trap this exists for — an
 * emptied box would otherwise commit zero on every keystroke that cleared it.
 */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}
