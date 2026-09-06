'use client'

import { useEffect, useState } from 'react'
import type { TimeHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/**
 * How the instant reads.
 *
 * `auto` is relative while the gap is small enough to be useful and absolute
 * once it is not — "3 hours ago" answers the question a reader is actually
 * asking about a recent record, and "2 years ago" does not.
 */
export type TimestampFormat = 'auto' | 'relative' | 'absolute'

export interface TimestampProps
  extends Omit<TimeHTMLAttributes<HTMLTimeElement>, 'dateTime' | 'children'> {
  /** The instant. A `Date`, an ISO string, or epoch milliseconds. */
  value: Date | string | number
  /** How the instant reads. See {@link TimestampFormat}. */
  format?: TimestampFormat
  /**
   * How far from now `auto` still prints a relative time, in milliseconds.
   * Seven days by default — past a week the calendar date is the more useful
   * fact, and it is also the one that stops changing.
   */
  relativeWithin?: number
  /** Adds the clock time to the absolute form. */
  showTime?: boolean
}

/**
 * The units, largest first, with the milliseconds in one of each.
 *
 * The month and year lengths are the average ones — 30.44 and 365.24 days —
 * because a relative time is a rounded statement about a gap, not a calendar
 * calculation, and "2 months ago" must not become "1 month ago" because
 * February was short.
 */
const UNITS = [
  ['year', 31_556_952_000],
  ['month', 2_629_746_000],
  ['week', 604_800_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
] as const

/**
 * The gap in words, in the reader's own language.
 *
 * `Intl.RelativeTimeFormat` rather than a table of English strings: it is in
 * every runtime this package targets, costs nothing to ship, and `numeric:
 * 'auto'` is what turns "1 day ago" into "yesterday".
 *
 * Truncated, not rounded — ninety seconds is "1 minute ago", because a reader
 * who has just watched something happen is not helped by being told it was two
 * minutes. Anything under a minute is "now": the seconds are noise, and they
 * are also the only part that would be wrong a moment later.
 */
function relative(deltaMs: number): string {
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const gap = Math.abs(deltaMs)

  for (const [unit, size] of UNITS) {
    if (gap >= size) return format.format(Math.trunc(deltaMs / size), unit)
  }
  return format.format(0, 'second')
}

/** The calendar date, in the reader's own locale and time zone. */
function absolute(date: Date, showTime: boolean): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...(showTime ? { timeStyle: 'short' as const } : {}),
  }).format(date)
}

/**
 * A date or a time, rendered the one way the system renders them.
 *
 * Every list of records needs this, and `new Date().toLocaleString()` at the
 * call site is precisely how a product ends up with four date formats on one
 * screen.
 *
 * **On hydration.** Both halves of a formatted date are environment-dependent:
 * a relative time depends on when it is read, and even an absolute one depends
 * on the reader's locale and time zone, none of which a static build knows. So
 * the first paint — the one the server produces and the one the client must
 * reproduce exactly — is the ISO calendar date in UTC, sliced straight out of
 * the ISO string with no `Intl` anywhere near it. Both sides compute it from
 * the same characters, so they cannot disagree. The locale-aware and relative
 * forms are applied after mount, in an effect, where there is a reader to be
 * local to. This package statically exports every page, so the alternative is a
 * hydration mismatch on any page with a date on it.
 *
 * The `datetime` attribute is the full ISO instant from the first render
 * onwards and never changes, so a screen reader, a crawler, or anything else
 * parsing the markup gets the exact moment whether or not the effect has run.
 *
 * It formats once per mount. A hundred rows each holding a ticking interval to
 * keep "3 minutes ago" honest is a cost nobody asked for; a list that must tick
 * should re-key or re-render from above.
 *
 * @example
 * <Timestamp value={deploy.finishedAt} />
 * @example
 * <Timestamp value="2026-01-14T09:30:00Z" format="absolute" showTime />
 */
export function Timestamp({
  value,
  format = 'auto',
  relativeWithin = 604_800_000,
  showTime = false,
  className,
  ...rest
}: TimestampProps) {
  const date = value instanceof Date ? value : new Date(value)
  const time = date.getTime()
  const valid = !Number.isNaN(time)

  // False through the server render and the hydrating render, true from the
  // first effect on. That is the whole hydration contract in one flag.
  const [local, setLocal] = useState(false)
  useEffect(() => setLocal(true), [])

  if (!valid) {
    // Not "Invalid Date" — that is the browser's internal string and an
    // engineering artefact in front of a reader. A value nothing can parse is a
    // missing value, and a record UI already has a glyph for one. There is no
    // <time> here either: an element whose datetime cannot be written is not a
    // time.
    return (
      <span className={cn('text-(--ink-3-aa)', className)} {...rest}>
        —
      </span>
    )
  }

  const iso = date.toISOString()

  return (
    <time dateTime={iso} className={cn('tabular-nums', className)} {...rest}>
      {local ? read(date, format, relativeWithin, showTime) : iso.slice(0, 10)}
    </time>
  )
}

/**
 * The text a reader who has a clock and a locale gets. Only ever called after
 * mount — everything in here reads `Date.now()` or the ambient locale, which is
 * exactly what the server cannot know.
 */
function read(
  date: Date,
  format: TimestampFormat,
  relativeWithin: number,
  showTime: boolean,
): string {
  const delta = date.getTime() - Date.now()
  const asRelative = format === 'relative' || (format === 'auto' && Math.abs(delta) < relativeWithin)
  return asRelative ? relative(delta) : absolute(date, showTime)
}

export default Timestamp
