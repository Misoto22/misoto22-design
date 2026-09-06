'use client'

import { BarChart, type ChartConfig } from '@misoto22/design/charts'

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
  return (
    <BarChart title="Visitors by month" config={config} data={data} xDataKey="month">
      <BarChart.Grid />
      <BarChart.XAxis dataKey="month" />
      <BarChart.YAxis />
      <BarChart.Legend />
      <BarChart.Tooltip />
      <BarChart.Bar dataKey="desktop" />
      <BarChart.Bar dataKey="mobile" variant="hatched" />
    </BarChart>
  )
}
