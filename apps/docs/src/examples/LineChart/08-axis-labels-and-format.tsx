'use client'

import { LineChart, formatNumber, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { week: 'W1', p95: 1.42, spend: 4210 },
  { week: 'W2', p95: 1.61, spend: 5180 },
  { week: 'W3', p95: 2.04, spend: 4890 },
  { week: 'W4', p95: 1.88, spend: 6320 },
  { week: 'W5', p95: 1.34, spend: 7010 },
]

const latency = { p95: { label: 'p95 latency' } } satisfies ChartConfig
const spend = { spend: { label: 'Ad spend' } } satisfies ChartConfig

export function Example() {
  // An axis reading 0 · 100 · 200 says nothing about whether those are people,
  // milliseconds or dollars. Name it once — on the axis, or in the series
  // label, but once.
  return (
    <div className="grid w-full gap-8 lg:grid-cols-2">
      <LineChart title="p95 latency" showTitle config={latency} data={data}>
        <LineChart.Grid />
        <LineChart.XAxis dataKey="week" />
        <LineChart.YAxis
          label="Latency"
          tickFormatter={formatNumber({ style: 'duration' })}
          width={56}
        />
        <LineChart.Tooltip />
        <LineChart.Line dataKey="p95" />
      </LineChart>

      <LineChart title="Ad spend" showTitle config={spend} data={data}>
        <LineChart.Grid />
        <LineChart.XAxis dataKey="week" />
        <LineChart.YAxis
          tickFormatter={formatNumber({ style: 'currency', currency: 'AUD', fractionDigits: 0 })}
          width={72}
        />
        <LineChart.Tooltip />
        <LineChart.Line dataKey="spend" strokeVariant="dashed" />
      </LineChart>
    </div>
  )
}
