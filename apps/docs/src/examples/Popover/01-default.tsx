'use client'

import { Button, Field, Popover, PopoverContent, PopoverTrigger, Select, SelectItem } from '@misoto22/design'

export function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Filters</Button>
      </PopoverTrigger>
      <PopoverContent label="Filters" showClose>
        <div className="flex flex-col gap-4">
          <Field label="Status">
            <Select label="Status" defaultValue="all">
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="live">Live</SelectItem>
            </Select>
          </Field>
          <Button size="sm">Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
