'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { RadialChart, type ChartConfig, type RadialVariant } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [{ tier: 'used', used: 62 }]

const config = { used: { label: 'Used' } } satisfies ChartConfig

const VARIANTS: RadialVariant[] = ['full', 'semi']

/**
 * One value against a fixed total — the case a radial chart is unambiguously
 * right for. max is what makes it a gauge: without it the scale comes from the
 * data and the lone bar always fills the arc, which would draw 62 and 98
 * identically. The track behind the bar is the other half of the reading, since
 * it is the remainder the value is a fraction of. semi drops the centre to 70
 * percent of the box so the half circle sits in the middle of its own space
 * rather than at the top of it.
 */
export function Example() {
  const [variant, setVariant] = useState<RadialVariant>('semi')

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
