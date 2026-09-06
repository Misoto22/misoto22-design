'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { BulletChart, formatNumber } from '@misoto22/design/charts'
import { useState } from 'react'

// Four measures that share no unit and no range. Each one carries its own
// scale and its own thresholds, which is what lets a latency sit above a
// percentage in the same block.
const data = [
  { name: 'Uptime', detail: '30 days', value: 99.4, target: 99.9, ranges: [99, 99.5], domain: [98, 100] as [number, number] },
  { name: 'p95 latency', detail: 'ms, lower is better', value: 310, target: 250, ranges: [200, 400], domain: [0, 600] as [number, number] },
  { name: 'Error budget left', detail: '%', value: 38, target: 50, ranges: [25, 60], domain: [0, 100] as [number, number] },
  { name: 'Open incidents', value: 3, target: 0, ranges: [1, 4], domain: [0, 8] as [number, number] },
]

export function Example() {
  const [showScale, setShowScale] = useState(true)

  // The scale is off by default. Turn it on when a reader has to know what the
  // track's ends are — with four different domains stacked up, they do.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={showScale ? 'shown' : 'hidden'}
        onValueChange={(next) => next && setShowScale(next === 'shown')}
        aria-label="Scale labels"
      >
        <ToggleGroupItem value="hidden">no scale</ToggleGroupItem>
        <ToggleGroupItem value="shown">scale</ToggleGroupItem>
      </ToggleGroup>

      <BulletChart
        title="Platform health"
        data={data}
        showScale={showScale}
        formatValue={formatNumber({ style: 'plain' })}
      />
    </div>
  )
}
