'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import {
  LineChart,
  type ChartConfig,
  type ChartCurveType,
  type ChartDotVariant,
  type LineStrokeVariant,
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

const STROKES: LineStrokeVariant[] = ['solid', 'dashed', 'animated-dashed']
const DOTS: ChartDotVariant[] = ['default', 'border', 'colored-border']
const CURVES = ['linear', 'monotone', 'step', 'bump'] as const

export function Example() {
  const [stroke, setStroke] = useState<LineStrokeVariant>('solid')
  const [dot, setDot] = useState<ChartDotVariant>('border')
  const [curve, setCurve] = useState<ChartCurveType>('linear')

  // Every dot is painted from its series gradient sampled at the x it sits on.
  // Filling the circle directly would restart the gradient inside each marker,
  // and every dot on the line would come out the same colour.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          type="single"
          value={stroke}
          onValueChange={(next) => next && setStroke(next as LineStrokeVariant)}
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
          value={dot}
          onValueChange={(next) => next && setDot(next as ChartDotVariant)}
          aria-label="Dot"
        >
          {DOTS.map((option) => (
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

      <LineChart title="Visitors per month" config={config} data={data} curveType={curve}>
        <LineChart.Grid />
        <LineChart.XAxis dataKey="month" />
        <LineChart.Tooltip />
        <LineChart.Line dataKey="desktop" strokeVariant={stroke}>
          <LineChart.Dot variant={dot} />
          <LineChart.ActiveDot variant="colored-border" />
        </LineChart.Line>
      </LineChart>
    </div>
  )
}
