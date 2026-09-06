'use client'

import { PieChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
]

const config = {
  chrome: { label: 'Chrome' },
  safari: { label: 'Safari' },
  firefox: { label: 'Firefox' },
  edge: { label: 'Edge' },
  other: { label: 'Other' },
} satisfies ChartConfig

export function Example() {
  // A pie answers "roughly what share" and nothing more precise. Past about
  // five wedges — which is exactly this many — a BarChart answers the same
  // question better.
  return (
    <PieChart
      title="Visitors by browser"
      config={config}
      data={data}
      dataKey="visitors"
      nameKey="browser"
    >
      <PieChart.Pie />
      <PieChart.Tooltip />
      <PieChart.Legend />
    </PieChart>
  )
}
