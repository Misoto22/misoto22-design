'use client'

import { Field, Select, SelectGroup, SelectItem, SelectLabel, SelectSeparator } from '@misoto22/design'

export function Example() {
  return (
    <Field label="Region" hint="The list is ours, not the platform’s — open it." className="w-full max-w-xs">
      <Select label="Region" defaultValue="au">
        <SelectGroup>
          <SelectLabel>Oceania</SelectLabel>
          <SelectItem value="au">Australia</SelectItem>
          <SelectItem value="nz">New Zealand</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="jp">Japan</SelectItem>
          <SelectItem value="sg">Singapore</SelectItem>
          <SelectItem value="cn">China</SelectItem>
        </SelectGroup>
      </Select>
    </Field>
  )
}
