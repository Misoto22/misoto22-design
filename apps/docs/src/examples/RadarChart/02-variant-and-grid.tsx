'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { RadarChart, type ChartConfig, type RadarVariant } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [
  { skill: 'Design', current: 86, target: 95 },
  { skill: 'Research', current: 64, target: 80 },
  { skill: 'Writing', current: 72, target: 78 },
  { skill: 'Delivery', current: 91, target: 88 },
  { skill: 'Review', current: 58, target: 75 },
  { skill: 'Support', current: 77, target: 70 },
]

const config = {
  current: { label: 'Current' },
  target: { label: 'Target' },
} satisfies ChartConfig

const VARIANTS: RadarVariant[] = ['filled', 'lines']
const GRIDS = ['polygon', 'circle'] as const

export function Example() {
  const [variant, setVariant] = useState<RadarVariant>('lines')
  const [gridType, setGridType] = useState<(typeof GRIDS)[number]>('polygon')

  // `lines` is the honest default above one series: filled polygons overlap,
  // and judging areas through two layers of translucency is what a radar is
  // worst at. A circle grid reads as a scale rather than as a second shape
  // competing with the mark.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          type="single"
          value={variant}
          onValueChange={(next) => next && setVariant(next as RadarVariant)}
          aria-label="Radar fill"
        >
          {VARIANTS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={gridType}
          onValueChange={(next) => next && setGridType(next as (typeof GRIDS)[number])}
          aria-label="Grid"
        >
          {GRIDS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <RadarChart title="Team profile" config={config} data={data} angleDataKey="skill">
        <RadarChart.PolarGrid gridType={gridType} />
        <RadarChart.PolarAngleAxis dataKey="skill" />
        <RadarChart.Legend isClickable />
        <RadarChart.Tooltip />
        <RadarChart.Radar dataKey="current" variant={variant} isClickable />
        <RadarChart.Radar dataKey="target" variant={variant} isClickable />
      </RadarChart>
    </div>
  )
}
