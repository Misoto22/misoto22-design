'use client'

import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
} from '@misoto22/design'
import { useEffect, useState } from 'react'

export function Example() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Somebody else already claimed it — a host application's own palette, or
      // this documentation site's. Two palettes on one ⌘K is two dialogs
      // stacked, and the reader has to dismiss one to find the other.
      if (event.defaultPrevented) return
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open the palette
      </Button>
      <p className="m-0 text-sm text-(--ink-3-aa)">
        or press <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </p>
      <CommandDialog open={open} onOpenChange={setOpen} label="Command palette">
        <CommandInput placeholder="Type a command…" />
        <CommandList>
          <CommandEmpty>No command matches that.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem value="components" onSelect={() => setOpen(false)}>Components</CommandItem>
            <CommandItem value="principles" onSelect={() => setOpen(false)}>Principles</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
