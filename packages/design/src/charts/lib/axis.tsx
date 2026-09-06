'use client'

import { Label } from 'recharts'

/**
 * The name of what an axis measures, drawn beside it.
 *
 * The most-skipped part of a chart and one of the cheapest to get right: an
 * axis reading 0 · 100 · 200 says nothing about whether those are people,
 * milliseconds or dollars, and the reader is left inferring it from the title —
 * if there is one. Every serious charting system has this and most component
 * libraries leave it to the call site.
 *
 * Not always needed, which is why it is a prop rather than a requirement: when
 * the series' own label already carries the unit ("Load time (ms)"), a second
 * copy on the axis is noise. The rule is that the unit appears once.
 */
export function axisLabel(label: string | undefined, axis: 'x' | 'y') {
  if (!label) return null

  return (
    <Label
      value={label}
      // The vertical axis reads bottom-to-top, which is the convention every
      // print and screen tradition shares — and the only orientation that does
      // not force the reader to tilt their head the wrong way.
      angle={axis === 'y' ? -90 : 0}
      position={axis === 'y' ? 'insideLeft' : 'insideBottom'}
      offset={axis === 'y' ? 0 : -2}
      className="fill-(--chart-axis) text-[11px]"
      style={{ textAnchor: 'middle' }}
    />
  )
}
