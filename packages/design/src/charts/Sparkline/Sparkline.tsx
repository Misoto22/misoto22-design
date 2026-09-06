import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** The mark a sparkline is drawn with. */
export type SparklineVariant = 'line' | 'area' | 'bars'

export interface SparklineProps {
  /** The numbers, in order. Anything shorter than two points draws nothing. */
  data: number[]
  /**
   * What the run is, in a sentence. Required, and it is the whole accessible
   * name: a sparkline has no axes and no legend, so nothing else describes it.
   */
  label: string
  variant?: SparklineVariant
  /** Height in pixels. The width comes from the container. */
  height?: number
  /**
   * The domain, as `[min, max]`. Derived from the data when omitted.
   *
   * Pin it whenever a column of sparklines is meant to be compared: on
   * independent domains every row peaks and troughs identically, which is the
   * one way a table of sparklines can be actively misleading.
   */
  domain?: [number, number]
  /** Marks the last point, which is usually the one being asked about. */
  showLast?: boolean
  /**
   * The value announced alongside the label — the current reading, formatted.
   * Falls back to the last number.
   */
  value?: ReactNode
  className?: string
}

/** The polyline through a normalised run, in a 0–100 by 0–100 box. */
function points(data: number[], min: number, max: number): { x: number; y: number }[] {
  const span = max - min || 1
  const step = data.length > 1 ? 100 / (data.length - 1) : 0
  return data.map((value, index) => ({
    x: index * step,
    // SVG y grows downward; the data does not.
    y: 100 - ((value - min) / span) * 100,
  }))
}

/**
 * A run of numbers at the size of a word — in a table cell, beside a figure, at
 * the end of a row.
 *
 * Deliberately axis-less, gridless and label-less: a sparkline answers "what
 * shape has this been", and every piece of chrome that would make it answer
 * "what value exactly" also makes it too big to sit inline, which was the only
 * reason to reach for it. When the exact value matters, print the number beside
 * it — `value` does — and when the trend needs reading precisely, it wants a
 * `<LineChart>` and its own space.
 *
 * No rendering engine: it is one `<path>` over a normalised viewBox, so it
 * costs nothing to put a hundred of them in a table.
 *
 * @example
 * <Sparkline label="Weekly signups" data={[12, 18, 9, 24, 30, 22, 41]} value="41" />
 */
export function Sparkline({
  data,
  label,
  variant = 'line',
  height = 28,
  domain,
  showLast = true,
  value,
  className,
}: SparklineProps) {
  const clean = data.filter((entry) => Number.isFinite(entry))
  const [min, max] = domain ?? [Math.min(...clean), Math.max(...clean)]
  const reading = value ?? clean.at(-1)?.toLocaleString()

  if (clean.length < 2) {
    return (
      <span className={cn('mono-meta text-(--ink-3-aa)', className)}>
        {label}: not enough data
      </span>
    )
  }

  const plotted = points(clean, min, max)
  const line = plotted.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')
  const last = plotted.at(-1)!

  return (
    <span className={cn('inline-flex w-full items-center gap-2', className)}>
      <svg
        role="img"
        aria-label={reading === undefined ? label : `${label}: ${reading}`}
        viewBox="0 0 100 100"
        // Not `xMidYMid`: the run has to fill the cell it is given, and a
        // sparkline's aspect ratio carries no meaning to preserve.
        preserveAspectRatio="none"
        height={height}
        className="min-w-0 flex-1 overflow-visible text-(--series-1)"
      >
        {variant === 'bars' ? (
          plotted.map((point, index) => {
            const width = 100 / (plotted.length * 1.6)
            return (
              <rect
                key={index}
                x={point.x - width / 2}
                y={point.y}
                width={width}
                height={Math.max(1, 100 - point.y)}
                fill="currentColor"
                // The bars carry the reading on their own; a wash would only
                // add a second, weaker version of it.
                fillOpacity={0.85}
              />
            )
          })
        ) : (
          <>
            {variant === 'area' && (
              <path
                d={`${line} L100,100 L0,100 Z`}
                fill="currentColor"
                fillOpacity="var(--chart-fill)"
              />
            )}
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              // The viewBox is stretched to the cell, so a stroke in user units
              // would be stretched with it. `non-scaling-stroke` is what keeps
              // the line the same weight in a narrow cell and a wide one.
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}
        {showLast && variant !== 'bars' && (
          <circle cx={last.x} cy={last.y} r={2} fill="currentColor" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      {value !== undefined && (
        <span className="shrink-0 font-mono text-xs tabular-nums text-(--ink)">{value}</span>
      )}
    </span>
  )
}

export default Sparkline
