'use client'

import { RadarChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { skill: 'Design', current: 86 },
  { skill: 'Research', current: 64 },
  { skill: 'Writing', current: 72 },
  { skill: 'Delivery', current: 91 },
  { skill: 'Review', current: 58 },
  { skill: 'Support', current: 77 },
]

const config = { current: { label: 'Current' } } satisfies ChartConfig

export function Example() {
  // A radar reads a SHAPE, not a set of values: the area it encloses depends on
  // the order its spokes happen to be in, so it is the wrong chart for
  // comparing magnitudes and the right one for recognising a silhouette.
  return (
    <RadarChart title="Team profile" config={config} data={data} angleDataKey="skill">
      <RadarChart.PolarGrid />
      <RadarChart.PolarAngleAxis dataKey="skill" />
      <RadarChart.Tooltip />
      <RadarChart.Radar dataKey="current">
        <RadarChart.Dot variant="border" />
      </RadarChart.Radar>
    </RadarChart>
  )
}
