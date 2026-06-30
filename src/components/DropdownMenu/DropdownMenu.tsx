'use client'

import { clsx } from 'clsx'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

/** Radix DropdownMenu root + trigger, re-exported as typed passthroughs. */
export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export type DropdownMenuContentProps = ComponentProps<typeof DropdownMenuPrimitive.Content>

/**
 * Token-styled dropdown surface (portal → content). Defaults `sideOffset` to 6.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild><Button>Menu</Button></DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuLabel>Account</DropdownMenuLabel>
 *     <DropdownMenuItem icon={Settings}>Settings</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem icon={LogOut}>Sign out</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
export function DropdownMenuContent({
  className,
  sideOffset = 6,
  children,
  ...rest
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={clsx(
          'z-50 min-w-44 rounded-(--radius) border border-(--border-color) bg-(--card-background) shadow-(--shadow-lg) p-1.5 data-[state=open]:animate-[fadeIn_120ms]',
          className,
        )}
        {...rest}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

export interface DropdownMenuItemProps
  extends ComponentProps<typeof DropdownMenuPrimitive.Item> {
  /** Optional leading icon, rendered before the label. */
  icon?: LucideIcon
}

/** Highlightable menu row that warms to the accent wash on hover/keyboard focus. */
export function DropdownMenuItem({
  icon: Icon,
  className,
  children,
  ...rest
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={clsx(
        'flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-(--radius-sm) text-(--foreground) cursor-pointer outline-none data-[highlighted]:bg-(--accent-wash) data-[highlighted]:text-(--accent) transition-colors',
        className,
      )}
      {...rest}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      {children}
    </DropdownMenuPrimitive.Item>
  )
}

/** Hairline divider between menu groups. */
export function DropdownMenuSeparator({
  className,
  ...rest
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={clsx('my-1 h-px bg-(--border-subtle)', className)}
      {...rest}
    />
  )
}

/** Mono eyebrow heading for a group of menu items. */
export function DropdownMenuLabel({
  className,
  ...rest
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={clsx('px-2.5 py-1.5 eyebrow text-(--secondary-text)', className)}
      {...rest}
    />
  )
}

export default DropdownMenu
