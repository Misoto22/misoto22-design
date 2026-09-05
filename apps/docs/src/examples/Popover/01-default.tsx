'use client'

import { Button, Field, Popover, PopoverContent, PopoverTrigger, Select } from '@misoto22/design'

export function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Filters</Button>
      </PopoverTrigger>
      <PopoverContent label="Filters" showClose>
        <div className="flex flex-col gap-4">
          <Field label="Status">
            <Select defaultValue="all">
              <option value="all">Any</option>
              <option value="live">Live</option>
            </Select>
          </Field>
          <Button size="sm">Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
