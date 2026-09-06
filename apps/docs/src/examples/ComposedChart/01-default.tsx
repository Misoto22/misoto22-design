'use client'

import { ComposedChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { month: 'Jan', revenue: 4200, profit: 1800 },
  { month: 'Feb', revenue: 5800, profit: 2400 },
  { month: 'Mar', revenue: 4100, profit: 1600 },
  { month: 'Apr', revenue: 6200, profit: 2800 },
  { month: 'May', revenue: 5400, profit: 2200 },
  { month: 'Jun', revenue: 7800, profit: 3400 },
]

const config = {
  revenue: { label: 'Revenue' },
  profit: { label: 'Profit' },
} satisfies ChartConfig

export function Example() {
  // One value axis, always. Two measures at different scales belong in two
  // charts or indexed to a common base — a second y-scale lets the author
  // choose where the lines cross, which is the single most misleading thing a
  // chart can do.
  return (
    <ComposedChart title="Revenue and profit" config={config} data={data} xDataKey="month">
      <ComposedChart.Grid />
      <ComposedChart.XAxis dataKey="month" />
      <ComposedChart.YAxis />
      <ComposedChart.Legend />
      <ComposedChart.Tooltip />
      <ComposedChart.Bar dataKey="revenue" />
      <ComposedChart.Line dataKey="profit" />
    </ComposedChart>
  )
}
