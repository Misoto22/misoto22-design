import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

/**
 * Mono chip with a hairline border that warms to the accent on hover. Used for
 * counts, labels, and small inline markers.
 *
 * @example
 * <Badge>New</Badge>
 */
export function Badge({ children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'font-mono text-xs tracking-wide bg-(--accent-muted) text-(--foreground-muted) px-2.5 py-1 rounded-(--radius-sm) border border-(--border-subtle) hover:border-(--accent) transition-colors duration-300',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Badge
