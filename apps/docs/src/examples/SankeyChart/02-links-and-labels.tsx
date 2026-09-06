'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import {
  SankeyChart,
  type ChartConfig,
  type SankeyLabelPosition,
  type SankeyLinkVariant,
} from '@misoto22/design/charts'
import { useState } from 'react'

const data = {
  nodes: [
    { name: 'Search' },
    { name: 'Social' },
    { name: 'Direct' },
    { name: 'Signed up' },
    { name: 'Browsed' },
    { name: 'Left' },
  ],
  links: [
    { source: 0, target: 3, value: 42 },
    { source: 0, target: 4, value: 68 },
    { source: 1, target: 4, value: 51 },
    { source: 1, target: 5, value: 34 },
    { source: 2, target: 3, value: 27 },
    { source: 2, target: 5, value: 18 },
  ],
}

const config = {
  Search: { label: 'Search' },
  Social: { label: 'Social' },
  Direct: { label: 'Direct' },
  'Signed up': { label: 'Signed up' },
  Browsed: { label: 'Browsed' },
  Left: { label: 'Left' },
} satisfies ChartConfig

const LINKS: SankeyLinkVariant[] = ['gradient', 'source', 'target', 'solid']
const LABELS: SankeyLabelPosition[] = ['outside', 'inside']

export function Example() {
  const [link, setLink] = useState<SankeyLinkVariant>('gradient')
  const [position, setPosition] = useState<SankeyLabelPosition>('outside')

  // `gradient` reads as flow; `source` and `target` attribute a band to one
  // end; `solid` gives up colour and lets the node rectangles carry identity.
  // Inside labels need a wide node to sit in.
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <ToggleGroup
          type="single"
          value={link}
          onValueChange={(next) => next && setLink(next as SankeyLinkVariant)}
          aria-label="Link"
        >
          {LINKS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={position}
          onValueChange={(next) => next && setPosition(next as SankeyLabelPosition)}
          aria-label="Labels"
        >
          {LABELS.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <SankeyChart
        title="Visits by source and outcome"
        config={config}
        data={data}
        nodeWidth={position === 'inside' ? 76 : 12}
      >
        <SankeyChart.Node radius={3} isClickable>
          <SankeyChart.NodeLabel position={position} showValues />
        </SankeyChart.Node>
        <SankeyChart.Link variant={link} verticalPadding={2} />
        <SankeyChart.Tooltip />
      </SankeyChart>
    </div>
  )
}
