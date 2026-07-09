import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

/**
 * Quiet mono tag on an accent wash — borderless sibling of {@link Badge}, for
 * taxonomy and category labels.
 *
 * @example
 * <Tag>typescript</Tag>
 */
export function Tag({ children, className, ...rest }: TagProps) {
  return (
    <span
      className={clsx(
        'font-mono text-xs tracking-wide text-(--secondary-text) bg-(--accent-muted) px-2.5 py-1 rounded-(--radius-sm)',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Tag
