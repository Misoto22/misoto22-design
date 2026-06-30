import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Button,
} from '@misoto22/design'
import { Pencil, Copy, Lock, Trash2, MoreHorizontal } from 'lucide-react'

export function PostActions() {
  return (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <MoreHorizontal size={16} />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Manage post</DropdownMenuLabel>
        <DropdownMenuItem icon={Pencil}>Edit</DropdownMenuItem>
        <DropdownMenuItem icon={Copy}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem icon={Lock}>Make private</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={Trash2}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
