'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { LineChart, type ChartConfig, type ChartLegendVariant } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 273, mobile: 190 },
]

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

const VARIANTS: ChartLegendVariant[] = [
  'square',
  'circle',
  'circle-outline',
  'rounded-square',
  'rounded-square-outline',
  'vertical-bar',
  'horizontal-bar',
]

export function Example() {
  const [variant, setVariant] = useState<ChartLegendVariant>('rounded-square')

  // Seven swatch shapes, and the mark is doing more work here than in a
  // chromatic system: a bar-shaped swatch beside a bar chart ties the key to
  // the plot faster than a dot would.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(next) => next && setVariant(next as ChartLegendVariant)}
        aria-label="Legend swatch"
      >
        {VARIANTS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <LineChart title="Visitors per month" config={config} data={data}>
        <LineChart.Grid />
        <LineChart.XAxis dataKey="month" />
        <LineChart.Legend variant={variant} />
        <LineChart.Tooltip />
        <LineChart.Line dataKey="desktop" />
        <LineChart.Line dataKey="mobile" strokeVariant="dashed" />
      </LineChart>
    </div>
  )
}
