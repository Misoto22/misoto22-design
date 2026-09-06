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

/**
 * A menu of ACTIONS, which is the only thing it is for: rows that navigate
 * belong in a nav, and rows that set a value are a Select or a RadioGroup. Two
 * details are easy to get wrong. icon takes the Lucide component itself —
 * icon={Settings}, never icon={<Settings />} — which is the exact reverse of
 * CommandItem one import away. And the trigger needs asChild with a real
 * Button, or Radix renders an unstyled button of its own and the menu hangs off
 * a control that is not part of the system. The label is a plain div with no
 * role: it groups rows for the eye, and a screen reader walking the menu by
 * role never hears it.
 */
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
