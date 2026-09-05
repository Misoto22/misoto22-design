import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Join class names, and let the LAST one win.
 *
 * Every component in this package ends its class list with the caller's
 * `className`, which is the only way an override is expressible. With plain
 * `clsx` that override does not actually override: `clsx('px-6', 'px-2')` emits
 * both, and which one applies is decided by the order Tailwind happened to emit
 * the two utilities into the stylesheet — not by the call site. A caller
 * tightening a button's padding therefore worked or did not depending on a
 * detail neither side can see.
 *
 * `twMerge` resolves conflicts by utility GROUP, so `px-2` replaces `px-6`,
 * `text-(--ink-2)` replaces `text-(--ink)`, and unrelated classes are left
 * alone. Use this everywhere a caller's `className` is merged; `clsx` alone is
 * still right for building a conditional list that no caller extends.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
