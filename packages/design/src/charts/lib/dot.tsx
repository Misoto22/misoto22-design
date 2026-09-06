import { memo, useId } from 'react'
import { cn } from '../../lib/cn'

/** How a point marker is drawn on a line or an area. */
export type ChartDotVariant = 'default' | 'border' | 'colored-border'

export interface ChartDotProps {
  cx?: number
  cy?: number
  /** The series this dot belongs to — it picks up that series' gradient. */
  dataKey: string
  /** The owning mark's id, which scopes its gradient. */
  chartId: string
  className?: string
  fillOpacity?: number
  variant?: ChartDotVariant
  /** The intro wipe's mask, so a resting dot reveals with its own line. */
  maskId?: string
}

/**
 * A point marker painted from its series' gradient rather than from a flat
 * colour.
 *
 * The trick each variant shares: a full-width rect filled with the series
 * gradient, clipped to a circle. Filling the circle directly would restart the
 * gradient inside the dot's own bounding box, so every dot on a line would be
 * the same colour instead of sampling the gradient at the x it sits on.
 */
export const ChartDot = memo(function ChartDot({
  cx,
  cy,
  dataKey,
  chartId,
  className,
  fillOpacity = 1,
  variant = 'default',
  maskId,
}: ChartDotProps) {
  const dotId = useId().replace(/:/g, '')

  if (cx === undefined || cy === undefined) return null

  const paint = `url(#${chartId}-colors-${dataKey})`
  const mask = maskId ? `url(#${maskId})` : undefined

  if (variant === 'border') {
    // A wide ground ring in the page colour, so the dot reads as sitting on top
    // of the line rather than being a bulge in it.
    const r = 6
    const inner = r - 2.5
    return (
      <g className={cn('text-(--chart-surface)', className)} mask={mask}>
        <defs>
          <clipPath id={`dot-${dotId}`}>
            <circle cx={cx} cy={cy} r={inner} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="currentColor" />
        <rect
          x="0"
          y={cy - inner}
          width="100%"
          height={inner * 2}
          fill={paint}
          fillOpacity={fillOpacity}
          clipPath={`url(#dot-${dotId})`}
        />
      </g>
    )
  }

  if (variant === 'colored-border') {
    const r = 3
    const stroke = 1
    return (
      <g className={cn('text-(--chart-surface)', className)} mask={mask}>
        <defs>
          <clipPath id={`dot-${dotId}`}>
            <circle cx={cx} cy={cy} r={r + stroke / 2} />
          </clipPath>
        </defs>
        <rect
          x="0"
          y={cy - r - stroke / 2}
          width="100%"
          height={(r + stroke / 2) * 2}
          fill={paint}
          fillOpacity={fillOpacity}
          clipPath={`url(#dot-${dotId})`}
        />
        <circle cx={cx} cy={cy} r={r - stroke / 2} fill="currentColor" />
      </g>
    )
  }

  const r = 3
  return (
    <g className={className} mask={mask}>
      <defs>
        <clipPath id={`dot-${dotId}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <rect
        x="0"
        y={cy - r}
        width="100%"
        height={r * 2}
        fill={paint}
        fillOpacity={fillOpacity}
        clipPath={`url(#dot-${dotId})`}
      />
    </g>
  )
})
