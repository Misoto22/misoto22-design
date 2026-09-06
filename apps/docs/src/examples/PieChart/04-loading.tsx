'use client'

import { PieChart, type ChartConfig } from '@misoto22/design/charts'

const config = { chrome: { label: 'Chrome' } } satisfies ChartConfig

export function Example() {
  // The wedges pulse on a stagger, so the wave travels round the pie. Under
  // prefers-reduced-motion they hold at a flat mid-opacity instead.
  return (
    <PieChart
      title="Visitors by browser"
      config={config}
      data={[]}
      dataKey="visitors"
      nameKey="browser"
      isLoading
    >
      <PieChart.Pie innerRadius="50%" />
    </PieChart>
  )
}
