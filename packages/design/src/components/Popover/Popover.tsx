'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/** Radix Popover root, trigger, anchor and close, as typed passthroughs. */
export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverAnchor = PopoverPrimitive.Anchor
export const PopoverClose = PopoverPrimitive.Close

export interface PopoverContentProps
  extends ComponentProps<typeof PopoverPrimitive.Content> {
  /** Names the panel for assistive tech. Required — a popover is a dialog. */
  label: string
  /** Show the top-end close control. */
  showClose?: boolean
}

/**
 * A panel anchored to a control, holding content the reader can interact with.
 *
 * The line against `Tooltip` is not visual, it is behavioural: a tooltip
 * describes and cannot be entered; a popover holds things you tab to. Anything
 * with a link, a field or a button in it is a popover, and putting that inside
 * a tooltip makes it unreachable — the tooltip closes as soon as focus tries to
 * move into it.
 *
 * Against `DropdownMenu`: a menu is a list of actions with menu semantics and
 * arrow-key navigation. A popover is free-form, and its contents Tab like the
 * rest of the page.
 *
 * @example
 * <Popover>
 *   <PopoverTrigger asChild><Button variant="secondary">Filters</Button></PopoverTrigger>
 *   <PopoverContent label="Filters">
 *     <Field label="Status"><Select>…</Select></Field>
 *   </PopoverContent>
 * </Popover>
 */
export function PopoverContent({
  label,
  showClose = false,
  className,
  sideOffset = 8,
  children,
  ...rest
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        aria-label={label}
        sideOffset={sideOffset}
        data-m22-animated
        className={cn(
          'z-(--z-dropdown) w-72 rounded-(--radius) border border-(--rule-2) bg-(--paper) p-4',
          'data-[state=open]:animate-[m22-panel-in_var(--duration-fast)_var(--ease)]',
          className,
        )}
        {...rest}
      >
        {children}
        {showClose && (
          <PopoverPrimitive.Close
            aria-label="Close"
            className="absolute end-2 top-2 grid size-8 place-items-center rounded-(--radius-pill) text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)"
          >
            <X size={14} strokeWidth={1.5} aria-hidden />
          </PopoverPrimitive.Close>
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

export default Popover
