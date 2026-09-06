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
  return (
    <div className="grid w-full gap-8 lg:grid-cols-2">
      <LineChart title="Glowing — one series is the point" showTitle config={config} data={data}>
        <LineChart.Grid />
        <LineChart.XAxis dataKey="month" />
        <LineChart.Line dataKey="desktop" glowing />
        <LineChart.Line dataKey="mobile" strokeVariant="dashed" />
      </LineChart>

      {/* The last segment is dashed by measuring the real path length, so the
          split lands exactly on the second-to-last point at any curve type —
          which an arithmetic dasharray cannot do. */}
      <LineChart title="Buffer — the last leg is a projection" showTitle config={config} data={data}>
        <LineChart.Grid />
        <LineChart.XAxis dataKey="month" />
        <LineChart.Line dataKey="desktop" buffer />
      </LineChart>
    </div>
  )
}
