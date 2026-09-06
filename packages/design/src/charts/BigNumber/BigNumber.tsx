import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Which way a change is good. */
export type DeltaIntent = 'up-is-good' | 'down-is-good' | 'neutral'

export interface BigNumberDelta {
  /**
   * The change, already computed, as a RATIO. Positive is up, whatever that
   * means here.
   *
   * `0.124` is the twelve-point-four percent the default `format` prints.
   * Passing `12.4` for the same change prints `+1240%`, and nothing can catch
   * that for you — a ratio and a percentage are both plain numbers, and either
   * is a legitimate value under a `format` of your own.
   */
  value: number
  /** What it is a change from — "vs last week". */
  label?: ReactNode
  /**
   * Which direction counts as good.
   *
   * Required rather than assumed, because the assumption is wrong half the
   * time: revenue up is good, error rate up is not, and a component that
   * guesses will confidently colour a bad number green.
   */
  intent?: DeltaIntent
  /** Formats the change. Defaults to a signed percentage. */
  format?: (value: number) => string
}

export interface BigNumberProps {
  /** What the number counts. */
  label: ReactNode
  /**
   * The number, already formatted — this component does not guess a unit.
   *
   * `null` and `undefined` are the empty state rather than a blank space: a
   * headline with nothing under it reads as a figure that failed to load, and
   * the reader's next move is to reload a page that will look the same.
   */
  value: ReactNode
  /** What stands in for the number when there is none. */
  emptyValue?: ReactNode
  delta?: BigNumberDelta
  /** A sparkline, a note, a caveat. Sits under the number. */
  children?: ReactNode
  className?: string
}

const signed = (value: number): string =>
  `${value > 0 ? '+' : ''}${(value * 100).toFixed(1).replace(/\.0$/, '')}%`

/**
 * One number, at the size of a headline.
 *
 * The form most dashboards need most often and most chart libraries do not
 * ship, on the grounds that it is not a chart. It is the right answer whenever
 * there is exactly one figure to report: a plot of a single value is a plot
 * whose shape carries nothing, and the reader has to decode an axis to recover
 * a number that could simply have been printed.
 *
 * The delta is where this earns its place over a `<p>`. Direction is stated by
 * the CALL SITE (`intent`), never inferred: "errors down 12%" is good news and
 * "revenue down 12%" is not, and no component can tell which it is holding.
 * Where the direction is known, the arrow and the word carry it — the status
 * colour is the third signal, never the only one.
 *
 * @example
 * <BigNumber
 *   label="Monthly revenue"
 *   value="$48,210"
 *   delta={{ value: 0.124, label: 'vs last month', intent: 'up-is-good' }}
 * />
 */
export function BigNumber({
  label,
  value,
  emptyValue = '—',
  delta,
  children,
  className,
}: BigNumberProps) {
  const intent = delta?.intent ?? 'neutral'
  const format = delta?.format ?? signed
  const rising = (delta?.value ?? 0) > 0
  const flat = (delta?.value ?? 0) === 0
  const isEmpty = value === null || value === undefined

  // A change of exactly zero is not good news and not bad news, and the tone
  // and the arrow have always said so. The verdict is dropped with them: an
  // intent decides which DIRECTION is better, and there is no direction here,
  // so `{ value: 0, intent: 'up-is-good' }` used to be announced as "no
  // change, worse" — a judgement nothing on screen was making.
  const good = flat || intent === 'neutral' ? null : intent === 'up-is-good' ? rising : !rising
  const tone = good === null ? 'text-(--ink-2)' : good ? 'text-(--ok)' : 'text-(--danger)'

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="eyebrow text-(--ink-3-aa)">{label}</span>

      {/* The serif, at the record-title step. A number this size is the page's
          headline, and the system sets headlines in the editorial face. */}
      <span
        className={cn(
          'font-heading text-[length:var(--fs-lead)] leading-none tabular-nums',
          isEmpty ? 'text-(--ink-3-aa)' : 'text-(--ink)',
        )}
      >
        {isEmpty ? (
          <>
            {/* The dash is the sighted reading and the sentence is the spoken
                one. Announcing "em dash" instead would be a third thing. */}
            <span aria-hidden>{emptyValue}</span>
            <span className="sr-only">No data</span>
          </>
        ) : (
          value
        )}
      </span>

      {delta && (
        <span className={cn('flex items-baseline gap-1.5 mono-meta', tone)}>
          {/* The arrow is the second carrier and the word is the third, so the
              reading survives greyscale, forced colours and colour blindness —
              which the status tint alone does not. */}
          <span aria-hidden>{flat ? '→' : rising ? '↑' : '↓'}</span>
          <span>{format(delta.value)}</span>
          <span className="sr-only">
            {flat ? 'no change' : rising ? 'up' : 'down'}
            {good === null ? '' : good ? ', better' : ', worse'}
          </span>
          {delta.label && <span className="text-(--ink-3-aa)">{delta.label}</span>}
        </span>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}

export default BigNumber
