'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { WaterfallChart, formatNumber, type WaterfallStep } from '@misoto22/design/charts'
import { useState } from 'react'

// `total` plants a bar on the baseline and sets the running figure. Here it is
// used twice in the middle, as subtotals: gross profit, then operating profit.
const steps: WaterfallStep[] = [
  { name: 'Revenue', value: 8400, type: 'total' },
  { name: 'COGS', value: -3100 },
  { name: 'Gross profit', type: 'total' },
  { name: 'Sales', value: -1450 },
  { name: 'R&D', value: -1900 },
  { name: 'G&A', value: -720 },
  { name: 'Operating profit', type: 'total' },
]

export function Example() {
  const [connectors, setConnectors] = useState(true)

  // Turn the connectors off and the same bars become a row of floating
  // lengths. They are the only thing saying the steps compose into a cascade —
  // which is also why they should come off when the order is arbitrary.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={connectors ? 'joined' : 'loose'}
        onValueChange={(next) => next && setConnectors(next === 'joined')}
        aria-label="Connectors"
      >
        <ToggleGroupItem value="joined">connectors</ToggleGroupItem>
        <ToggleGroupItem value="loose">bars only</ToggleGroupItem>
      </ToggleGroup>

      <WaterfallChart
        title="Operating profit bridge"
        data={steps}
        formatValue={formatNumber({ style: 'compact' })}
      >
        <WaterfallChart.Grid />
        <WaterfallChart.XAxis />
        <WaterfallChart.YAxis />
        <WaterfallChart.Tooltip />
        <WaterfallChart.Bars connectors={connectors} showValues />
      </WaterfallChart>
    </div>
  )
}
