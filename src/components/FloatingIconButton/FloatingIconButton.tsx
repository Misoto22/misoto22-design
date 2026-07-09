'use client'

import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface FloatingIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  position: 'left' | 'right'
  label: string
  onClick: () => void
  children: ReactNode
}

const POSITION_CLASS = { left: 'left-6', right: 'right-6' } as const

/**
 * Fixed, frosted round icon button anchored to a bottom corner — for back-to-top
 * or quick-action affordances. Pass a lucide icon as `children`.
 *
 * @example
 * <FloatingIconButton position="right" label="Back to top" onClick={scrollUp}>
 *   <ArrowUp className="w-4 h-4" />
 * </FloatingIconButton>
 */
export function FloatingIconButton({
  position,
  label,
  onClick,
  children,
  className,
  ...rest
}: FloatingIconButtonProps) {
  return (
    <button
      {...rest}
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(
        'fixed bottom-6',
        POSITION_CLASS[position],
        'z-40 h-11 w-11 rounded-(--radius-pill) border border-(--border-color) bg-(--background)/90 backdrop-blur-sm text-(--foreground) shadow-(--shadow-sm) hover:border-(--accent) hover:text-(--accent) transition-colors duration-300 flex items-center justify-center',
        className,
      )}
    >
      {children}
    </button>
  )
}

export default FloatingIconButton
