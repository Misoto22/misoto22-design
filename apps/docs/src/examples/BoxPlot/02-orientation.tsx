'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { BoxPlot, type BoxPlotOrientation } from '@misoto22/design/charts'
import { useState } from 'react'

const data = [
  { name: 'ap-southeast-2', values: [182, 190, 194, 201, 205, 209, 214, 221, 236, 402] },
  { name: 'ap-southeast-1', values: [244, 251, 258, 262, 269, 274, 281, 290, 303, 318] },
  { name: 'eu-central-1', values: [310, 318, 325, 331, 338, 344, 352, 361, 379, 588] },
  { name: 'us-west-2', values: [268, 275, 279, 284, 288, 293, 299, 308, 322, 341] },
]

const ORIENTATIONS: BoxPlotOrientation[] = ['vertical', 'horizontal']

export function Example() {
  const [orientation, setOrientation] = useState<BoxPlotOrientation>('vertical')

  // Region codes are the case `horizontal` exists for: under a column they
  // have to be rotated to fit, and beside a row they read straight.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={orientation}
        onValueChange={(next) => next && setOrientation(next as BoxPlotOrientation)}
        aria-label="Orientation"
      >
        {ORIENTATIONS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <BoxPlot title="Response time by region" data={data} orientation={orientation}>
        <BoxPlot.Grid />
        <BoxPlot.XAxis />
        <BoxPlot.YAxis />
        <BoxPlot.Tooltip />
        <BoxPlot.Boxes />
      </BoxPlot>
    </div>
  )
}
