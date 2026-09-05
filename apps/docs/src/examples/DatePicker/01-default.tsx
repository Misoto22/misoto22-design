'use client'

import { DatePicker, Field } from '@misoto22/design'

export function Example() {
  return (
    <Field label="Publish on" hint="Printed in your own locale, not a fixed format." className="w-full max-w-xs">
      <DatePicker label="Publish on" />
    </Field>
  )
}
