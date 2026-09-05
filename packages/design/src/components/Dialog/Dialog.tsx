'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Radix Dialog root + trigger + close, re-exported as typed passthroughs. */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

/** Title + description stack; renders nothing when both are omitted. */
function DialogHeader({ title, description }: { title?: ReactNode; description?: ReactNode }) {
  if (title === undefined && description === undefined) return null
  return (
    <div className="mb-4 flex flex-col gap-1 pr-8">
      {title !== undefined && (
        <DialogPrimitive.Title className="m-0 font-heading text-[length:var(--fs-item)] font-normal text-(--ink)">
          {title}
        </DialogPrimitive.Title>
      )}
      {description !== undefined && (
        <DialogPrimitive.Description className="m-0 text-sm leading-relaxed text-(--ink-3-aa)">
          {description}
        </DialogPrimitive.Description>
      )}
    </div>
  )
}

export interface DialogContentProps
  extends Omit<ComponentProps<typeof DialogPrimitive.Content>, 'title' | 'className'> {
  /** Heading text. When omitted, a visually-hidden title is rendered for a11y. */
  title?: ReactNode
  /** Sub-heading under the title. */
  description?: ReactNode
  className?: string
  /** Show the top-right close control (default true). */
  showClose?: boolean
}

/**
 * A modal surface: portal → scrim → centred panel.
 *
 * Radix owns the focus trap, the escape key, the scroll lock and the
 * `aria-modal` wiring — all of which a hand-rolled dialog gets subtly wrong,
 * usually by leaving focus behind in the page underneath.
 *
 * Radix requires a `Dialog.Title` whether or not one is shown, so a dialog
 * without a visible heading still renders a hidden one rather than logging a
 * warning and shipping an unnamed modal.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger asChild><Button>Delete</Button></DialogTrigger>
 *   <DialogContent title="Delete file" description="This cannot be undone.">
 *     <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
 *   </DialogContent>
 * </Dialog>
 */
export function DialogContent({
  title,
  description,
  children,
  className,
  showClose = true,
  ...rest
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-m22-animated
        className="fixed inset-0 z-(--z-overlay) bg-(--scrim) data-[state=open]:animate-[m22-fade-in_var(--duration-fast)_var(--ease)]"
      />
      <DialogPrimitive.Content
        data-m22-animated
        className={cn(
          'fixed left-1/2 top-1/2 z-(--z-modal) max-h-[85vh] w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-(--radius-lg) border border-(--rule-2) bg-(--paper) p-6 scroll-slim',
          'data-[state=open]:animate-[m22-panel-in_var(--duration-base)_var(--ease)]',
          className,
        )}
        {...rest}
      >
        <DialogHeader title={title} description={description} />

        {title === undefined && (
          <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
        )}

        {showClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-(--radius-pill) text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)"
          >
            <X size={16} strokeWidth={1.5} aria-hidden />
          </DialogPrimitive.Close>
        )}

        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export default Dialog
