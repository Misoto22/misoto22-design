'use client'

import { Heatmap, type HeatmapCell } from '@misoto22/design/charts'

const HOURS = ['00', '03', '06', '09', '12', '15', '18', '21']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// A weekday-shaped load: quiet at night, two peaks, and a flat weekend.
const cells: HeatmapCell[] = DAYS.flatMap((row, day) =>
  HOURS.map((column, hour) => {
    const weekend = day >= 5
    const shape = Math.max(0, Math.sin(((hour - 1) / HOURS.length) * Math.PI))
    return {
      row,
      column,
      value: Math.round(shape * (weekend ? 18 : 64) + (weekend ? 2 : 8)),
    }
  }),
)

export function Example() {
  // A heatmap needs a scale whose order the eye can read without consulting a
  // legend, and lightness is the only channel that is unambiguously ordered.
  // Here there is no hue left to get wrong.
  return (
    <Heatmap
      title="Commits by weekday and hour"
      showTitle
      description="Darker is busier"
      columns={HOURS}
      rows={DAYS}
      cells={cells}
    />
  )
}
