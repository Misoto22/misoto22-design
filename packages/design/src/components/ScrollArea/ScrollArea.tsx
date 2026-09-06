'use client'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export interface ScrollAreaProps extends ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /**
   * Names the region. Required, and not decoration: a scroll container is a
   * keyboard stop, and an unnamed stop announces "group" and nothing else.
   */
  label: string
  /**
   * Which axes get a bar — and therefore which axes scroll at all. Radix sets
   * the viewport's overflow from the bars that are mounted, so an axis without
   * one is `hidden`: what is past that edge is not merely unmarked, it is
   * unreachable by every key and every gesture.
   *
   * `both` is the default for that reason. Narrow it only when clipping the
   * other axis is the thing you meant.
   */
  orientation?: 'vertical' | 'horizontal' | 'both'
}

/**
 * A box that scrolls, with a scrollbar that looks the same on every platform.
 *
 * The reason to reach for this over `overflow-auto` is not the scrollbar — it
 * is that Radix keeps the viewport focusable and the bar operable, which a bare
 * overflow container does not. A scrollable region whose contents are not
 * themselves focusable is unreachable by keyboard: there is nothing to Tab to,
 * so everything past the fold does not exist without a mouse.
 *
 * For a page-level or prose scroll, the `scroll-slim` utility is lighter and
 * needs no component. This is for a bounded panel: a long option list, a log,
 * a sidebar that outgrows its column.
 *
 * Both axes scroll unless a caller says otherwise. The old vertical default
 * read as a statement about which bar to draw and was in fact a statement about
 * which half of the content existed: Radix sets the viewport's overflow from
 * the mounted bars, so the axis without one was `hidden` and everything past it
 * was unreachable — silently, and with the content perfectly well rendered.
 *
 * @example
 * <ScrollArea label="Deploy log" className="h-48">…</ScrollArea>
 */
export function ScrollArea({
  label,
  orientation = 'both',
  className,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      type="hover"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        tabIndex={0}
        role="region"
        aria-label={label}
        // Positioned, so an absolutely-positioned descendant — an `sr-only`
        // label, a pinned marker — resolves against the thing that scrolls and
        // travels with the content, rather than against the root and hanging
        // still over it.
        className="relative size-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(orientation === 'vertical' || orientation === 'both') && <Bar orientation="vertical" />}
      {(orientation === 'horizontal' || orientation === 'both') && <Bar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function Bar({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      orientation={orientation}
      className={cn(
        'flex touch-none select-none p-0.5 transition-colors duration-(--duration-fast)',
        orientation === 'vertical' ? 'h-full w-2' : 'h-2 flex-col',
      )}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-(--radius-pill) bg-(--rule-2)" />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export default ScrollArea
