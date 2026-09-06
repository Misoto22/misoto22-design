'use client'

import { FunnelChart, type ChartConfig } from '@misoto22/design/charts'

const stages = [
  { stage: 'Visited', people: 4200 },
  { stage: 'Signed up', people: 1800 },
  { stage: 'Activated', people: 900 },
  { stage: 'Paid', people: 320 },
]

const config = {
  Visited: { label: 'Visited' },
  'Signed up': { label: 'Signed up' },
  Activated: { label: 'Activated' },
  Paid: { label: 'Paid' },
} satisfies ChartConfig

export function Example() {
  // The taper encodes a RATIO between neighbouring stages and the eye reads the
  // enclosed area, so a funnel exaggerates a shallow drop. The printed label is
  // the relief for that.
  return (
    <FunnelChart
      title="Signup funnel"
      config={config}
      data={stages}
      dataKey="people"
      nameKey="stage"
    >
      <FunnelChart.Funnel>
        <FunnelChart.Label />
      </FunnelChart.Funnel>
      <FunnelChart.Tooltip />
    </FunnelChart>
  )
}
