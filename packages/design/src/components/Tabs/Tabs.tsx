'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/** Radix Tabs root, re-exported as a typed passthrough. */
export const Tabs = TabsPrimitive.Root

/**
 * The tab strip.
 *
 * Scrolls horizontally rather than wrapping. A wrapped second row of tabs moves
 * every tab below it when the strip grows, and the reader loses the one they
 * were about to click.
 *
 * @example
 * <Tabs defaultValue="preview">
 *   <TabsList>
 *     <TabsTrigger value="preview">Preview</TabsTrigger>
 *     <TabsTrigger value="code">Code</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="preview">…</TabsContent>
 * </Tabs>
 */
export function TabsList({ className, ...rest }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        // `overflow-y-hidden` is not decoration. A strip only ever scrolls
        // sideways, but `overflow-x: auto` on its own computes `overflow-y` to
        // `auto` as well — and the active trigger's `-mb-px` rule leaves the
        // content exactly one pixel taller than the box, which is enough for a
        // vertical scrollbar to appear beside a row of tabs that has nothing
        // to scroll.
        'flex items-center overflow-x-auto overflow-y-hidden gap-1 border-b border-(--rule-2) scroll-slim',
        className,
      )}
      {...rest}
    />
  )
}

/**
 * One tab.
 *
 * The active marker is a 2px ink rule pulled onto the strip's own border with
 * `-mb-px`, so the two occupy the same line instead of stacking into a 3px
 * edge. 44px tall, because a tab is a pointer target like any other.
 */
export function TabsTrigger({ className, ...rest }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        '-mb-px min-h-(--control-h-md) shrink-0 whitespace-nowrap border-b-2 border-transparent px-3.5 py-2 text-sm text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:text-(--ink) data-[state=active]:border-(--accent) data-[state=active]:text-(--accent-on-muted)',
        className,
      )}
      {...rest}
    />
  )
}

/** The panel paired to a {@link TabsTrigger} by matching `value`. */
export function TabsContent({ className, ...rest }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-m22-animated
      className={cn('pt-5 data-[state=active]:animate-[m22-panel-in_var(--duration-fast)_var(--ease)]', className)}
      {...rest}
    />
  )
}

export default Tabs
