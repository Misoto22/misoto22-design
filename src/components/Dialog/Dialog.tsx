'use client'

import { clsx } from 'clsx'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'

/** Radix Dialog root + trigger + close, re-exported as typed passthroughs. */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

/** Inline sr-only — Radix requires a Dialog.Title even when none is shown. */
const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
}

/** Title + description stack; renders nothing when both are omitted. */
function DialogHeader({ title, description }: { title?: ReactNode; description?: ReactNode }) {
  if (title === undefined && description === undefined) return null
  return (
    <div className="mb-4 flex flex-col gap-1 pr-8">
      {title !== undefined ? (
        <DialogPrimitive.Title className="font-heading text-xl text-(--foreground)">
          {title}
        </DialogPrimitive.Title>
      ) : null}
      {description !== undefined ? (
        <DialogPrimitive.Description className="text-sm text-(--secondary-text)">
          {description}
        </DialogPrimitive.Description>
      ) : null}
    </div>
  )
}

type DialogContentBaseProps = Omit<
  ComponentProps<typeof DialogPrimitive.Content>,
  'title' | 'className'
>

export interface DialogContentProps extends DialogContentBaseProps {
  /** Heading text. When omitted, a hidden title is rendered for a11y. */
  title?: ReactNode
  /** Sub-heading under the title. */
  description?: ReactNode
  className?: string
  /** Show the top-right close button (default true). */
  showClose?: boolean
}

/**
 * Token-styled dialog surface: portal → scrim overlay → centered card. Pair with
 * {@link Dialog}, {@link DialogTrigger}, and {@link DialogClose}.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
 *   <DialogContent title="Delete file" description="This cannot be undone.">
 *     <p>Are you sure?</p>
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
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-overlay) bg-(--overlay) backdrop-blur-sm data-[state=open]:animate-[fadeIn_150ms]" />
      <DialogPrimitive.Content
        className={clsx(
          'fixed left-1/2 top-1/2 z-(--z-modal) -translate-x-1/2 -translate-y-1/2 w-[min(92vw,32rem)] max-h-[85vh] overflow-auto rounded-(--radius-lg) border border-(--border-color) bg-(--card-background) shadow-(--shadow-lg) p-6',
          className,
        )}
        {...rest}
      >
        <DialogHeader title={title} description={description} />

        {title === undefined ? (
          <span style={SR_ONLY}>
            <DialogPrimitive.Title>Dialog</DialogPrimitive.Title>
          </span>
        ) : null}

        {showClose ? (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-4 top-4 text-(--secondary-text) hover:text-(--foreground) transition-colors rounded-(--radius-sm) p-1"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        ) : null}

        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export default Dialog
