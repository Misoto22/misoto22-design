'use client'

import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface DiagramLegendEntry {
  /** Stable key, and what a caller keys its own data by. */
  key: string
  label: string
  /**
   * The drawn mark, as SVG children on a 14 × 14 grid.
   *
   * Markup rather than a name from a fixed list, because the whole point of a
   * key is that it shows the SAME mark the figure drew — and a figure that
   * invented a new one would have to add it here too. `kindLegend`,
   * `variantLegend` and `stateLegend` build the standard sets out of the
   * renderers' own drawing code, so those can never drift.
   */
  sample: ReactNode
}

export interface DiagramLegendProps {
  entries: DiagramLegendEntry[]
  /** The kicker before the row. Pass null for a bare row. */
  title?: string | null
  className?: string
}

/**
 * The key: which drawn form means which kind of thing.
 *
 * Not optional furniture in a monochrome system, and this is the one place that
 * has to be said plainly. When the difference between a queue and a cache is a
 * sigil rather than a colour, the key is the only place a reader is told what
 * the sigil means — a figure whose forms are undocumented is a figure whose
 * forms might as well not have been drawn.
 *
 * A `<ul>` rather than a row of `<span>`s: it is a list of pairs, and the count
 * is part of what a screen reader should say about it.
 *
 * @example
 * <DiagramLegend entries={kindLegend(['backend', 'database'])} />
 */
export function DiagramLegend({ entries, title = 'Key', className }: DiagramLegendProps) {
  if (entries.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-(--rule) pt-3',
        className,
      )}
    >
      {title && <span className="eyebrow text-(--ink-3-aa)">{title}</span>}
      <ul
        className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0"
        aria-label={title ?? 'Key'}
      >
        {entries.map((entry) => (
          <li key={entry.key} className="flex items-center gap-2">
            <svg viewBox="0 0 14 14" className="size-4 shrink-0" aria-hidden="true">
              {entry.sample}
            </svg>
            <span className="mono-meta text-(--ink-2)">{entry.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DiagramLegend
