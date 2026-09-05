'use client'

import { Calendar } from '@misoto22/design'
import { useState } from 'react'

export function Example() {
  const [range, setRange] = useState<{ from?: Date; to?: Date } | undefined>()

  return (
    <Calendar
      mode="range"
      selected={range as never}
      onSelect={setRange as never}
      defaultMonth={new Date(2026, 8, 1)}
    />
  )
}
