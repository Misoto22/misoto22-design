import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  /** Renders the pressed/selected look. Pair with `aria-pressed` on a wrapper button. */
  active?: boolean
}

/**
 * A subject label — a topic, a technology, a filter facet.
 *
 * Distinct from `Badge`, which carries a state or a count. A tag names what
 * something is ABOUT, so several sit together in a row and the reader scans
 * them; a badge is one fact about one record.
 *
 * Presentational on purpose. To make a tag filter a list, wrap it in a button
 * or a link at the call site and pass `active` — that keeps the focus ring,
 * the pressed state and the keyboard handling with the element that actually
 * owns them.
 *
 * @example
 * <Tag>TypeScript</Tag>
 * @example
 * <button type="button" aria-pressed={on} onClick={toggle}><Tag active={on}>Rust</Tag></button>
 */
export function Tag({ children, active = false, className, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-(--radius-sm) px-2.5 py-1 font-mono text-xs tracking-wide transition-colors duration-(--duration-fast)',
        active ? 'bg-(--ink) text-(--paper)' : 'bg-(--stone) text-(--ink-3-aa)',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Tag
