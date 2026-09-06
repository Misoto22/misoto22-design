'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Radix Dialog root, trigger and close — a sheet IS a dialog, docked. */
export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export type SheetSide = 'start' | 'end' | 'top' | 'bottom'

/**
 * Full literal class strings per edge, because Tailwind only generates what it
 * can see verbatim. The inline sides are named in READING order, so a sheet
 * docked to `end` comes from the right in English and the left in Arabic.
 */
const SIDE: Record<SheetSide, string> = {
  start:
    'inset-y-0 start-0 h-full w-[min(24rem,92vw)] border-e data-[state=closed]:-translate-x-full rtl:data-[state=closed]:translate-x-full',
  end: 'inset-y-0 end-0 h-full w-[min(24rem,92vw)] border-s data-[state=closed]:translate-x-full rtl:data-[state=closed]:-translate-x-full',
  top: 'inset-x-0 top-0 w-full max-h-[85vh] border-b data-[state=closed]:-translate-y-full',
  bottom:
    'inset-x-0 bottom-0 w-full max-h-[85vh] border-t data-[state=closed]:translate-y-full',
}

export interface SheetContentProps
  extends Omit<ComponentProps<typeof DialogPrimitive.Content>, 'title'> {
  /** Which edge it is docked to. `end` by default. */
  side?: SheetSide
  title: ReactNode
  description?: ReactNode
  /** Hide the title visually while keeping it for assistive tech. */
  hideTitle?: boolean
}

/**
 * A panel docked to an edge of the viewport.
 *
 * It is a modal dialog — Radix's, so the focus trap, the escape key, the scroll
 * lock and the `aria-modal` wiring are the same ones `Dialog` gets. The only
 * differences are where it sits and which way it arrives, which is why this
 * shares that implementation rather than reproducing it: a second focus trap is
 * a second focus trap to get wrong.
 *
 * The title is required, visible or not. A modal with no accessible name drops
 * a screen reader into an unnamed region with no way back out.
 *
 * @example
 * <Sheet>
 *   <SheetTrigger asChild><Button variant="secondary">Filters</Button></SheetTrigger>
 *   <SheetContent title="Filters" description="Narrow the list.">…</SheetContent>
 * </Sheet>
 */
export function SheetContent({
  side = 'end',
  title,
  description,
  hideTitle = false,
  className,
  children,
  ...rest
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-m22-animated
        className="fixed inset-0 z-(--z-overlay) bg-(--scrim) data-[state=open]:animate-[m22-fade-in_var(--duration-fast)_var(--ease)]"
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-(--z-modal) flex flex-col overflow-y-auto border-(--panel-border) bg-(--panel-bg) p-6 panel-blur transition-transform duration-(--duration-slow) ease-(--ease-out-expo) scroll-slim',
          SIDE[side],
          className,
        )}
        {...rest}
      >
        <div className={cn('mb-4 flex flex-col gap-1 pe-8', hideTitle && 'sr-only')}>
          <DialogPrimitive.Title className="m-0 font-heading text-[length:var(--fs-item)] font-normal text-(--ink)">
            {title}
          </DialogPrimitive.Title>
          {description !== undefined && (
            <DialogPrimitive.Description className="m-0 text-sm leading-relaxed text-(--ink-3-aa)">
              {description}
            </DialogPrimitive.Description>
          )}
        </div>

        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute end-3 top-3 grid size-9 place-items-center rounded-(--radius-pill) text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)"
        >
          <X size={16} strokeWidth={1.5} aria-hidden />
        </DialogPrimitive.Close>

        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export default Sheet
