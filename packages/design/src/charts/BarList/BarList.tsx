import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { defaultTick } from '../lib/format'

export interface BarListItem {
  /** What the row is. Doubles as its key, so it must be unique. */
  name: string
  value: number
  /** Turns the row's name into a link. */
  href?: string
  /** Drawn before the name — a favicon, a status dot, a flag. */
  icon?: ReactNode
}

export interface BarListProps {
  /** What the list ranks. Required: it names the table for a screen reader. */
  label: string
  /** Prints the label above the list instead of hiding it from sight. */
  showLabel?: boolean
  items: BarListItem[]
  /** Keeps the top N and folds the rest into one "Other" row. */
  limit?: number
  /** Formats each value. Defaults to the same compact form the axes use. */
  formatValue?: (value: number) => string
  /**
   * The scale's ceiling. Derived from the largest row when omitted.
   *
   * Pin it to compare two lists side by side — on independent scales the
   * leading row of each fills its track, and two very different numbers look
   * identical.
   */
  max?: number
  /** Sorts descending before rendering. */
  sort?: boolean
  className?: string
}

/**
 * A ranked list, with the bar behind the name rather than beside it.
 *
 * The answer to "top referrers", "slowest endpoints", "biggest accounts" — and
 * a better one than a horizontal bar chart, which spends a third of its width
 * on a category axis repeating labels the rows could simply contain. Reading a
 * name off a y-axis and matching it to a bar is two steps; reading it off the
 * bar is none.
 *
 * It is a `<table>`, because that is what it is: two columns, a header, and one
 * row per thing. The bar is a background on the name cell, so it never becomes
 * a second element a screen reader has to walk past.
 *
 * Reach for `<BarChart orientation="horizontal">` instead when the categories
 * are few and fixed and the axis is doing real work — a scale a reader needs to
 * read values off, rather than a ranking they need to skim.
 *
 * @example
 * <BarList label="Top referrers" items={referrers} limit={5} />
 */
export function BarList({
  label,
  showLabel = false,
  items,
  limit,
  formatValue = defaultTick,
  max,
  sort = true,
  className,
}: BarListProps) {
  const ordered = sort ? [...items].sort((a, b) => b.value - a.value) : items

  // The tail is summed rather than dropped: a "top five" that silently discards
  // the other forty misstates the whole, and the reader has no way to tell.
  const shown =
    limit !== undefined && ordered.length > limit
      ? [
          ...ordered.slice(0, limit),
          {
            name: 'Other',
            value: ordered.slice(limit).reduce((sum, item) => sum + item.value, 0),
          },
        ]
      : ordered

  const ceiling = max ?? Math.max(1, ...shown.map((item) => item.value))

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <table className="w-full border-collapse text-sm">
        <caption
          className={cn(
            'text-start',
            showLabel ? 'mb-2 eyebrow text-(--ink-3-aa)' : 'sr-only',
          )}
        >
          {label}
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((item) => {
            const share = Math.max(0, Math.min(1, item.value / ceiling))

            return (
              <tr key={item.name} className="align-middle">
                <th scope="row" className="w-full py-1 pe-3 text-start font-normal">
                  {/* The bar is a background on the cell, not a sibling: an
                      empty <div> beside the name would be one more thing in the
                      accessibility tree saying nothing. */}
                  <span
                    className="flex h-8 items-center gap-2 rounded-(--radius-sm) px-2 text-(--ink)"
                    style={{
                      background: `linear-gradient(to right, color-mix(in srgb, var(--series-1) calc(var(--chart-fill) * 100%), transparent) ${share * 100}%, transparent ${share * 100}%)`,
                    }}
                  >
                    {item.icon && (
                      <span aria-hidden className="flex shrink-0 items-center text-(--ink-3-aa)">
                        {item.icon}
                      </span>
                    )}
                    {item.href ? (
                      <a
                        href={item.href}
                        className="truncate underline-offset-2 hover:underline focus-visible:underline"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <span className="truncate">{item.name}</span>
                    )}
                  </span>
                </th>
                <td className="py-1 text-end font-mono text-xs whitespace-nowrap tabular-nums text-(--ink-2)">
                  {formatValue(item.value)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default BarList
