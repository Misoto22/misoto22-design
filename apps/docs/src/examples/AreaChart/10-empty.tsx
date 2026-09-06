'use client'

import { AreaChart, type ChartConfig } from '@misoto22/design/charts'

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  // The state a real dashboard reaches within a week — a filter that matches
  // nothing — and the one an empty pair of axes is indistinguishable from a
  // failed load. The figure keeps its name, so the page still says what is
  // missing.
  return (
    <AreaChart
      title="Visitors per month"
      config={config}
      data={[]}
      empty={{
        title: 'No visits in this range',
        description: 'This project had no traffic before March. Try a wider range.',
      }}
    >
      <AreaChart.Grid />
      <AreaChart.Area dataKey="desktop" />
    </AreaChart>
  )
}
