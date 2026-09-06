import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface DescriptionListItem {
  /**
   * A stable key. Optional: the index is used when it is absent, which is
   * correct for the fixed field list a record page renders and wrong for a list
   * whose rows are added, removed or reordered — pass it there.
   */
  id?: string
  /** The label. Rendered as a `<dt>`. */
  term: ReactNode
  /** The value. Rendered as a `<dd>`, so it can be a `Badge` or a link. */
  description: ReactNode
}

/**
 * Where the value sits relative to its label.
 *
 * `row` is the record-page shape: label in a fixed column at the inline start,
 * value beside it, so a reader scans the labels down one edge. It collapses to
 * one column under the `sm` breakpoint, because a 12rem label column on a phone
 * leaves the value about eight characters wide.
 *
 * `stacked` puts the value under its label at every width — the right answer
 * inside a card or a sidebar that is narrow by design rather than by viewport.
 */
export type DescriptionListLayout = 'row' | 'stacked'

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /** The pairs, in the order they should read. An empty array renders nothing. */
  items: DescriptionListItem[]
  /** How the value sits relative to its label. See {@link DescriptionListLayout}. */
  layout?: DescriptionListLayout
  /**
   * Draws a hairline under every pair but the last. Off for a list inside a
   * card that already has an edge, on for a list that is the page's structure.
   */
  divided?: boolean
}

const LAYOUT: Record<DescriptionListLayout, string> = {
  row: 'grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]',
  stacked: 'grid gap-y-1',
}

/**
 * A record's fields: label, value, label, value.
 *
 * The single most repeated shape in any detail page, and the one most often
 * hand-built out of a `<div>` grid — which loses the only thing the markup was
 * carrying. A `<dl>` tells a screen reader that "Owner" names the thing beside
 * it; a grid of divs tells it there are two columns of unrelated text, and the
 * reader has to infer the pairing from reading order alone.
 *
 * Reach for `Table` instead when there are several records. This is one record
 * seen from the front; a table is many records seen from above.
 *
 * Each pair is wrapped in a `<div>` — which the HTML specification allows
 * inside a `<dl>` precisely so a pair can be laid out as a unit — so the
 * hairline runs the full width of the row rather than stopping in the column
 * gap.
 *
 * An empty `items` renders `null` rather than an empty bordered box. A record
 * with no fields is a state the page above should be handling with an
 * `EmptyState`, and a hairline around nothing looks like a component that
 * failed to load.
 *
 * @example
 * <DescriptionList
 *   items={[
 *     { term: 'Owner', description: 'Henry Chen' },
 *     { term: 'Status', description: <Badge tone="success">Deployed</Badge> },
 *   ]}
 * />
 * @example
 * <DescriptionList layout="stacked" divided={false} items={fields} />
 */
export function DescriptionList({
  items,
  layout = 'row',
  divided = true,
  className,
  ...rest
}: DescriptionListProps) {
  if (items.length === 0) return null

  return (
    <dl className={cn('m-0', !divided && 'flex flex-col gap-3', className)} {...rest}>
      {items.map((item, index) => (
        <div
          key={item.id ?? index}
          className={cn(
            LAYOUT[layout],
            divided && 'border-b border-(--rule) py-3 first:pt-0 last:border-b-0 last:pb-0',
          )}
        >
          <dt className="text-sm text-(--ink-3-aa)">{item.term}</dt>
          <dd className="m-0 text-sm text-(--ink-2)">{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

export default DescriptionList
