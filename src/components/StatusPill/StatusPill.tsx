import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { StatusDot } from '../StatusDot/StatusDot'

export interface StatusPillProps {
  children: ReactNode
  pulse?: boolean
  className?: string
}

/**
 * Eyebrow-styled pill with a leading {@link StatusDot} — for "live", "online",
 * or "open to work" style status markers.
 *
 * @example
 * <StatusPill>Available for work</StatusPill>
 */
export function StatusPill({ children, pulse = true, className }: StatusPillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 border border-(--border-color) rounded-(--radius-pill) eyebrow tracking-[0.12em] text-(--foreground-muted) bg-(--card-background)',
        className,
      )}
    >
      <StatusDot pulse={pulse} />
      {children}
    </span>
  )
}

export default StatusPill
