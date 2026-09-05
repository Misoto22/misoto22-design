'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@misoto22/design'
import { LogOut, Settings, Trash2 } from 'lucide-react'

export function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Signed in</DropdownMenuLabel>
        <DropdownMenuItem icon={Settings}>Settings</DropdownMenuItem>
        <DropdownMenuItem icon={LogOut}>Sign out</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={Trash2} destructive>Delete account</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
