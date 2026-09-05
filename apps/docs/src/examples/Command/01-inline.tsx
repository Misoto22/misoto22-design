'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@misoto22/design'

export function Example() {
  return (
    <Command label="Command palette" className="w-full max-w-md">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No command matches that.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem value="components" shortcut="C">Components</CommandItem>
          <CommandItem value="foundations" shortcut="F">Foundations</CommandItem>
          <CommandItem value="principles" shortcut="P">Principles</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem value="light">Switch to light</CommandItem>
          <CommandItem value="dark">Switch to dark</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
