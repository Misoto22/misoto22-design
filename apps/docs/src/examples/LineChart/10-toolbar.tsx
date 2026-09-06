'use client'

import { LineChart, type ChartConfig } from '@misoto22/design/charts'

const data = Array.from({ length: 90 }, (_, index) => ({
  day: `D${index + 1}`,
  desktop: 160 + Math.round(Math.sin(index / 6) * 70),
  mobile: 90 + Math.round(Math.cos(index / 9) * 50),
}))

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

export function Example() {
  // The toolbar and the brush drive ONE window, so they cannot disagree: step
  // the zoom and the handles below move, drag a handle and "reset zoom" lights
  // up. Ninety days is the case that needs both — the strip shows the shape you
  // are choosing from, the buttons step into it precisely.
  //
  // The plot is focusable: tab to it and arrow keys pan, plus and minus zoom,
  // zero resets. Ctrl and the wheel zoom around the pointer, and dragging
  // across the plot zooms to that span.
  return (
    <LineChart title="Visitors per day" config={config} data={data} xDataKey="day">
      <LineChart.Toolbar exports={['png', 'csv']} />
      <LineChart.Grid />
      <LineChart.XAxis dataKey="day" />
      <LineChart.YAxis label="Visitors" />
      <LineChart.Legend />
      <LineChart.Tooltip />
      <LineChart.Line dataKey="desktop" />
      <LineChart.Line dataKey="mobile" strokeVariant="dashed" />
      <LineChart.Brush height={48} />
    </LineChart>
  )
}
