'use client'

import { BoxPlot } from '@misoto22/design/charts'

// Summaries that arrived already computed — with `count`, which is what a
// notch needs and what tells a box over 40 readings from a box over 4,000.
const data = [
  { name: 'Control', min: 180, q1: 214, median: 236, q3: 262, max: 318, count: 4200 },
  { name: 'Variant A', min: 176, q1: 208, median: 229, q3: 255, max: 310, count: 4180 },
  { name: 'Variant B', min: 184, q1: 226, median: 258, q3: 291, max: 356, count: 190 },
]

export function Example() {
  // Two notches that do not overlap are roughly a 95% test of "these medians
  // differ". Roughly — and Variant B's notch is wide because its sample is
  // small, which is the comparison the plain box would have hidden.
  return (
    <BoxPlot
      title="Checkout latency by variant"
      showTitle
      description="Notch width falls with the square root of the sample"
      data={data}
    >
      <BoxPlot.Grid />
      <BoxPlot.XAxis />
      <BoxPlot.YAxis label="ms" />
      <BoxPlot.Tooltip />
      <BoxPlot.Boxes notch />
    </BoxPlot>
  )
}
