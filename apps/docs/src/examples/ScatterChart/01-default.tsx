'use client'

import { ScatterChart, type ChartConfig } from '@misoto22/design/charts'

const desktop = [
  { kb: 120, ms: 340 },
  { kb: 180, ms: 412 },
  { kb: 240, ms: 505 },
  { kb: 310, ms: 618 },
  { kb: 360, ms: 660 },
  { kb: 420, ms: 790 },
  { kb: 470, ms: 812 },
]

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  // The only chart here whose x axis is a NUMBER rather than a category, which
  // is the point: correlation, clustering and outliers are the questions that
  // do not survive being bucketed into a bar.
  return (
    <ScatterChart
      title="Load time against bundle size"
      config={config}
      table={{
        rows: desktop,
        rowKey: 'kb',
        columns: [{ key: 'ms', label: 'Load (ms)' }],
      }}
    >
      <ScatterChart.Grid />
      <ScatterChart.XAxis dataKey="kb" name="Bundle" unit=" kB" />
      <ScatterChart.YAxis dataKey="ms" name="Load" unit=" ms" />
      <ScatterChart.Tooltip />
      <ScatterChart.Scatter dataKey="desktop" data={desktop} />
    </ScatterChart>
  )
}
