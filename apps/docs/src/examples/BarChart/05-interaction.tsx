'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import {
  BarChart,
  type ChartConfig,
  type ChartTooltipRoundness,
  type ChartTooltipVariant,
} from '@misoto22/design/charts'
import { Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 273, mobile: 190 },
]

// A config entry can carry an icon, which the legend and the tooltip draw in
// place of the swatch. The label still does the naming; the icon is decoration.
const config = {
  desktop: { label: 'Desktop', icon: Monitor },
  mobile: { label: 'Mobile', icon: Smartphone },
} satisfies ChartConfig

const VARIANTS: ChartTooltipVariant[] = ['solid', 'frosted']
const ROUNDNESS: ChartTooltipRoundness[] = ['sm', 'md', 'lg']

export function Example() {
  const [variant, setVariant] = useState<ChartTooltipVariant>('solid')
  const [roundness, setRoundness] = useState<ChartTooltipRoundness>('lg')

  // The legend entries are real buttons with aria-pressed — Tab reaches them
  // and Enter toggles the series, which a styled div could not do.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          type="single"
          value={variant}
          onValueChange={(next) => next && setVariant(next as ChartTooltipVariant)}
          aria-label="Tooltip ground"
        >
          {VARIANTS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={roundness}
          onValueChange={(next) => next && setRoundness(next as ChartTooltipRoundness)}
          aria-label="Tooltip corner"
        >
          {ROUNDNESS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <BarChart title="Visitors by month" config={config} data={data}>
        <BarChart.Grid />
        <BarChart.XAxis dataKey="month" />
        <BarChart.Legend isClickable />
        <BarChart.Tooltip variant={variant} roundness={roundness} defaultIndex={1} />
        <BarChart.Bar dataKey="desktop" isClickable />
        <BarChart.Bar dataKey="mobile" variant="hatched" isClickable />
      </BarChart>
    </div>
  )
}
