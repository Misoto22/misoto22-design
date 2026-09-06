'use client'

import { PieChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
]

const config = {
  chrome: { label: 'Chrome' },
  safari: { label: 'Safari' },
  firefox: { label: 'Firefox' },
  edge: { label: 'Edge' },
} satisfies ChartConfig

export function Example() {
  return (
    <div className="grid w-full gap-8 lg:grid-cols-2">
      {/* Worth reaching for: a pie's whole weakness is that an angle is hard to
          read, and a printed number removes the guess entirely. */}
      <PieChart
        title="Labelled"
        showTitle
        config={config}
        data={data}
        dataKey="visitors"
        nameKey="browser"
      >
        <PieChart.Pie innerRadius="45%">
          <PieChart.Label />
        </PieChart.Pie>
        <PieChart.Legend />
      </PieChart>

      <PieChart
        title="One wedge is the point"
        showTitle
        config={config}
        data={data}
        dataKey="visitors"
        nameKey="browser"
      >
        <PieChart.Background variant="overlapping-circles" />
        <PieChart.Pie innerRadius="50%" glowingSectors={['chrome']} isClickable />
        <PieChart.Tooltip />
        <PieChart.Legend isClickable />
      </PieChart>
    </div>
  )
}
