import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ChartColumn {
  /** The row field this column reads. */
  key: string
  /** What the column is called in the table header. */
  label: ReactNode
}

export interface ChartDataTableProps {
  caption: string
  rows: Record<string, unknown>[]
  columns: ChartColumn[]
  /** The field naming each row — the category, the date, the bucket. */
  rowKey?: string
}

/**
 * The chart's data, as a table, for a reader who cannot see the chart.
 *
 * An SVG plot is a picture: `accessibilityLayer` gives Recharts' own keyboard
 * cursor and announces one point at a time, which is navigation rather than
 * access to the figures. This is the table view — visually hidden, in the
 * accessibility tree, and generated from the same rows the marks are drawn
 * from, so the two cannot disagree.
 *
 * `sr-only` rather than `hidden`: `display: none` removes it from the
 * accessibility tree as well as from the page, which would defeat the purpose.
 */
export function ChartDataTable({ caption, rows, columns, rowKey }: ChartDataTableProps) {
  if (rows.length === 0 || columns.length === 0) return null

  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {rowKey && <th scope="col">{rowKey}</th>}
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {rowKey && <th scope="row">{cellText(row[rowKey]) || String(index + 1)}</th>}
            {columns.map((column) => (
              <td key={column.key}>{cellText(row[column.key])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** A cell value as text. Anything that is not a primitive reads as empty. */
function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string' || typeof value === 'boolean') return String(value)
  return ''
}

export interface ChartFigureProps {
  /**
   * What the chart shows, in a sentence a reader could act on — "Visitors per
   * month, 2026" rather than "Chart".
   *
   * Required, and required for the same reason `Table.caption` and
   * `Progress.label` are: a plot with no name announces nothing, and it is not
   * a thing a call site can be trusted to remember. Hidden by default, because
   * most call sites already print a heading above the chart; `showTitle` puts
   * it back when they do not.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  className?: string
  children: ReactNode
  /** The table view. Omit and it is generated; `false` opts out. */
  table?: Omit<ChartDataTableProps, 'caption'> | false
}

/**
 * The figure a chart is rendered inside: its name, its plot, and its data as a
 * table.
 *
 * Every chart root in the package wraps itself in this, so "the chart is
 * announced and its numbers are reachable" is a property of the system rather
 * than something each call site has to remember to add.
 */
export function ChartFigure({
  title,
  showTitle = false,
  description,
  className,
  children,
  table,
}: ChartFigureProps) {
  const captionId = `chart-title-${useId().replace(/:/g, '')}`

  return (
    // Named explicitly rather than relying on the caption. A `<figcaption>` IS
    // the figure's accessible name per the spec, but support for deriving it is
    // uneven across assistive technology — and a chart whose name resolves in
    // only some screen readers is a chart with no name.
    <figure aria-labelledby={captionId} className={cn('flex min-h-0 w-full flex-col', className)}>
      <figcaption
        id={captionId}
        className={cn(!showTitle && 'sr-only', showTitle && 'mb-3 flex flex-col gap-1')}
      >
        <span className={cn(showTitle && 'font-heading text-[length:var(--fs-item)] text-(--ink)')}>{title}</span>
        {description && (
          <span className={cn(showTitle && 'mono-meta text-(--ink-3-aa)')}>{description}</span>
        )}
      </figcaption>
      {children}
      {table && <ChartDataTable caption={title} {...table} />}
    </figure>
  )
}
