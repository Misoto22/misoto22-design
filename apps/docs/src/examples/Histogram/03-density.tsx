'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { Histogram, type HistogramBin, type HistogramMode } from '@misoto22/design/charts'
import { useState } from 'react'

// Buckets that arrived already counted, at the widths the metrics backend
// chose. They get wider as the values grow, which is how latency histograms
// almost always come back.
const buckets: HistogramBin[] = [
  { from: 0, to: 10, count: 480 },
  { from: 10, to: 25, count: 610 },
  { from: 25, to: 50, count: 540 },
  { from: 50, to: 100, count: 420 },
  { from: 100, to: 250, count: 310 },
  { from: 250, to: 500, count: 120 },
  { from: 500, to: 1000, count: 40 },
]

const MODES: HistogramMode[] = ['frequency', 'density']

export function Example() {
  const [mode, setMode] = useState<HistogramMode>('frequency')

  // Under `frequency` the 100–250 bucket looks like a real shoulder. It is
  // fifteen times as wide as the first one, and under `density` — count over
  // n × width — the tail flattens into what the data actually says.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(next) => next && setMode(next as HistogramMode)}
        aria-label="Bar height"
      >
        {MODES.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Histogram title={`Request duration — ${mode}`} data={buckets} mode={mode}>
        <Histogram.Grid />
        <Histogram.XAxis label="ms" />
        <Histogram.YAxis />
        <Histogram.Tooltip />
        <Histogram.Bars />
      </Histogram>
    </div>
  )
}
