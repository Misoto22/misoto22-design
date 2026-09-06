'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { PieChart, type ChartConfig } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
]

const config = {
  chrome: { label: 'Chrome' },
  safari: { label: 'Safari' },
  firefox: { label: 'Firefox' },
  edge: { label: 'Edge' },
} satisfies ChartConfig

const SHAPES = {
  pie: { innerRadius: 0, paddingAngle: 0, cornerRadius: 0 },
  donut: { innerRadius: '55%', paddingAngle: 2, cornerRadius: 4 },
  padded: { innerRadius: '35%', paddingAngle: 5, cornerRadius: 6 },
  overlapping: { innerRadius: '40%', paddingAngle: -14, cornerRadius: 8 },
} as const

type Shape = keyof typeof SHAPES

export function Example() {
  const [shape, setShape] = useState<Shape>('donut')

  // A donut is easier to read than a full pie: the eye compares arc LENGTH
  // rather than area, and arc length is the honest encoding. `overlapping` uses
  // a negative padding angle — each wedge's surface-coloured stroke is what
  // re-separates them into stacked cards.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={shape}
        onValueChange={(next) => next && setShape(next as Shape)}
        aria-label="Shape"
      >
        {(Object.keys(SHAPES) as Shape[]).map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <PieChart
        title={`Visitors by browser — ${shape}`}
        config={config}
        data={data}
        dataKey="visitors"
        nameKey="browser"
      >
        <PieChart.Pie {...SHAPES[shape]} />
        <PieChart.Tooltip />
        <PieChart.Legend />
      </PieChart>
    </div>
  )
}
