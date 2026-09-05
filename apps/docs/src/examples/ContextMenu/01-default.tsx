'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@misoto22/design'
import { Copy, Download, Trash2 } from 'lucide-react'

export function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="grid h-28 w-full max-w-sm place-items-center rounded-(--radius) border border-dashed border-(--rule-2) text-sm text-(--ink-3-aa)">
          Right-click anywhere in this box
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Frame</ContextMenuLabel>
        <ContextMenuItem icon={Copy}>Copy link</ContextMenuItem>
        <ContextMenuItem icon={Download}>Download original</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem icon={Trash2} destructive>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
