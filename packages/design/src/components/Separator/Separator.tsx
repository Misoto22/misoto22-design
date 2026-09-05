import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  /** `hairline` divides rows inside one block; `edge` divides one block from the next. */
  weight?: 'hairline' | 'edge' | 'hard'
  /**
   * A rule that only groups things visually is decoration and must not be
   * announced. Set `false` when the rule genuinely separates two sections a
   * screen reader should hear as distinct.
   */
  decorative?: boolean
}

const WEIGHT = {
  hairline: 'bg-(--rule)',
  edge: 'bg-(--rule-2)',
  hard: 'bg-(--rule-hard)',
} as const

/**
 * A rule.
 *
 * In a monochrome system the rule does the work colour would otherwise do, so
 * it has three weights rather than one: hairline between rows, edge between
 * blocks, hard under a masthead. Picking by name keeps a page from drifting
 * into five hand-tuned greys.
 *
 * @example
 * <Separator weight="hard" />
 * @example
 * <Separator orientation="vertical" className="h-4" />
 */
export function Separator({
  orientation = 'horizontal',
  weight = 'hairline',
  decorative = true,
  className,
  ...rest
}: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        WEIGHT[weight],
        className,
      )}
      {...rest}
    />
  )
}

export default Separator
