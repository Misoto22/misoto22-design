'use client'

import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandHint,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@misoto22/design'
import { Blocks, Compass, Moon, Ruler, Scale, Sun } from 'lucide-react'

export function Example() {
  return (
    <Command label="Command palette" className="w-full max-w-md">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No command matches that. Try “theme”.</CommandEmpty>
        {/* The glyph is what makes a long list scannable: the eye sorts by
            shape before it reads. */}
        <CommandGroup heading="Navigate">
          <CommandItem value="components" icon={<Blocks />} meta="49" shortcut="C">
            Components
          </CommandItem>
          <CommandItem value="foundations" icon={<Ruler />} shortcut="F">
            Foundations
          </CommandItem>
          <CommandItem value="principles" icon={<Scale />} shortcut="P">
            Principles
          </CommandItem>
          <CommandItem value="templates" icon={<Compass />}>
            Templates
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem value="light" icon={<Sun />} meta="current">
            Switch to light
          </CommandItem>
          <CommandItem value="dark" icon={<Moon />}>
            Switch to dark
          </CommandItem>
        </CommandGroup>
      </CommandList>
      {/* Nothing on screen otherwise says the arrows move the row or that
          Enter runs it. */}
      <CommandFooter>
        <CommandHint keys={['↑', '↓']}>navigate</CommandHint>
        <CommandHint keys={['↵']}>run</CommandHint>
        <CommandHint keys={['esc']}>close</CommandHint>
      </CommandFooter>
    </Command>
  )
}
