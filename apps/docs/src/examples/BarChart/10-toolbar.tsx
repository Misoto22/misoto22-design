'use client'

import { BarChart, type ChartConfig } from '@misoto22/design/charts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const data = Array.from({ length: 24 }, (_, index) => ({
  month: `${MONTHS[index % 12]} ${25 + Math.floor(index / 12)}`,
  desktop: 1200 + Math.round(Math.sin(index / 3) * 900) + index * 40,
}))

const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

export function Example() {
  // Five controls at most and no overflow menu: a row that can never outgrow
  // five 44px targets does not need one, and the menu would cost every chart
  // the Radix menu it reaches statically. A chart in a narrow card drops
  // controls instead — `zoom={false}`, or one format rather than two.
  //
  // The two files are deliberately not the same picture. The PNG captures the
  // plot as it stands, so it follows the zoom; the CSV is always the whole
  // dataset, like the figure's hidden data table, because a spreadsheet quietly
  // missing the rows you had zoomed past is data loss you cannot see.
  return (
    <BarChart title="Visitors by month" config={config} data={data} xDataKey="month">
      <BarChart.Toolbar exports={['png', 'csv']} />
      <BarChart.Grid />
      <BarChart.XAxis dataKey="month" />
      <BarChart.YAxis label="Visitors" />
      <BarChart.Tooltip />
      <BarChart.Bar dataKey="desktop" variant="duotone" />
    </BarChart>
  )
}
