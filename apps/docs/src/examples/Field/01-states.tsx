'use client'

import { Field, Input, Select, SelectItem, Textarea } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <Field label="Email" required hint="We never share it.">
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Field label="Full name" error="Name is required.">
        <Input />
      </Field>
      <Field label="Region">
        <Select label="Region" defaultValue="au">
          <SelectItem value="au">Australia</SelectItem>
          <SelectItem value="nz">New Zealand</SelectItem>
          <SelectItem value="jp">Japan</SelectItem>
        </Select>
      </Field>
      <Field label="Notes" hint="Markdown is fine.">
        <Textarea rows={3} placeholder="Anything else?" />
      </Field>
    </div>
  )
}
