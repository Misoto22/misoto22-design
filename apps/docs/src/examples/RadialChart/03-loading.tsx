'use client'

import { RadialChart, type ChartConfig } from '@misoto22/design/charts'

const config = { documents: { label: 'Documents' } } satisfies ChartConfig

export function Example() {
  return (
    <RadialChart title="Storage used by tier" config={config} data={[]} nameKey="tier" isLoading>
      <RadialChart.RadialBar dataKey="used" />
    </RadialChart>
  )
}
