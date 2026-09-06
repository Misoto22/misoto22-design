'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { AreaChart, type AreaStackType, type ChartConfig } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 273, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 314, mobile: 240 },
]

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

const STACKS: AreaStackType[] = ['default', 'stacked', 'expanded']

export function Example() {
  const [stackType, setStackType] = useState<AreaStackType>('stacked')

  // Three different questions, not three looks: `default` compares two series,
  // `stacked` reads their total, `expanded` reads their share — and the Y axis
  // switches to percentages on its own for the third.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={stackType}
        onValueChange={(next) => next && setStackType(next as AreaStackType)}
        aria-label="Stacking"
      >
        {STACKS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <AreaChart
        title={`Visitors per month — ${stackType}`}
        config={config}
        data={data}
        stackType={stackType}
      >
        <AreaChart.Grid />
        <AreaChart.XAxis dataKey="month" />
        <AreaChart.YAxis />
        <AreaChart.Legend />
        <AreaChart.Tooltip />
        <AreaChart.Area dataKey="desktop" variant="solid" />
        <AreaChart.Area dataKey="mobile" variant="lines" />
      </AreaChart>
    </div>
  )
}
