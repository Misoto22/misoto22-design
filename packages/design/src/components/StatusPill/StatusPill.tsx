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
 * A live state, named: a dot plus an uppercase mono label in an outlined pill.
 *
 * One component rather than a dot and a pill assembled per call site, which is
 * how the same "available for work" chip ended up with three different dot
 * sizes and two different pulse timings on one site.
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
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 rounded-(--radius-pill) border border-(--rule-2) bg-(--paper) py-1.5 ps-2.5 pe-3 eyebrow tracking-[0.12em] text-(--ink-2)',
        className,
      )}
      {...rest}
    >
      <StatusDot tone={tone} pulse={pulse} />
      {children}
    </span>
  )
}

export default StatusPill
