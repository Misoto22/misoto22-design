'use client'

import { AreaChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 273, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 314, mobile: 240 },
]

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

export function Example() {
  // Two series, two textures. In the monochrome default the FILL is what tells
  // them apart and the grey ramp supports it — which is also what survives a
  // greyscale print and a colour-blind reader.
  return (
    <AreaChart title="Visitors per month" config={config} data={data} xDataKey="month">
      <AreaChart.Grid />
      <AreaChart.XAxis dataKey="month" />
      <AreaChart.YAxis />
      <AreaChart.Legend />
      <AreaChart.Tooltip />
      <AreaChart.Area dataKey="desktop" />
      <AreaChart.Area dataKey="mobile" variant="hatched" />
    </AreaChart>
  )
}
