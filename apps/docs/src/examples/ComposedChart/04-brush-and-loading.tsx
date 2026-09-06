'use client'

import { ComposedChart, type ChartConfig } from '@misoto22/design/charts'

const data = Array.from({ length: 30 }, (_, index) => ({
  day: `D${index + 1}`,
  revenue: 3200 + Math.round(Math.abs(Math.sin(index / 3)) * 3600),
  profit: 900 + Math.round(Math.abs(Math.cos(index / 4)) * 1800),
}))

const config = {
  revenue: { label: 'Revenue' },
  profit: { label: 'Profit' },
} satisfies ChartConfig

export function Example() {
  return (
    <div className="grid w-full gap-8 lg:grid-cols-2">
      <ComposedChart title="Revenue and profit" showTitle config={config} data={data} xDataKey="day">
        <ComposedChart.Grid />
        <ComposedChart.XAxis dataKey="day" />
        <ComposedChart.Tooltip />
        <ComposedChart.Bar dataKey="revenue" variant="stripped" />
        <ComposedChart.Line dataKey="profit" />
        <ComposedChart.Brush height={48} />
      </ComposedChart>

      <ComposedChart title="Loading" showTitle config={config} data={[]} isLoading>
        <ComposedChart.Grid />
        <ComposedChart.Bar dataKey="revenue" />
      </ComposedChart>
    </div>
  )
}
