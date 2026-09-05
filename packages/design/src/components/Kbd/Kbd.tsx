import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

/**
 * A key on a keyboard, set as one.
 *
 * Renders a `<kbd>`, which is the element that means this — a `<span>` styled
 * to look like a key tells a screen reader nothing. Sized in `em` so it tracks
 * whatever type it sits beside rather than fixing itself at one px value, which
 * is how the same shortcut ended up three different sizes across a page.
 *
 * @example
 * Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the palette.
 */
export function Kbd({ children, className, ...rest }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-[1.6em] items-center justify-center rounded-(--radius-sm) border border-(--rule-2) px-[0.4em] py-[0.1em] font-mono text-[0.8em] leading-[1.6] text-(--ink-2)',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  )
}

export default Kbd
