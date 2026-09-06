'use client'

import { SankeyChart, type ChartConfig } from '@misoto22/design/charts'

const data = { nodes: [{ name: 'Search' }], links: [] }

const config = { Search: { label: 'Search' } } satisfies ChartConfig

export function Example() {
  return (
    <SankeyChart title="Visits by source and outcome" config={config} data={data} isLoading>
      <SankeyChart.Node />
      <SankeyChart.Link />
    </SankeyChart>
  )
}
