'use client'

import { Heatmap, type HeatmapCell } from '@misoto22/design/charts'

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
const TEAMS = ['Platform', 'Growth', 'Mobile', 'Data']

// A delta against target: negative and positive both matter, and zero is the
// page itself.
const cells: HeatmapCell[] = TEAMS.flatMap((row, team) =>
  WEEKS.map((column, week) => ({
    row,
    column,
    value: week === 3 && team === 2 ? null : Math.round(Math.sin(week + team * 1.7) * 40),
  })),
)

export function Example() {
  // Diverging reads DISTANCE from the midpoint, so both directions darken and
  // the middle of the scale is the surface. The missing reading is drawn as a
  // dashed outline rather than as the palest cell — a gap is not a zero.
  return (
    <Heatmap
      title="Weekly delta against target"
      showTitle
      description="Zero is the page; darker is further from target in either direction"
      columns={WEEKS}
      rows={TEAMS}
      cells={cells}
      scale="diverging"
      domain={[-40, 40]}
      showValues
    />
  )
}
