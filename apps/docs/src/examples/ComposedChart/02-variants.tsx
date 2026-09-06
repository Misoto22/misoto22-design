'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import {
  ComposedChart,
  type AreaStrokeVariant,
  type BarVariant,
  type ChartConfig,
} from '@misoto22/design/charts'
import { useState } from 'react'

const data = [
  { month: 'Jan', revenue: 4200, profit: 1800 },
  { month: 'Feb', revenue: 5800, profit: 2400 },
  { month: 'Mar', revenue: 4100, profit: 1600 },
  { month: 'Apr', revenue: 6200, profit: 2800 },
  { month: 'May', revenue: 5400, profit: 2200 },
  { month: 'Jun', revenue: 7800, profit: 3400 },
]

const config = {
  revenue: { label: 'Revenue' },
  profit: { label: 'Profit' },
} satisfies ChartConfig

const BARS: BarVariant[] = ['default', 'hatched', 'duotone', 'duotone-reverse', 'gradient', 'stripped']
const STROKES: AreaStrokeVariant[] = ['solid', 'dashed', 'animated-dashed']

export function Example() {
  const [bar, setBar] = useState<BarVariant>('duotone')
  const [stroke, setStroke] = useState<AreaStrokeVariant>('solid')

  // The bar half carries the same six fills as a plain BarChart; the line half
  // carries the same three strokes as a LineChart. Nothing here is a third
  // vocabulary to learn.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          type="single"
          value={bar}
          onValueChange={(next) => next && setBar(next as BarVariant)}
          aria-label="Bar fill"
        >
          {BARS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={stroke}
          onValueChange={(next) => next && setStroke(next as AreaStrokeVariant)}
          aria-label="Line stroke"
        >
          {STROKES.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ComposedChart title="Revenue and profit" config={config} data={data}>
        <ComposedChart.Grid />
        <ComposedChart.XAxis dataKey="month" />
        <ComposedChart.Tooltip />
        <ComposedChart.Bar dataKey="revenue" variant={bar} />
        <ComposedChart.Line dataKey="profit" strokeVariant={stroke}>
          <ComposedChart.Dot variant="border" />
        </ComposedChart.Line>
      </ComposedChart>
    </div>
  )
}
