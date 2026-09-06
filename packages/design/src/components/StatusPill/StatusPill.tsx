import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { StatusDot, type StatusTone } from '../StatusDot/StatusDot'

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  tone?: StatusTone
  /** Pulsing live dot (default) vs a settled one. */
  pulse?: boolean
}

/**
 * The two tones a reader must not miss, in the words the dot cannot say.
 *
 * `tone` reaches only the StatusDot, and the dot is `aria-hidden` by law — so
 * before this, "Degraded" in a warning pill and "Degraded" in a neutral one
 * were the same sentence to anyone who could not see the colour.
 *
 * `success` and `neutral` add nothing on purpose. They are the absence of
 * alarm, which is what a reader assumes; announcing it before every settled
 * pill is noise charged to the two tones that are worth interrupting for.
 */
const SEVERITY: Partial<Record<StatusTone, string>> = {
  warning: 'Warning',
  danger: 'Error',
}

/**
 * A live state, named: a dot plus an uppercase mono label in an outlined pill.
 *
 * One component rather than a dot and a pill assembled per call site, which is
 * how the same "available for work" chip ended up with three different dot
 * sizes and two different pulse timings on one site.
 *
 * A warning or danger tone is doubled by a visually-hidden severity word, so
 * the tone survives the dot being hidden. It does not survive monochrome: the
 * pill's own text is `--ink-2` at every tone, and the state itself still
 * belongs in the words the call site writes.
 *
 * @example
 * <StatusPill>Available for work</StatusPill>
 * @example
 * <StatusPill tone="warning" pulse={false}>Degraded</StatusPill>
 */
export function StatusPill({
  children,
  tone = 'success',
  pulse = true,
  className,
  ...rest
}: StatusPillProps) {
  const severity = SEVERITY[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 rounded-(--radius-pill) border border-(--rule-2) bg-(--paper) py-1.5 ps-2.5 pe-3 eyebrow tracking-[0.12em] text-(--ink-2)',
        className,
      )}
      {...rest}
    >
      <StatusDot tone={tone} pulse={pulse} />
      {/* Absolutely positioned by `sr-only`, so it is out of flow and costs the
          pill neither a gap nor a pixel. */}
      {severity && <span className="sr-only">{severity}</span>}
      {children}
    </span>
  )
}

export default StatusPill
