'use client'

import { LineChart, type ChartConfig } from '@misoto22/design/charts'

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  return (
    <LineChart title="Visitors per month" config={config} data={[]} isLoading>
      <LineChart.Grid />
      <LineChart.Line dataKey="desktop" />
    </LineChart>
  )
}
