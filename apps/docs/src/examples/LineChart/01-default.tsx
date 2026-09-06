'use client'

import { LineChart, type ChartConfig } from '@misoto22/design/charts'

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
  // A line chart has no fill variant to offer, on purpose: filling four
  // overlapping series makes "compare these against each other" unanswerable,
  // and that is the only question a line chart exists for.
  return (
    <LineChart title="Visitors per month" config={config} data={data} xDataKey="month">
      <LineChart.Grid />
      <LineChart.XAxis dataKey="month" />
      <LineChart.YAxis />
      <LineChart.Legend />
      <LineChart.Tooltip />
      <LineChart.Line dataKey="desktop" />
      <LineChart.Line dataKey="mobile" strokeVariant="dashed" />
    </LineChart>
  )
}
