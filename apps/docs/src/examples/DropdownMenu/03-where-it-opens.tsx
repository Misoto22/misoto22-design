'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@misoto22/design'
import { ArrowDownUp, Filter, Rows3, SlidersHorizontal, Table2 } from 'lucide-react'

/**
 * Two menus at the two ends of a toolbar, each aligned to the edge it sits on.
 * align decides which side of the trigger the panel lines up with, and the
 * panel is at least 11rem wide — so a menu at the end edge left on the default
 * center opens back across its own trigger and then gets shoved by the 8px
 * collision padding. side flips the whole panel above when there is no room
 * below, which is also what happens to a long menu: there is no maximum height
 * here, so it grows until it collides. Past about a dozen rows the list has
 * stopped being scannable, and the answer is a SearchableMenu — the same rows
 * with a filter over them — not a submenu.
 */
export function Example() {
  return (
    <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-(--radius) border border-(--rule) p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Filter size={16} strokeWidth={1.5} aria-hidden /> Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem icon={Rows3}>Failed runs only</DropdownMenuItem>
          <DropdownMenuItem icon={Table2}>Main branch only</DropdownMenuItem>
          <DropdownMenuItem icon={SlidersHorizontal}>Longer than two minutes</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <ArrowDownUp size={16} strokeWidth={1.5} aria-hidden /> Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Newest first</DropdownMenuItem>
          <DropdownMenuItem>Longest first</DropdownMenuItem>
          <DropdownMenuItem>Branch, A to Z</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
