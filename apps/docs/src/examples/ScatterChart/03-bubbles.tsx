'use client'

import { ScatterChart, type ChartConfig } from '@misoto22/design/charts'

const releases = [
  { kb: 120, ms: 340, downloads: 400 },
  { kb: 180, ms: 412, downloads: 1200 },
  { kb: 240, ms: 505, downloads: 260 },
  { kb: 310, ms: 618, downloads: 2400 },
  { kb: 420, ms: 790, downloads: 900 },
]

const config = { releases: { label: 'Releases' } } satisfies ChartConfig

export function Example() {
  // A third measure, mapped to each mark's AREA rather than its radius.
  // Doubling a radius quadruples the ink, so a radius mapping makes a value
  // twice as large read as four times as large — the classic bubble-chart lie.
  return (
    <ScatterChart
      title="Load time, bundle size and downloads"
      config={config}
      table={{
        rows: releases,
        rowKey: 'kb',
        columns: [
          { key: 'ms', label: 'Load (ms)' },
          { key: 'downloads', label: 'Downloads' },
        ],
      }}
    >
      <ScatterChart.Grid />
      <ScatterChart.XAxis dataKey="kb" name="Bundle" unit=" kB" />
      <ScatterChart.YAxis dataKey="ms" name="Load" unit=" ms" />
      <ScatterChart.ZAxis dataKey="downloads" name="Downloads" range={[60, 900]} />
      <ScatterChart.Tooltip />
      <ScatterChart.Scatter dataKey="releases" data={releases} variant="outline" />
    </ScatterChart>
  )
}
