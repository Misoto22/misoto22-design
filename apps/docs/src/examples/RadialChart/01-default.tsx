'use client'

import { RadialChart, type ChartConfig } from '@misoto22/design/charts'

const data = [
  { tier: 'documents', used: 72 },
  { tier: 'photos', used: 54 },
  { tier: 'backups', used: 31 },
]

const config = {
  documents: { label: 'Documents' },
  photos: { label: 'Photos' },
  backups: { label: 'Backups' },
} satisfies ChartConfig

export function Example() {
  // A radial bar's LENGTH is its value but its RADIUS is not, so an inner and
  // an outer bar of the same value are drawn different lengths. Past about four
  // bars a BarChart is the honest choice.
  return (
    <RadialChart
      title="Storage used by tier"
      config={config}
      data={data}
      nameKey="tier"
      valueKey="used"
    >
      <RadialChart.RadialBar dataKey="used" isClickable />
      <RadialChart.Tooltip />
      <RadialChart.Legend isClickable />
    </RadialChart>
  )
}
