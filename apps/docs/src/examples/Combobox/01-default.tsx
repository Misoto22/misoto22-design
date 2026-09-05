'use client'

import { Combobox, Field } from '@misoto22/design'

const CAMERAS = [
  { value: 'x100v', label: 'Fujifilm X100V', keywords: ['fuji', 'compact'] },
  { value: 'xt5', label: 'Fujifilm X-T5', keywords: ['fuji'] },
  { value: 'a7iv', label: 'Sony α7 IV', keywords: ['sony', 'alpha'] },
  { value: 'r6', label: 'Canon EOS R6', keywords: ['canon'] },
  { value: 'z6', label: 'Nikon Z6 III', keywords: ['nikon'] },
  { value: 'gr3', label: 'Ricoh GR III', keywords: ['ricoh', 'compact'] },
  { value: 'm11', label: 'Leica M11', keywords: ['leica', 'rangefinder'] },
]

export function Example() {
  return (
    <Field label="Camera" hint="Type to filter — “compact” matches two of them." className="w-full max-w-xs">
      <Combobox label="Camera" options={CAMERAS} placeholder="Pick a body" />
    </Field>
  )
}
