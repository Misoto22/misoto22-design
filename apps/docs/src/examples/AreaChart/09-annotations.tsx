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
  // Three layers, drawn in the order editorial charting settled on: the BAND
  // is context and sits behind the grid, the LINE is a claim about the data
  // and sits above the marks, and the NOTE explains both and sits above
  // everything. Most charts that look like they need a second series need a
  // reference line instead.
  return (
    <AreaChart title="Visitors per month" config={config} data={data} xDataKey="month">
      <AreaChart.Grid />
      <AreaChart.XAxis dataKey="month" />
      <AreaChart.YAxis label="Visitors" />
      <AreaChart.Tooltip />

      <AreaChart.ReferenceBand x={['Mar', 'Apr']} label="Migration" />
      <AreaChart.ReferenceLine y={250} label="Target" weight="firm" />
      <AreaChart.Annotation x="Mar" y={148} text="Deploy freeze" showAnchor />

      <AreaChart.Area dataKey="desktop" variant="solid" />
    </AreaChart>
  )
}
