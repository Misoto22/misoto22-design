'use client'

import { DatePicker, Field } from '@misoto22/design'

export function Example() {
  return (
    <Field
      label="Publish on"
      hint="Month and year are dropdowns — reaching two years back is one click, not twenty-four."
      className="w-full max-w-xs"
    >
      <DatePicker label="Publish on" />
    </Field>
  )
}
