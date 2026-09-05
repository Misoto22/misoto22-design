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
export function Table({ caption, showCaption = false, className, children, ...rest }: TableProps) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={caption}
      className="w-full overflow-x-auto scroll-slim"
    >
      <table
        className={cn('w-full border-collapse text-start text-sm', className)}
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

/** A column label. Mono and uppercase, so it never reads as data. */
export function TH({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn('py-3 pe-6 last:pe-0 align-bottom eyebrow text-(--ink-3-aa)', className)}
      {...rest}
    />
  )
}

export function TD({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('py-3.5 pe-6 last:pe-0 align-top text-(--ink-2)', className)} {...rest} />
}

export default Table
