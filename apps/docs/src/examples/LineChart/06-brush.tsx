'use client'

import { LineChart, type ChartConfig } from '@misoto22/design/charts'

const data = Array.from({ length: 40 }, (_, index) => ({
  day: `D${index + 1}`,
  desktop: 160 + Math.round(Math.sin(index / 4) * 70),
  mobile: 90 + Math.round(Math.cos(index / 5) * 50),
}))

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

export function Example() {
  return (
    <LineChart title="Visitors per day" config={config} data={data} xDataKey="day">
      <LineChart.Grid />
      <LineChart.XAxis dataKey="day" />
      <LineChart.Legend />
      <LineChart.Tooltip />
      <LineChart.Line dataKey="desktop" />
      <LineChart.Line dataKey="mobile" strokeVariant="dashed" />
      <LineChart.Brush height={56} />
    </LineChart>
  )
}
