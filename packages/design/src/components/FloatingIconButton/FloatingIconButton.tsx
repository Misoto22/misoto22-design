'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface FloatingIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Which bottom corner the control is pinned to. */
  position: 'left' | 'right'
  /** Accessible name — the button has no visible text, so this is its only name. */
  label: string
  children: ReactNode
}

/**
 * Full literal class strings per corner. Tailwind only generates classes it can
 * see verbatim in the source, so the side is never interpolated into a string.
 *
 * The left corner sits higher: browser and OS chrome (a download shelf, a
 * status toast) commonly occupies the lower left, and the global scroll action
 * keeps the lower right.
 */
const POSITION_CLASS = { left: 'bottom-20 left-6', right: 'bottom-6 right-6' } as const

/**
 * A round action pinned to a screen corner.
 *
 * A translucent paper ground with a backdrop blur rather than a drop shadow —
 * the White Reset has no elevation ramp, so what separates the control from
 * the page under it is the blur and the hairline, not a glow.
 *
 * @example
 * <FloatingIconButton position="right" label="Back to top" onClick={scrollUp}>
 *   <ArrowUp size={16} />
 * </FloatingIconButton>
 */
export function FloatingIconButton({
  position,
  label,
  children,
  className,
  ...rest
}: FloatingIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'fixed z-(--z-drawer) flex size-11 items-center justify-center rounded-(--radius-pill) border border-(--rule-2) bg-(--paper)/90 text-(--ink-2) backdrop-blur-sm transition-colors duration-(--duration-fast) hover:border-(--ink) hover:text-(--ink)',
        POSITION_CLASS[position],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export default FloatingIconButton
