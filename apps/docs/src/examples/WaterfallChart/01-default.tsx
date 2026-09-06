'use client'

import { WaterfallChart, formatNumber, type WaterfallStep } from '@misoto22/design/charts'

// The closing bar carries no value of its own: it is whatever the deltas add
// up to, so it can never disagree with the steps above it.
const steps: WaterfallStep[] = [
  { name: 'FY24 ARR', value: 4200, type: 'total' },
  { name: 'New business', value: 1180 },
  { name: 'Expansion', value: 640 },
  { name: 'Downgrades', value: -310 },
  { name: 'Churn', value: -820 },
  { name: 'FY25 ARR', type: 'total' },
]

export function Example() {
  return (
    <WaterfallChart
      title="ARR bridge, FY24 to FY25"
      showTitle
      description="Thousands of AUD. The steps are simultaneous; the order is editorial."
      data={steps}
      formatValue={formatNumber({ style: 'compact' })}
    >
      <WaterfallChart.Grid />
      <WaterfallChart.XAxis />
      <WaterfallChart.YAxis />
      <WaterfallChart.Tooltip />
      <WaterfallChart.Bars showValues />
    </WaterfallChart>
  )
}
