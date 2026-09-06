'use client'

import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from '@misoto22/design'
import { Copy, Download, MoreHorizontal, Trash2, type LucideIcon } from 'lucide-react'

interface Action {
  label: string
  icon: LucideIcon
  destructive?: boolean
}

const ACTIONS: Action[] = [
  { label: 'Copy link', icon: Copy },
  { label: 'Download original', icon: Download },
  { label: 'Delete', icon: Trash2, destructive: true },
]

/**
 * One array of actions, two doors into it. ContextMenuItem and DropdownMenuItem
 * take identical icon, destructive and disabled props, so the same list feeds
 * both and the right-click becomes the shortcut rather than the only way in —
 * which matters because a touch user, a trackpad user and a keyboard user may
 * have no way to open a context menu at all. Write the list once: two hand-kept
 * copies is how the overflow button ends up missing the action somebody added
 * to the right-click.
 */
export function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-(--radius) border border-(--rule) px-4 py-3">
          <Text size="sm" tone="strong" className="font-mono">
            kyoto-february.tif
          </Text>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button iconOnly aria-label="Actions for kyoto-february.tif" variant="ghost" size="sm">
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ACTIONS.map((action) => (
                <DropdownMenuItem key={action.label} icon={action.icon} destructive={action.destructive}>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {ACTIONS.map((action) => (
          <ContextMenuItem key={action.label} icon={action.icon} destructive={action.destructive}>
            {action.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
