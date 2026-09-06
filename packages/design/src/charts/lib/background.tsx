'use client'

import { useId, type FC } from 'react'
import { ZIndexLayer, usePlotArea } from 'recharts'

/**
 * The decorative plate behind a plot.
 *
 * Eleven, and the count is the point: with hue spent, a chart's personality has
 * to come from somewhere, and a plate is the one place texture can be loud
 * without competing with the marks — it sits behind them, at a fraction of the
 * rule's weight, under a mask that dissolves it before it reaches an axis.
 *
 * To add one: extend this union, write the `<pattern>`, register it in
 * `PATTERNS`. The union is what makes a missing registration a type error.
 */
export type ChartBackgroundVariant =
  | 'dots'
  | 'grid'
  | 'cross-hatch'
  | 'diagonal-lines'
  | 'plus'
  | 'falling-triangles'
  | '4-pointed-star'
  | 'tiny-checkers'
  | 'overlapping-circles'
  | 'wiggle-lines'
  | 'bubbles'

interface PatternProps {
  id: string
}

/** Every pattern paints in `currentColor`, which the layer sets to the token. */
const Dots: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="1" fill="currentColor" />
  </pattern>
)

const Grid: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
  </pattern>
)

const CrossHatch: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <path
      d="M 0 0 L 20 20 M 20 0 L 0 20"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.6"
      strokeWidth="0.5"
    />
  </pattern>
)

const DiagonalLines: FC<PatternProps> = ({ id }) => (
  <pattern
    id={id}
    x="0"
    y="0"
    width="6"
    height="6"
    patternUnits="userSpaceOnUse"
    patternTransform="rotate(45)"
  >
    <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.5" />
  </pattern>
)

const Plus: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
    <path
      d="M 8 4 L 8 12 M 4 8 L 12 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
    />
  </pattern>
)

const FallingTriangles: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="18" height="36" patternUnits="userSpaceOnUse">
    <path
      d="M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z"
      transform="scale(0.5)"
      fill="currentColor"
      fillOpacity="0.4"
    />
  </pattern>
)

const FourPointedStar: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
    <polygon
      fillRule="evenodd"
      points="5 3 8 4 5 5 4 8 3 5 0 4 3 3 4 0 5 3"
      fill="currentColor"
      fillOpacity="0.4"
    />
  </pattern>
)

const TinyCheckers: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
    <path
      fillRule="evenodd"
      d="M0 0h4v4H0V0zm4 4h4v4H4V4z"
      fill="currentColor"
      fillOpacity="0.2"
    />
  </pattern>
)

const OverlappingCircles: FC<PatternProps> = ({ id }) => (
  <pattern id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
    <path
      fillRule="evenodd"
      d="M25 25c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5s-5-2.238-5-5 2.238-5 5-5zM5 5c0-2.762 2.238-5 5-5s5 2.238 5 5-2.238 5-5 5c0 2.762-2.238 5-5 5S0 12.762 0 10s2.238-5 5-5zm5 4c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm20 20c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4z"
      fill="currentColor"
      fillOpacity="0.4"
    />
  </pattern>
)

const WiggleLines: FC<PatternProps> = ({ id }) => (
  <pattern
    id={id}
    x="0"
    y="0"
    width="52"
    height="26"
    patternUnits="userSpaceOnUse"
    patternTransform="scale(0.6)"
  >
    <path
      d="M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z"
      fill="currentColor"
      fillOpacity="0.4"
    />
  </pattern>
)

const Bubbles: FC<PatternProps> = ({ id }) => (
  <pattern
    id={id}
    x="0"
    y="0"
    width="100"
    height="100"
    patternUnits="userSpaceOnUse"
    patternTransform="scale(0.6667)"
  >
    <path
      d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z"
      fill="currentColor"
      fillOpacity="0.4"
      fillRule="evenodd"
    />
  </pattern>
)

const PATTERNS: Record<ChartBackgroundVariant, FC<PatternProps>> = {
  dots: Dots,
  grid: Grid,
  plus: Plus,
  bubbles: Bubbles,
  'cross-hatch': CrossHatch,
  'diagonal-lines': DiagonalLines,
  'falling-triangles': FallingTriangles,
  '4-pointed-star': FourPointedStar,
  'tiny-checkers': TinyCheckers,
  'overlapping-circles': OverlappingCircles,
  'wiggle-lines': WiggleLines,
}

export interface ChartBackgroundProps {
  variant: ChartBackgroundVariant
}

/**
 * Renders the plate under the plot. Compose it inside any cartesian chart:
 * `<LineChart.Background variant="dots" />`.
 *
 * `ZIndexLayer` at -1 is what keeps it behind the marks — SVG paints in
 * document order, so without it the plate would depend on where the consumer
 * happened to write the element.
 *
 * The plate is masked by a blurred inset rectangle, which is why it fades out
 * before it reaches the axes instead of stopping at a hard edge against them.
 * The blur is on a MASK, not on the artwork: nothing in the system draws a
 * blurred mark.
 */
export function ChartBackground({ variant }: ChartBackgroundProps) {
  const base = useId().replace(/:/g, '')
  const patternId = `${base}-bg-${variant}`
  const maskId = `${base}-bg-fade`
  const blurId = `${base}-bg-blur`
  const Pattern = PATTERNS[variant]
  const plot = usePlotArea()

  // Nothing to sit behind until the chart has measured itself.
  if (!plot || plot.width <= 0 || plot.height <= 0) return null

  // The plate is drawn to the PLOT rectangle, not to the whole SVG.
  //
  // Recharts puts the axes inside the same `<svg>`, so a plate sized to the
  // surface runs underneath the tick labels — which is how a row of month names
  // ended up sitting on a field of dots with nothing between them. Bounding it
  // to the plot means the pattern stops where the data stops, whatever the axis
  // ends up needing.
  const inset = Math.min(plot.width, plot.height) * 0.06
  const blur = Math.max(8, Math.min(plot.width, plot.height) * 0.08)

  return (
    <ZIndexLayer zIndex={-1}>
      <defs>
        <Pattern id={patternId} />
        <filter id={blurId}>
          <feGaussianBlur stdDeviation={blur} />
        </filter>
        {/* A blurred inset rectangle, so the plate dissolves before it reaches
            the plot's own edges rather than stopping against them. The blur is
            on the MASK; nothing in the system draws a blurred mark. */}
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect
            x={plot.x + inset}
            y={plot.y + inset}
            width={Math.max(0, plot.width - inset * 2)}
            height={Math.max(0, plot.height - inset * 2)}
            fill="white"
            filter={`url(#${blurId})`}
          />
        </mask>
      </defs>
      <rect
        className="text-(--chart-pattern)"
        x={plot.x}
        y={plot.y}
        width={plot.width}
        height={plot.height}
        fill={`url(#${patternId})`}
        mask={`url(#${maskId})`}
      />
    </ZIndexLayer>
  )
}
