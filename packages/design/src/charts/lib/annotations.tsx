'use client'

import type { ComponentProps, ReactNode } from 'react'
import {
  Label,
  ReferenceArea as RechartsReferenceArea,
  ReferenceDot as RechartsReferenceDot,
  ReferenceLine as RechartsReferenceLine,
  ZIndexLayer,
} from 'recharts'

/**
 * Where each annotation sits in the stack, and the numbers are not arbitrary:
 * they are the rule editorial charting settled on, expressed in Recharts' own
 * z-index scale (grid -100, area 100, bar 300, line 400, axis 500, dot 1200).
 *
 *   A BAND is context, so it goes behind everything — behind the data AND
 *   behind the grid. A band drawn over its own gridlines reads as a second
 *   surface rather than as a region of the first.
 *
 *   A LINE is a claim about the data — a target, a threshold, a limit — so it
 *   goes above the marks. A reference line hidden behind a bar is a reference
 *   nobody can check.
 *
 *   A TEXT annotation explains both, so it goes above both, and above the
 *   hover dot too. It is the last thing drawn because it is the last thing to
 *   be occluded.
 *
 * The decorative plate sits below the band, because a plate is not context —
 * it is wallpaper.
 */
export const ANNOTATION_LAYER = {
  plate: -300,
  band: -200,
  line: 450,
  text: 1500,
} as const

/** How much a reference mark insists. */
export type AnnotationWeight = 'quiet' | 'firm'

const STROKE: Record<AnnotationWeight, { width: number; dash?: string; color: string }> = {
  // A dashed hairline in the rule colour: present, and clearly not data.
  quiet: { width: 1, dash: '4 4', color: 'var(--chart-cursor)' },
  // Solid ink. For the one threshold the chart is actually about.
  firm: { width: 1.5, color: 'var(--ink)' },
}

export interface ReferenceLineProps {
  /** The value on the category axis. Give exactly one of `x` or `y`. */
  x?: string | number
  /** The value on the value axis. Give exactly one of `x` or `y`. */
  y?: string | number
  /** Printed at the end of the line. Keep it to a couple of words. */
  label?: string
  weight?: AnnotationWeight
  /** Where the label sits. Defaults to the line's far end. */
  labelPosition?: ComponentProps<typeof Label>['position']
  referenceLineProps?: ComponentProps<typeof RechartsReferenceLine>
}

/**
 * A target, a threshold, a limit, a budget — one number the data is being read
 * against.
 *
 * Worth reaching for more often than it is: most charts that look like they
 * need a second series actually need this. "Are we above the line" is a
 * question a reference line answers at a glance and a second series does not.
 *
 * @example
 * <LineChart.ReferenceLine y={250} label="Target" weight="firm" />
 */
export function ReferenceLine({
  x,
  y,
  label,
  weight = 'quiet',
  labelPosition,
  referenceLineProps,
}: ReferenceLineProps) {
  const stroke = STROKE[weight]
  const horizontal = y !== undefined

  return (
    <ZIndexLayer zIndex={ANNOTATION_LAYER.line}>
      <RechartsReferenceLine
        x={x}
        y={y}
        stroke={stroke.color}
        strokeWidth={stroke.width}
        strokeDasharray={stroke.dash}
        // Clamped rather than dropped: a target above every value is exactly
        // the case a reader most needs to see, and `ifOverflow="discard"`
        // would silently remove it.
        ifOverflow="extendDomain"
        {...referenceLineProps}
      >
        {label && (
          <Label
            value={label}
            position={labelPosition ?? (horizontal ? 'insideTopRight' : 'insideTopLeft')}
            className="fill-(--ink-2) text-[11px]"
          />
        )}
      </RechartsReferenceLine>
    </ZIndexLayer>
  )
}

export interface ReferenceBandProps {
  /** A span on the category axis, as `[from, to]`. */
  x?: [string | number, string | number]
  /** A span on the value axis, as `[from, to]`. */
  y?: [string | number, string | number]
  /** Printed inside the band's top edge. */
  label?: string
  referenceAreaProps?: ComponentProps<typeof RechartsReferenceArea>
}

/**
 * A region the data is read against — a healthy range, a recession, a period
 * the numbers should not be trusted for.
 *
 * Drawn behind the grid, so it reads as a stretch of the ground rather than as
 * a mark on it. That placement is the whole difference between "this period"
 * and "this value".
 *
 * @example
 * <AreaChart.ReferenceBand x={['Mar', 'May']} label="Migration" />
 */
export function ReferenceBand({ x, y, label, referenceAreaProps }: ReferenceBandProps) {
  return (
    <ZIndexLayer zIndex={ANNOTATION_LAYER.band}>
      <RechartsReferenceArea
        x1={x?.[0]}
        x2={x?.[1]}
        y1={y?.[0]}
        y2={y?.[1]}
        fill="var(--ink)"
        // Deliberately fainter than a data fill: the band is the ground the
        // data is read against, and a ground that competes stops being one.
        fillOpacity="calc(var(--chart-fill) * 0.4)"
        stroke="none"
        ifOverflow="extendDomain"
        {...referenceAreaProps}
      >
        {label && (
          <Label value={label} position="insideTopLeft" className="fill-(--ink-3-aa) text-[11px]" />
        )}
      </RechartsReferenceArea>
    </ZIndexLayer>
  )
}

export interface AnnotationProps {
  /** Where on the category axis the note points. */
  x?: string | number
  /** Where on the value axis the note points. */
  y?: number
  /** The note itself. One short sentence at most. */
  text: ReactNode
  /** Draws a dot at the anchor, for when the note sits away from its point. */
  showAnchor?: boolean
  position?: ComponentProps<typeof Label>['position']
  referenceDotProps?: ComponentProps<typeof RechartsReferenceDot>
}

/**
 * A note on the plot — what happened here, and why the shape changed.
 *
 * The part of a chart that most often does the actual explaining, and the part
 * almost no component library ships. A reader who is told "deploy freeze"
 * beside the flat stretch does not have to guess, and no amount of axis work
 * substitutes for that sentence.
 *
 * @example
 * <LineChart.Annotation x="Apr" y={280} text="Pricing change" showAnchor />
 */
export function Annotation({
  x,
  y,
  text,
  showAnchor = false,
  position = 'top',
  referenceDotProps,
}: AnnotationProps) {
  return (
    <ZIndexLayer zIndex={ANNOTATION_LAYER.text}>
      <RechartsReferenceDot
        x={x}
        y={y}
        r={showAnchor ? 3 : 0}
        fill={showAnchor ? 'var(--ink)' : 'none'}
        stroke={showAnchor ? 'var(--chart-surface)' : 'none'}
        strokeWidth={showAnchor ? 1.5 : 0}
        ifOverflow="extendDomain"
        {...referenceDotProps}
      >
        <Label value={String(text)} position={position} className="fill-(--ink) text-[11px]" />
      </RechartsReferenceDot>
    </ZIndexLayer>
  )
}
