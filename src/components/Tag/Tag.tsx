import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export interface TagProps {
  children: ReactNode
  className?: string
}

/**
 * Quiet mono tag on an accent wash — borderless sibling of {@link Badge}, for
 * taxonomy and category labels.
 *
 * @example
 * <Tag>typescript</Tag>
 */
export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={clsx(
        'font-mono text-xs tracking-wide text-(--secondary-text) bg-(--accent-muted) px-2.5 py-1 rounded-(--radius-sm)',
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Tag
