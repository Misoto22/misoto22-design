'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import {
  AreaChart,
  type ChartConfig,
  type ChartDotVariant,
  type ChartRevealType,
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

const DOTS: ChartDotVariant[] = ['default', 'border', 'colored-border']
const REVEALS: ChartRevealType[] = ['forward', 'reverse', 'center-out', 'edges-in', 'none']

export function Example() {
  const [dot, setDot] = useState<ChartDotVariant>('border')
  const [reveal, setReveal] = useState<ChartRevealType>('forward')

  // Switching the reveal remounts the area, which is what replays it. The
  // resting dot shares that wipe, so the markers arrive with the line rather
  // than popping in ahead of it.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
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
          value={reveal}
          onValueChange={(next) => next && setReveal(next as ChartRevealType)}
          aria-label="Reveal"
        >
          {REVEALS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <AreaChart
        key={`${dot}-${reveal}`}
        title="Visitors per month"
        config={config}
        data={data}
        animationType={reveal}
      >
        <AreaChart.Grid />
        <AreaChart.XAxis dataKey="month" />
        <AreaChart.Tooltip />
        <AreaChart.Area dataKey="desktop" variant="solid">
          <AreaChart.Dot variant={dot} />
          <AreaChart.ActiveDot variant="colored-border" />
        </AreaChart.Area>
      </AreaChart>
    </div>
  )
}
