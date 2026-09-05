import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface Figure {
  /** Stable key; also what a caller keys its own data by. */
  id: string
  /** The mono kicker over the value. */
  label: string
  /** The value itself, set in the serif at the band's scale. */
  value: ReactNode
  /** The quiet line under it — a trend, a qualifier, a second fact. */
  note?: ReactNode
}

export interface FigureBandProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  figures: Figure[]
  /**
   * How large the value is set.
   *
   * `lead` is for a band that is the point of its page — a stats headline,
   * where the numbers ARE the content. `sub` is for a band that supports the
   * page around it, and keeps the ladder honest: a supporting figure must not
   * be set at the same size as the page's own subject.
   */
  scale?: 'lead' | 'sub'
  /** Names the band for assistive tech when it has no visible heading of its own. */
  label?: string
}

const VALUE_SCALE = {
  lead: 'text-[length:var(--fs-lead)] leading-[1.1] tracking-[-0.02em]',
  sub: 'text-[length:var(--fs-sub)] leading-[1.2]',
} as const

/**
 * A row of counted facts, divided by hairlines and nothing else.
 *
 * A `<dl>`, because that is what this is: each cell is a term and its value,
 * and a grid of `<div>`s tells a screen reader nothing about which number goes
 * with which label.
 *
 * Each divider width names the cells that do NOT open a row rather than adding
 * a rule and taking it back — an `undo` at equal specificity resolves on
 * Tailwind's own sort order, which is not something a layout should depend on.
 * Drawn this way, no edge is ever painted past the last column.
 *
 * @example
 * <FigureBand
 *   label="At a glance"
 *   figures={[
 *     { id: 'posts', label: 'Posts', value: '48', note: '+6 this year' },
 *     { id: 'photos', label: 'Frames', value: '1,204' },
 *   ]}
 * />
 */
export function FigureBand({
  figures,
  scale = 'lead',
  label,
  className,
  ...rest
}: FigureBandProps) {
  if (figures.length === 0) return null

  return (
    <dl
      aria-label={label}
      className={cn(
        // A container, not a viewport reader: four figures across is a decision
        // about how wide THIS band is, and it is wrong in a 390px frame inside a
        // 1440px window.
        '@container m-0 grid grid-cols-2 border-y border-(--rule) @5xl:grid-cols-4',
        '[&>div]:border-(--rule) @max-5xl:[&>div:nth-child(even)]:border-s @max-5xl:[&>div:nth-child(n+3)]:border-t @5xl:[&>div:not(:first-child)]:border-s',
        className,
      )}
      {...rest}
    >
      {figures.map((figure) => (
        <div
          key={figure.id}
          className="bg-transparent px-[clamp(1rem,calc(3*var(--fluid)),1.625rem)] py-[clamp(1.5rem,calc(4*var(--fluid)),2.25rem)]"
        >
          <dt className="mb-3 eyebrow text-(--ink-3-aa)">{figure.label}</dt>
          <dd className={cn('m-0 font-heading font-normal text-(--ink)', VALUE_SCALE[scale])}>
            {figure.value}
          </dd>
          {figure.note !== undefined && figure.note !== null && (
            <dd className="m-0 mt-2.5 font-sans text-[13px] font-light leading-[1.5] text-(--ink-3-aa)">
              {figure.note}
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}

export default FigureBand
