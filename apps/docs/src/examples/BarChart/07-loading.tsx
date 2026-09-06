'use client'

import { BarChart, type ChartConfig } from '@misoto22/design/charts'

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  return (
    <BarChart title="Visitors by month" config={config} data={[]} isLoading loadingBars={10}>
      <BarChart.Grid />
      <BarChart.Bar dataKey="desktop" />
    </BarChart>
  )
}
