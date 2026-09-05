'use client'

import { Combobox, Field } from '@misoto22/design'

const TAGS = [
  { value: 'film', label: 'Film' },
  { value: 'digital', label: 'Digital' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'street', label: 'Street' },
  { value: 'night', label: 'Night' },
]

export function Example() {
  return (
    <Field
      label="Tags"
      hint="The panel stays open while you pick; past two it counts instead of listing."
      className="w-full max-w-xs"
    >
      <Combobox multiple label="Tags" options={TAGS} defaultValue={['film']} placeholder="Add tags" />
    </Field>
  )
}
