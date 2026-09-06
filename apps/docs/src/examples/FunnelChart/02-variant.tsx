'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { FunnelChart, type ChartConfig, type FunnelVariant } from '@misoto22/design/charts'
import { useState } from 'react'

const stages = [
  { stage: 'Visited', people: 4200 },
  { stage: 'Signed up', people: 1800 },
  { stage: 'Activated', people: 900 },
  { stage: 'Paid', people: 320 },
]

const config = {
  Visited: { label: 'Visited' },
  'Signed up': { label: 'Signed up' },
  Activated: { label: 'Activated' },
  Paid: { label: 'Paid' },
} satisfies ChartConfig

const VARIANTS: FunnelVariant[] = ['stepped', 'ramp']

export function Example() {
  const [variant, setVariant] = useState<FunnelVariant>('stepped')

  // `stepped` is the honest default: every stage keeps the same fill and the
  // TAPER carries the drop. A ramp that also darkens each stage encodes the
  // same fact twice and invites a comparison between two things that are one.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(next) => next && setVariant(next as FunnelVariant)}
        aria-label="Stage fill"
      >
        {VARIANTS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <FunnelChart
        title={`Signup funnel — ${variant}`}
        config={config}
        data={stages}
        dataKey="people"
        nameKey="stage"
      >
        <FunnelChart.Funnel variant={variant} gap={3}>
          <FunnelChart.Label dataKey="people" position="center" />
        </FunnelChart.Funnel>
        <FunnelChart.Tooltip />
      </FunnelChart>
    </div>
  )
}
