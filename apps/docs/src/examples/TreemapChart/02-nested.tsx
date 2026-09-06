'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { TreemapChart, type TreemapVariant } from '@misoto22/design/charts'
import { useState } from 'react'

const tree = [
  {
    name: 'runtime',
    children: [
      { name: 'react-dom', size: 310 },
      { name: 'react', size: 92 },
    ],
  },
  {
    name: 'charts',
    children: [
      { name: 'recharts', size: 480 },
      { name: 'motion', size: 140 },
    ],
  },
  {
    name: 'ui',
    children: [
      { name: 'lucide-react', size: 96 },
      { name: 'cmdk', size: 62 },
      { name: 'sonner', size: 28 },
      { name: 'clsx', size: 12 },
    ],
  },
]

const VARIANTS: TreemapVariant[] = ['ramp', 'nested']

export function Example() {
  const [variant, setVariant] = useState<TreemapVariant>('nested')

  // `ramp` walks the series ramp so siblings separate by lightness; `nested`
  // darkens by DEPTH instead, which is the right encoding when the question is
  // "what is inside what".
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(next) => next && setVariant(next as TreemapVariant)}
        aria-label="Tile fill"
      >
        {VARIANTS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <TreemapChart
        title={`Bundle size by group — ${variant}`}
        data={tree}
        variant={variant}
        showLabels
      >
        <TreemapChart.Tooltip />
      </TreemapChart>
    </div>
  )
}
