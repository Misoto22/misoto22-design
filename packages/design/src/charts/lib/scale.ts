/**
 * Where a value sits on a linear scale, and what to do when the scale has no
 * width.
 *
 * The three engine-less forms — `Sparkline`, `Heatmap`, `BulletChart` — each
 * normalise a value into a 0-to-1 position, and each had answered the
 * degenerate case differently: the heatmap put a constant grid in the middle of
 * its ramp, the bullet chart put a constant measure at the start of its track,
 * and the sparkline divided by a substituted `1` and so drew every flat run
 * along the floor. A flat run along the floor is the worst of the three,
 * because in a column of sparklines "unchanged" and "pinned at its worst" is
 * the one distinction the reader is scanning for.
 *
 * The middle is the honest answer: a scale with no width cannot rank anything,
 * so no position on it is more true than another, and the centre is the only
 * one that does not read as a verdict.
 */

/** Where `value` sits between `min` and `max`, 0 to 1. Not held to the ends. */
export function fraction(value: number, min: number, max: number): number {
  const span = max - min
  if (span === 0) return 0.5
  return (value - min) / span
}

/** `fraction`, held inside the track. */
export function clampedFraction(value: number, min: number, max: number): number {
  return Math.min(1, Math.max(0, fraction(value, min, max)))
}
