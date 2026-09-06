'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { BarChart, type BarVariant, type ChartConfig } from '@misoto22/design/charts'
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

const VARIANTS: BarVariant[] = [
  'default',
  'hatched',
  'duotone',
  'duotone-reverse',
  'gradient',
  'stripped',
]

export function Example() {
  const [variant, setVariant] = useState<BarVariant>('default')

  // `stripped` is the one that survives density best: at twenty bars a solid
  // block becomes a wall, and a 2px cap over a wash still reads as twenty
  // distinct values.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(next) => next && setVariant(next as BarVariant)}
        aria-label="Fill variant"
      >
        {VARIANTS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <BarChart title={`Visitors by month — ${variant}`} config={config} data={data}>
        <BarChart.Grid />
        <BarChart.XAxis dataKey="month" />
        <BarChart.Tooltip />
        <BarChart.Bar dataKey="desktop" variant={variant} />
      </BarChart>
    </div>
  )
}
