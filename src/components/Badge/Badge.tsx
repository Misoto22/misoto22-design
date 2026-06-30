import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export interface BadgeProps {
  children: ReactNode
  className?: string
}

/**
 * Mono chip with a hairline border that warms to the accent on hover. Used for
 * counts, labels, and small inline markers.
 *
 * @example
 * <Badge>New</Badge>
 */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'font-mono text-xs tracking-wide bg-(--accent-muted) text-(--foreground-muted) px-2.5 py-1 rounded-(--radius-sm) border border-(--border-subtle) hover:border-(--accent) transition-colors duration-300',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
