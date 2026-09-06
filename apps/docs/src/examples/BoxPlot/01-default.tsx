'use client'

import { BoxPlot } from '@misoto22/design/charts'

// Raw observations, one array per region. The chart does the quartiles and
// Tukey's fences; nothing here has to know what a five-number summary is.
const data = [
  { name: 'Sydney', values: [182, 190, 194, 201, 205, 209, 214, 221, 236, 402] },
  { name: 'Singapore', values: [244, 251, 258, 262, 269, 274, 281, 290, 303, 318] },
  { name: 'Frankfurt', values: [310, 318, 325, 331, 338, 344, 352, 361, 379, 588] },
  { name: 'Oregon', values: [268, 275, 279, 284, 288, 293, 299, 308, 322, 341] },
]

export function Example() {
  return (
    <BoxPlot
      title="Response time by region"
      showTitle
      description="One box per edge location, 24 hours"
      data={data}
    >
      <BoxPlot.Grid />
      <BoxPlot.XAxis />
      <BoxPlot.YAxis label="ms" />
      <BoxPlot.Tooltip />
      <BoxPlot.Boxes />
    </BoxPlot>
  )
}
