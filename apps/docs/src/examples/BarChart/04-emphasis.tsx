'use client'

import { BarChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { month: 'Jan', desktop: 186 },
  { month: 'Feb', desktop: 305 },
  { month: 'Mar', desktop: 237 },
  { month: 'Apr', desktop: 273 },
  { month: 'May', desktop: 209 },
  { month: 'Jun', desktop: 314 },
]

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  // Three ways to say "this one". A monochrome chart has no "brighter" to reach
  // for, so the halo does that job; `buffer` says a period is still open; and
  // hover-highlight dims everything the pointer is not on.
  return (
    <div className="grid w-full gap-8 lg:grid-cols-3">
      <BarChart title="Glowing" showTitle config={config} data={data}>
        <BarChart.XAxis dataKey="month" />
        <BarChart.Bar dataKey="desktop" glowing />
      </BarChart>

      <BarChart title="Buffer — the last period is still open" showTitle config={config} data={data}>
        <BarChart.XAxis dataKey="month" />
        <BarChart.Bar dataKey="desktop" buffer />
      </BarChart>

      <BarChart title="Hover highlight" showTitle config={config} data={data}>
        <BarChart.XAxis dataKey="month" />
        <BarChart.Tooltip />
        <BarChart.Bar dataKey="desktop" variant="stripped" enableHoverHighlight />
      </BarChart>
    </div>
  )
}
