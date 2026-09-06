'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'
import { Histogram } from '@misoto22/design/charts'
import { useState } from 'react'

const samples = [
  62, 64, 65, 65, 66, 67, 67, 68, 68, 68, 69, 69, 70, 70, 70, 71, 71, 72, 72, 73, 73, 74, 74, 75,
  75, 76, 77, 78, 79, 80, 82, 84, 86, 88, 91, 95, 99, 104, 110, 118, 126, 134, 141, 147, 152, 156,
  159, 162, 164, 166, 167, 168, 169, 170, 170, 171, 172, 172, 173, 174, 175, 176, 178, 180, 183,
  187, 192, 198, 205, 214, 226, 241, 259, 281, 308,
]

const WIDTHS = ['auto', '5', '14', '40'] as const

export function Example() {
  const [choice, setChoice] = useState<(typeof WIDTHS)[number]>('auto')

  // The same numbers, four times. At five bins the two humps are one; at forty
  // the shape dissolves into noise. A histogram's shape is a property of its
  // bin width as much as of its data, which is why the rule that drew the
  // picture is worth saying out loud.
  return (
    <div className="flex w-full flex-col gap-4">
      <ToggleGroup
        type="single"
        value={choice}
        onValueChange={(next) => next && setChoice(next as (typeof WIDTHS)[number])}
        aria-label="Bin count"
      >
        {WIDTHS.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option === 'auto' ? 'auto' : `${option} bins`}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Histogram
        title={`Request duration — ${choice === 'auto' ? 'Freedman–Diaconis' : `${choice} bins`}`}
        values={samples}
        bins={choice === 'auto' ? undefined : Number(choice)}
      >
        <Histogram.Grid />
        <Histogram.XAxis label="ms" />
        <Histogram.YAxis />
        <Histogram.Tooltip />
        <Histogram.Bars />
      </Histogram>
    </div>
  )
}
