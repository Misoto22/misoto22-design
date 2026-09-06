'use client'

import { RadarChart, type ChartConfig } from '@misoto22/design/charts'

const config = { current: { label: 'Current' } } satisfies ChartConfig

export function Example() {
  // The skeleton morphs between shapes rather than shimmering — a radar has no
  // axis for a travelling highlight to run along.
  return (
    <RadarChart title="Team profile" config={config} data={[]} isLoading>
      <RadarChart.PolarGrid />
      <RadarChart.Radar dataKey="current" />
    </RadarChart>
  )
}
