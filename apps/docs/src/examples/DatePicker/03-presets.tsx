'use client'

import { DatePicker, Field } from '@misoto22/design'

export function Example() {
  return (
    <Field
      label="Remind me on"
      hint="Shortcuts are computed when clicked, so “today” means today even on a tab left open overnight."
      className="w-full max-w-xs"
    >
      <DatePicker label="Remind me on" presets />
    </Field>
  )
}
