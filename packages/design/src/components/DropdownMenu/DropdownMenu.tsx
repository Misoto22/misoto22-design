'use client'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { useOverlayContainer } from '../../lib/overlay-container'

/** Radix DropdownMenu root + trigger, re-exported as typed passthroughs. */
export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export type DropdownMenuContentProps = ComponentProps<typeof DropdownMenuPrimitive.Content>

/**
 * A menu surface.
 *
 * A menu is a list of ACTIONS. If the items navigate somewhere, they belong in
 * a nav; if they set a value, that is a `Select` or a `RadioGroup` — Radix has
 * menu variants for both, and a plain item pretending to be a choice loses the
 * checked state a screen reader needs.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild><Button variant="secondary">Menu</Button></DropdownMenuTrigger>
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
  const container = useOverlayContainer()

  return (
    <DropdownMenuPrimitive.Portal container={container ?? undefined}>
      <DropdownMenuPrimitive.Content
        collisionBoundary={container ?? undefined}
        collisionPadding={8}
        sideOffset={sideOffset}
        data-m22-animated
        className={cn(
          'z-(--z-dropdown) min-w-44 rounded-(--radius) border border-(--rule-2) bg-(--paper) p-1.5',
          'data-[state=open]:animate-[m22-panel-in_var(--duration-fast)_var(--ease)]',
          className,
        )}
        {...rest}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

export interface DropdownMenuItemProps extends ComponentProps<typeof DropdownMenuPrimitive.Item> {
  /** Optional leading icon, rendered before the label. */
  icon?: LucideIcon
  /** Paints the row as destructive. Use for delete, revoke, disconnect. */
  destructive?: boolean
}

/**
 * A menu row.
 *
 * Highlight is driven by Radix's `data-highlighted`, which covers both pointer
 * hover and keyboard focus — styling `:hover` alone leaves the keyboard user
 * unable to see where they are.
 */
export function DropdownMenuItem({
  icon: Icon,
  destructive = false,
  className,
  children,
  ...rest
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-(--radius-sm) px-2.5 py-2 text-sm outline-none transition-colors duration-(--duration-fast) data-[highlighted]:bg-(--stone) data-[disabled]:pointer-events-none data-[disabled]:opacity-(--disabled-opacity)',
        destructive ? 'text-(--danger)' : 'text-(--ink-2) data-[highlighted]:text-(--ink)',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={16} strokeWidth={1.5} className="shrink-0" aria-hidden />}
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
      className={cn('my-1 h-px bg-(--rule)', className)}
      {...rest}
    />
  )
}

/** Mono eyebrow heading for a group of items. */
export function DropdownMenuLabel({
  className,
  ...rest
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn('px-2.5 py-1.5 eyebrow text-(--ink-3-aa)', className)}
      {...rest}
    />
  )
}

export default DropdownMenu
