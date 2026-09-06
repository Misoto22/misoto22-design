'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import {
  ScatterChart,
  type ChartConfig,
  type ScatterShape,
  type ScatterVariant,
} from '@misoto22/design/charts'
import { useState } from 'react'

const desktop = [
  { kb: 120, ms: 340 },
  { kb: 180, ms: 412 },
  { kb: 240, ms: 505 },
  { kb: 310, ms: 618 },
  { kb: 420, ms: 790 },
]

const mobile = [
  { kb: 130, ms: 520 },
  { kb: 190, ms: 610 },
  { kb: 250, ms: 704 },
  { kb: 320, ms: 861 },
  { kb: 430, ms: 990 },
]

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

const SHAPES: ScatterShape[] = ['circle', 'square', 'triangle', 'diamond', 'cross', 'ring']
const VARIANTS: ScatterVariant[] = ['solid', 'outline']

export function Example() {
  const [shape, setShape] = useState<ScatterShape>('circle')
  const [variant, setVariant] = useState<ScatterVariant>('solid')

  // Shape is doing what hue does elsewhere. Two overlapping clouds separate far
  // better by circle-versus-cross than by two steps of grey — and shape
  // survives overprinting, which a lightness step does not.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          type="single"
          value={shape}
          onValueChange={(next) => next && setShape(next as ScatterShape)}
          aria-label="Mark shape"
        >
          {SHAPES.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={variant}
          onValueChange={(next) => next && setVariant(next as ScatterVariant)}
          aria-label="Mark fill"
        >
          {VARIANTS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ScatterChart
        title="Load time against bundle size"
        config={config}
        table={{
          rows: [...desktop, ...mobile],
          rowKey: 'kb',
          columns: [{ key: 'ms', label: 'Load (ms)' }],
        }}
      >
        <ScatterChart.Grid />
        <ScatterChart.XAxis dataKey="kb" name="Bundle" unit=" kB" />
        <ScatterChart.YAxis dataKey="ms" name="Load" unit=" ms" />
        <ScatterChart.Legend isClickable />
        <ScatterChart.Tooltip />
        <ScatterChart.Scatter
          dataKey="desktop"
          data={desktop}
          shape={shape}
          variant={variant}
          isClickable
        />
        <ScatterChart.Scatter dataKey="mobile" data={mobile} shape="cross" isClickable />
      </ScatterChart>
    </div>
  )
}
