'use client'

import { Button, Field, Input, Sheet, SheetContent, SheetTrigger } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap gap-3">
      {(['start', 'end', 'top', 'bottom'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side} title="Filters" description="Narrow the list.">
            <Field label="Search"><Input type="search" /></Field>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  )
}
