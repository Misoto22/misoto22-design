'use client'

import { AreaChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { month: 'Jan', desktop: 186 },
  { month: 'Feb', desktop: 305 },
  { month: 'Mar', desktop: 148 },
  { month: 'Apr', desktop: 162 },
  { month: 'May', desktop: 289 },
  { month: 'Jun', desktop: 341 },
]

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  // The hidden table hands a screen-reader user every number, which is access
  // but not a SHAPE — six figures read one at a time do not say that March
  // dipped. A run of tones does, in under two seconds.
  //
  // The control announces the count and the range before the first note, so
  // the melody is a measurement rather than a contour, and nothing ever plays
  // until someone presses it.
  return (
    <AreaChart title="Visitors per month" config={config} data={data} xDataKey="month">
      <AreaChart.Sonify />
      <AreaChart.Grid />
      <AreaChart.XAxis dataKey="month" />
      <AreaChart.YAxis label="Visitors" />
      <AreaChart.Tooltip />
      <AreaChart.Area dataKey="desktop" variant="gradient" />
    </AreaChart>
  )
}
