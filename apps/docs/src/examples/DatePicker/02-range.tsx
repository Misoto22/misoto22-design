'use client'

import { DateRangePicker, Field } from '@misoto22/design'

export function Example() {
  return (
    <Field
      label="Reporting period"
      hint="Last 30 days and its neighbours are one click; the grid is for everything else."
      className="w-full max-w-sm"
    >
      <DateRangePicker label="Reporting period" />
    </Field>
  )
}
