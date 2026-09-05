'use client'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { useOverlayContainer } from '../../lib/overlay-container'

/** Radix ContextMenu root and trigger, as typed passthroughs. */
export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger

/**
 * The menu a right-click opens.
 *
 * Never the only way to reach an action. A context menu is opened by a
 * secondary pointer button or a keyboard's own menu key, and a meaningful share
 * of readers have neither — a touch user, someone on a trackpad they have not
 * configured, anyone driving the page by keyboard alone. Whatever is in here
 * belongs somewhere reachable too: a row's overflow button, a toolbar.
 *
 * @example
 * <ContextMenu>
 *   <ContextMenuTrigger asChild><Card>Right-click me</Card></ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem icon={Copy}>Copy</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 */
export function ContextMenuContent({
  className,
  ...rest
}: ComponentProps<typeof ContextMenuPrimitive.Content>) {
  const container = useOverlayContainer()

  return (
    <ContextMenuPrimitive.Portal container={container ?? undefined}>
      <ContextMenuPrimitive.Content
        collisionBoundary={container ?? undefined}
        collisionPadding={8}
        data-m22-animated
        className={cn(
          'z-(--z-dropdown) min-w-44 rounded-(--radius) border border-(--rule-2) bg-(--paper) p-1.5',
          'data-[state=open]:animate-[m22-pop-in_var(--duration-fast)_var(--ease-out-expo)] data-[state=closed]:animate-[m22-pop-out_var(--duration-fast)_var(--ease)] origin-(--radix-popper-transform-origin)',
          className,
        )}
        {...rest}
      />
    </ContextMenuPrimitive.Portal>
  )
}

export interface ContextMenuItemProps
  extends ComponentProps<typeof ContextMenuPrimitive.Item> {
  icon?: LucideIcon
  destructive?: boolean
}

/** A row. Highlight follows `data-highlighted`, which covers hover and keyboard. */
export function ContextMenuItem({
  icon: Icon,
  destructive = false,
  className,
  children,
  ...rest
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-(--radius-sm) px-2.5 py-2 text-sm outline-none transition-colors duration-(--duration-fast) data-[highlighted]:bg-(--stone) data-[disabled]:pointer-events-none data-[disabled]:opacity-(--disabled-opacity)',
        destructive ? 'text-(--danger)' : 'text-(--ink-2) data-[highlighted]:text-(--ink)',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={16} strokeWidth={1.5} className="shrink-0" aria-hidden />}
      {children}
    </ContextMenuPrimitive.Item>
  )
}

/** Hairline divider between groups. */
export function ContextMenuSeparator({
  className,
  ...rest
}: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator className={cn('my-1 h-px bg-(--rule)', className)} {...rest} />
  )
}

/** Mono eyebrow heading for a group. */
export function ContextMenuLabel({
  className,
  ...rest
}: ComponentProps<typeof ContextMenuPrimitive.Label>) {
  return (
    <ContextMenuPrimitive.Label
      className={cn('px-2.5 py-1.5 eyebrow text-(--ink-3-aa)', className)}
      {...rest}
    />
  )
}

export default ContextMenu
