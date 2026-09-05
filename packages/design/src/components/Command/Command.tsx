'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Dialog, DialogContent } from '../Dialog/Dialog'
import { Kbd } from '../Kbd/Kbd'

/**
 * A filterable list of actions — the ⌘K surface.
 *
 * Built on cmdk rather than on a `Select` or a menu, because the interaction is
 * neither: the list is filtered as you type, the highlighted row moves with the
 * arrow keys while focus STAYS in the input, and Enter runs the highlighted
 * row. That is the ARIA combobox pattern, and it is the part nobody should
 * hand-roll — `aria-activedescendant` moving without focus moving is precisely
 * where a home-made palette stops working with a screen reader.
 *
 * @example
 * <Command label="Command palette">
 *   <CommandInput placeholder="Type a command…" />
 *   <CommandList>
 *     <CommandEmpty>Nothing matches.</CommandEmpty>
 *     <CommandGroup heading="Navigate">
 *       <CommandItem onSelect={go}>Components</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 */
export function Command({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-(--radius) border border-(--rule-2) bg-(--paper)',
        className,
      )}
      {...props}
    />
  )
}

/** The filter field. Carries the search icon and the combobox semantics. */
export function CommandInput({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-2.5 border-b border-(--rule) px-3.5">
      <Search size={16} strokeWidth={1.5} aria-hidden className="shrink-0 text-(--ink-3-aa)" />
      <CommandPrimitive.Input
        className={cn(
          'h-11 w-full bg-transparent text-sm text-(--ink) outline-none placeholder:text-(--ink-3-aa)',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function CommandList({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn('max-h-72 overflow-y-auto overflow-x-hidden p-1.5 scroll-slim', className)}
      {...props}
    />
  )
}

/** Shown when the filter matches nothing. Say what would match, not "no results". */
export function CommandEmpty(props: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className="px-3 py-8 text-center text-sm text-(--ink-3-aa)"
      {...props}
    />
  )
}

export function CommandGroup({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        'overflow-hidden [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:text-(--ink-3-aa)',
        className,
      )}
      {...props}
    />
  )
}

/**
 * A divider between groups.
 *
 * Marked presentational, because ARIA permits a `listbox` to contain only
 * `option` and `group` — and the library renders this as `role="separator"`,
 * which puts a critical `aria-required-children` violation inside every palette
 * that uses one. The grouping is already announced by the groups themselves, so
 * removing the divider from the accessibility tree loses nothing.
 */
export function CommandSeparator({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      role="presentation"
      aria-hidden="true"
      className={cn('my-1 h-px bg-(--rule)', className)}
      {...props}
    />
  )
}

export interface CommandItemProps extends ComponentProps<typeof CommandPrimitive.Item> {
  /** A shortcut printed at the end of the row. */
  shortcut?: string
}

export function CommandItem({ shortcut, className, children, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-(--radius-sm) px-2.5 py-2 text-sm text-(--ink-2) outline-none transition-colors duration-(--duration-fast) data-[selected=true]:bg-(--stone) data-[selected=true]:text-(--ink) data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-(--disabled-opacity)',
        className,
      )}
      {...props}
    >
      {children}
      {shortcut && <Kbd className="ms-auto">{shortcut}</Kbd>}
    </CommandPrimitive.Item>
  )
}

export interface CommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Names the palette for assistive tech. */
  label: string
  children: ReactNode
}

/**
 * The palette in a modal, which is how it is nearly always used.
 *
 * The dialog's own padding is removed: a palette is edge-to-edge, and its input
 * is the first thing focus lands on.
 */
export function CommandDialog({ open, onOpenChange, label, children }: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={label}
        hideTitle
        showClose={false}
        className="w-[min(92vw,34rem)] overflow-hidden p-0"
      >
        <Command label={label} className="rounded-none border-0">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export default Command
