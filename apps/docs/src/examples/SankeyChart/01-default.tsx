'use client'

import { SankeyChart, type ChartConfig } from '@misoto22/design/charts'

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

export function Example() {
  // The only chart here whose data is a graph rather than a table, so it takes
  // { nodes, links } — and its hidden table lists the FLOWS rather than the
  // nodes, because a table of node totals loses every "from → to".
  return (
    <SankeyChart title="Visits by source and outcome" config={config} data={data} nodeWidth={12}>
      <SankeyChart.Node radius={3}>
        <SankeyChart.NodeLabel position="outside" showValues />
      </SankeyChart.Node>
      <SankeyChart.Link variant="gradient" />
      <SankeyChart.Tooltip />
    </SankeyChart>
  )
}
