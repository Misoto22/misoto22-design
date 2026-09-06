import type { HTMLAttributes, ReactNode } from 'react'
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
  /**
   * Words in the break — "or continue with", "Older".
   *
   * Horizontal only, and it changes the construction rather than the styling:
   * see the note on the component. `decorative` no longer applies, because the
   * label is content and the two rules beside it are decoration either way.
   */
  label?: ReactNode
}

const WEIGHT = {
  hairline: 'bg-(--rule)',
  edge: 'bg-(--rule-2)',
  hard: 'bg-(--rule-hard)',
} as const

/**
 * A rule, with or without words in it.
 *
 * In a monochrome system the rule does the work colour would otherwise do, so
 * it has three weights rather than one: hairline between rows, edge between
 * blocks, hard under a masthead. Picking by name keeps a page from drifting
 * into five hand-tuned greys.
 *
 * **On the label.** "or continue with" was two Separators and a span at every
 * call site, and the usual one-element version — text laid over a single rule
 * with a background to punch a hole in it — needs to know the ground it is
 * sitting on. Get that wrong and the notch is `--paper` on a card that is
 * `--stone`, which reads as a rendering bug. So there is no ground: the rule is
 * drawn twice, one piece either side of the label, and the gap is a gap. It is
 * correct on any surface without being told which one it is on.
 *
 * @example
 * <Separator weight="hard" />
 * @example
 * <Separator orientation="vertical" className="h-4" />
 * @example
 * <Separator label="or continue with" />
 */
export function Separator({
  orientation = 'horizontal',
  weight = 'hairline',
  decorative = true,
  label,
  className,
  ...rest
}: SeparatorProps) {
  if (label != null && orientation === 'horizontal') {
    return (
      <div className={cn('flex w-full items-center gap-3', className)} {...rest}>
        <span aria-hidden="true" className={cn('h-px flex-1', WEIGHT[weight])} />
        <span className="shrink-0 mono-meta text-(--ink-3-aa)">{label}</span>
        <span aria-hidden="true" className={cn('h-px flex-1', WEIGHT[weight])} />
      </div>
    )
  }

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
