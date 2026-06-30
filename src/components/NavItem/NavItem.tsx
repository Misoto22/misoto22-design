import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

export interface NavItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> {
  href: string
  /** Optional leading icon (a lucide-react component, rendered at size 18). */
  icon?: LucideIcon
  /** Marks the current route — fills with the accent wash. */
  active?: boolean
  children: ReactNode
  className?: string
}

/**
 * Sidebar navigation link. Framework-agnostic — renders a native `<a>`, so wrap
 * it with your router's Link at the call site for client-side navigation.
 * Server-component friendly (no client boundary).
 *
 * @example
 * <NavItem href="/orders" icon={Package} active>
 *   Orders
 * </NavItem>
 */
export function NavItem({
  href,
  icon: Icon,
  active = false,
  children,
  className,
  ...rest
}: NavItemProps) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-(--radius) text-sm transition-colors duration-200',
        active
          ? 'bg-(--accent-muted) text-(--accent) font-medium'
          : 'text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--accent-wash)',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={18} />}
      {children}
    </a>
  )
}

export default NavItem
