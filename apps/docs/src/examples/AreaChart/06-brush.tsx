'use client'

import { AreaChart, type ChartConfig } from '@misoto22/design/charts'

const data = Array.from({ length: 32 }, (_, index) => ({
  day: `D${index + 1}`,
  desktop: 140 + Math.round(Math.sin(index / 3) * 60) + index * 4,
}))

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  // The brush is a child, not a prop. Tab to a handle and the arrow keys step
  // it; Home and End jump to the ends. The shape this was ported from was
  // pointer-only.
  return (
    <AreaChart title="Visitors per day" config={config} data={data} xDataKey="day">
      <AreaChart.Grid />
      <AreaChart.XAxis dataKey="day" />
      <AreaChart.Tooltip />
      <AreaChart.Area dataKey="desktop" variant="gradient" />
      <AreaChart.Brush height={56} />
    </AreaChart>
  )
}
