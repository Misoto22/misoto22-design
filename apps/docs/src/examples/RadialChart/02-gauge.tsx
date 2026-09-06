'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { RadialChart, type ChartConfig, type RadialVariant } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [{ tier: 'used', used: 62 }]

const config = { used: { label: 'Used' } } satisfies ChartConfig

const VARIANTS: RadialVariant[] = ['full', 'semi']

export function Example() {
  const [variant, setVariant] = useState<RadialVariant>('semi')

  // `max` is what makes it a gauge. Without it the scale comes from the data
  // and the single bar always fills the arc — which would make 62% and 98% look
  // identical. The track behind it is what makes "how much is left" readable.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(next) => next && setVariant(next as RadialVariant)}
        aria-label="Arc"
      >
        {VARIANTS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <RadialChart
        title="Storage used"
        config={config}
        data={data}
        nameKey="tier"
        valueKey="used"
        variant={variant}
        max={100}
        innerRadius="65%"
      >
        <RadialChart.RadialBar dataKey="used" barSize={22} cornerRadius={11} />
        <RadialChart.Tooltip />
      </RadialChart>
    </div>
  )
}
