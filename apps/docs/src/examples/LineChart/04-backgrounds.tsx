'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { LineChart, type ChartBackgroundVariant, type ChartConfig } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [
  { month: 'Jan', desktop: 186 },
  { month: 'Feb', desktop: 305 },
  { month: 'Mar', desktop: 237 },
  { month: 'Apr', desktop: 273 },
  { month: 'May', desktop: 209 },
  { month: 'Jun', desktop: 314 },
]

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

const VARIANTS: ChartBackgroundVariant[] = [
  'dots',
  'grid',
  'cross-hatch',
  'diagonal-lines',
  'plus',
  'falling-triangles',
  '4-pointed-star',
  'tiny-checkers',
  'overlapping-circles',
  'wiggle-lines',
  'bubbles',
]

export function Example() {
  const [variant, setVariant] = useState<ChartBackgroundVariant>('dots')

  // The plate is bounded to the PLOT rectangle, not to the whole SVG, so it
  // stops where the data stops and never runs underneath the tick labels.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(next) => next && setVariant(next as ChartBackgroundVariant)}
        aria-label="Background plate"
        className="flex-wrap"
      >
        {VARIANTS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <LineChart title={`Visitors per month — ${variant} plate`} config={config} data={data}>
        <LineChart.Background variant={variant} />
        <LineChart.XAxis dataKey="month" />
        <LineChart.Tooltip />
        <LineChart.Line dataKey="desktop" />
      </LineChart>
    </div>
  )
}
