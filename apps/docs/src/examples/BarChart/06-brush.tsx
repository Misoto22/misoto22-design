'use client'

import { BarChart, type ChartConfig } from '@misoto22/design/charts'

const data = Array.from({ length: 28 }, (_, index) => ({
  day: `D${index + 1}`,
  desktop: 90 + Math.round(Math.abs(Math.sin(index / 2)) * 180),
}))

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  return (
    <BarChart title="Visitors by day" config={config} data={data} xDataKey="day">
      <BarChart.Grid />
      <BarChart.XAxis dataKey="day" />
      <BarChart.Tooltip />
      <BarChart.Bar dataKey="desktop" variant="stripped" />
      <BarChart.Brush height={56} />
    </BarChart>
  )
}
