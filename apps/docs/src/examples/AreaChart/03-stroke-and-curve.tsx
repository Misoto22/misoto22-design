'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import {
  AreaChart,
  type AreaStrokeVariant,
  type ChartConfig,
  type ChartCurveType,
} from '@misoto22/design/charts'
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

const STROKES: AreaStrokeVariant[] = ['solid', 'dashed', 'animated-dashed']
const CURVES = ['linear', 'monotone', 'step', 'bump'] as const

export function Example() {
  const [stroke, setStroke] = useState<AreaStrokeVariant>('dashed')
  const [curve, setCurve] = useState<ChartCurveType>('linear')

  // The two axes of the line itself. `animated-dashed` is a SMIL loop, so it is
  // dropped entirely under prefers-reduced-motion rather than merely slowed.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          type="single"
          value={stroke}
          onValueChange={(next) => next && setStroke(next as AreaStrokeVariant)}
          aria-label="Stroke"
        >
          {STROKES.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={String(curve)}
          onValueChange={(next) => next && setCurve(next as ChartCurveType)}
          aria-label="Curve"
        >
          {CURVES.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <AreaChart title="Visitors per month" config={config} data={data} curveType={curve}>
        <AreaChart.Grid />
        <AreaChart.XAxis dataKey="month" />
        <AreaChart.Tooltip />
        <AreaChart.Area dataKey="desktop" variant="solid" strokeVariant={stroke} />
      </AreaChart>
    </div>
  )
}
