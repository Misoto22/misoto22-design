'use client'

import { AreaChart, type ChartConfig } from '@misoto22/design/charts'

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  // The skeleton's rows are seeded rather than random, so the server and the
  // client render the same shape and a loading chart does not log a hydration
  // mismatch. Under prefers-reduced-motion the travelling highlight is replaced
  // by a flat wash.
  return (
    <AreaChart title="Visitors per month" config={config} data={[]} isLoading>
      <AreaChart.Grid />
      <AreaChart.Area dataKey="desktop" />
    </AreaChart>
  )
}
