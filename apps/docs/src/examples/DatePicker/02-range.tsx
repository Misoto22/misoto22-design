'use client'

import { DateRangePicker, Field } from '@misoto22/design'

export function Example() {
  return (
    <Field
      label="Reporting period"
      hint="Two months at once, because a range that crosses a boundary is the common case."
      className="w-full max-w-sm"
    >
      <DateRangePicker label="Reporting period" />
    </Field>
  )
}
