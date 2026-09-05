import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /**
   * Describes the table for a screen reader, which cannot see the heading above
   * it. Rendered as a visually-hidden `<caption>` — required, because an
   * unnamed table in a page with three tables is unnavigable.
   */
  caption: string
  /** Prints the caption instead of hiding it. */
  showCaption?: boolean
  /**
   * Pins the header row while the body scrolls. Needs a bounded height on the
   * container — otherwise the page scrolls, not the table, and nothing sticks.
   */
  stickyHeader?: boolean
}

/**
 * A ruled data table.
 *
 * Wrapped in its own horizontally scrolling container, because a table is the
 * one block that legitimately exceeds the measure — and a page that scrolls
 * sideways as a whole is a layout bug, while a table that does is a table.
 *
 * That container is focusable, and it has to be. A scrollable region whose
 * contents are not themselves focusable is unreachable by keyboard: there is no
 * element to Tab to and therefore no way to press an arrow key at it, so the
 * columns past the fold simply do not exist for anyone not using a mouse. The
 * `tabIndex` gives it a stop; the `role` and label say what the reader has
 * landed on rather than announcing an anonymous group.
 *
 * Rules only: no zebra striping, no cell borders. In a monochrome system a
 * striped row is a second surface competing with the page ground, and the
 * hairline between rows is already enough to track a line across.
 *
 * @example
 * <Table caption="Deploy history">
 *   <THead><TR><TH>Commit</TH><TH align="right">Duration</TH></TR></THead>
 *   <TBody><TR><TD>a1b2c3d</TD><TD align="right">2m 14s</TD></TR></TBody>
 * </Table>
 */
export function Table({
  caption,
  showCaption = false,
  stickyHeader = false,
  className,
  children,
  ...rest
}: TableProps) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption}
      className="w-full overflow-x-auto scroll-slim"
    >
      <table
        className={cn(
          'w-full border-collapse text-start text-sm',
          stickyHeader && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-(--z-rule) [&_thead]:bg-(--paper)',
          className,
        )}
        {...rest}
      >
        <caption
          className={cn(
            showCaption ? 'pb-3 text-start eyebrow text-(--ink-3-aa)' : 'sr-only',
          )}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  )
}

/** Header group. Draws the hard rule that separates labels from data. */
export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-(--rule-hard)', className)} {...rest} />
}

export function TBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...rest} />
}

export function TR({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-(--rule) last:border-b-0', className)} {...rest} />
}

export type SortDirection = 'ascending' | 'descending' | 'none'

export interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Makes the label a button and shows the sort marker. */
  sortable?: boolean
  /**
   * Which way this column is sorted. Also set as `aria-sort`, which is the
   * only way a screen reader learns a table is ordered at all — a caret drawn
   * in the header tells it nothing.
   */
  sortDirection?: SortDirection
  onSort?: () => void
}

const SORT_ICON = {
  ascending: ArrowUp,
  descending: ArrowDown,
  none: ChevronsUpDown,
} as const

/**
 * A column label. Mono and uppercase, so it never reads as data.
 *
 * When sortable, the label becomes a `<button>` INSIDE the `<th>` rather than
 * the `<th>` becoming clickable: a cell with a click handler is not focusable
 * and not announced as a control, so the sort exists only for a mouse.
 */
export function TH({ sortable = false, sortDirection = 'none', onSort, className, children, ...rest }: THProps) {
  const Icon = SORT_ICON[sortDirection]
  return (
    <th
      scope="col"
      aria-sort={sortable ? sortDirection : undefined}
      className={cn('py-3 pe-6 last:pe-0 align-bottom eyebrow text-(--ink-3-aa)', className)}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className="group inline-flex items-center gap-1.5 eyebrow text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:text-(--ink) aria-[sort]:text-(--ink)"
        >
          {children}
          <Icon
            size={12}
            strokeWidth={2}
            aria-hidden
            className={cn(
              'shrink-0 transition-opacity',
              sortDirection === 'none' && 'opacity-40 group-hover:opacity-100',
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

export function TD({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('py-3.5 pe-6 last:pe-0 align-top text-(--ink-2)', className)} {...rest} />
}

export default Table
