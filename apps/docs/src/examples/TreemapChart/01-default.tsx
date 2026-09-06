'use client'

import { TreemapChart } from '@misoto22/design/charts'

const packages = [
  { name: 'recharts', size: 480 },
  { name: 'react-dom', size: 310 },
  { name: 'motion', size: 140 },
  { name: 'lucide-react', size: 96 },
  { name: 'cmdk', size: 62 },
  { name: 'tailwind-merge', size: 41 },
  { name: 'clsx', size: 12 },
  { name: 'sonner', size: 28 },
]

export function Example() {
  // Area is the encoding, so the data has to be non-negative and has to sum to
  // something a reader recognises as the whole. It is the only form here that
  // stays readable at fifty items.
  return (
    <TreemapChart title="Bundle size by package" data={packages} showLabels>
      <TreemapChart.Tooltip />
    </TreemapChart>
  )
}
