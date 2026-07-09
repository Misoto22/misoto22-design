'use client'

import { clsx } from 'clsx'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Navigation content for the sidebar (e.g. a stack of `NavItem`s). */
  sidebar: ReactNode
  /** Optional content for the sticky topbar, laid out after the mobile toggle. */
  topbar?: ReactNode
  /** Optional brand/logo lockup pinned to the top of the sidebar. */
  brand?: ReactNode
  children: ReactNode
}

const SIDEBAR_ID = 'app-shell-sidebar'

/** Mobile-only hamburger that toggles the off-canvas drawer (44px touch target). */
function MobileToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label="Toggle navigation"
      aria-expanded={open}
      aria-controls={SIDEBAR_ID}
      onClick={onToggle}
      className="md:hidden -ml-2.5 grid size-11 place-items-center rounded-(--radius) text-(--foreground-muted) hover:text-(--foreground) transition-colors duration-200"
    >
      <Menu size={20} aria-hidden />
    </button>
  )
}

/**
 * Admin two-column layout: a fixed sidebar that collapses off-canvas under
 * `md`, plus a sticky topbar and a centered content well. Manages its own mobile
 * drawer state; lifts to a static grid on `md+`.
 *
 * @example
 * <AppShell
 *   brand={<span className="font-heading text-lg">Console</span>}
 *   sidebar={<NavItem href="/" icon={Home} active>Home</NavItem>}
 *   topbar={<SearchBar />}
 * >
 *   <Card>…</Card>
 * </AppShell>
 */
export function AppShell({ sidebar, topbar, brand, children, className, ...rest }: AppShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={clsx(
        'min-h-svh bg-(--background) md:grid md:grid-cols-[15rem_1fr]',
        className,
      )}
      {...rest}
    >
      {/* Scrim — closes the drawer on tap; mobile only, hidden when closed. */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-(--photo-scrim)/30 md:hidden"
        />
      )}

      <aside
        id={SIDEBAR_ID}
        aria-label="Sidebar"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-(--card-background) border-r border-(--border-subtle) transition-transform duration-300 ease-(--ease-out-expo)',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:static md:z-auto md:translate-x-0',
        )}
      >
        {brand && (
          <div className="h-14 flex items-center px-5 border-b border-(--border-subtle)">
            {brand}
          </div>
        )}
        <nav aria-label="Primary" className="flex flex-col gap-1 p-3">
          {sidebar}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-(--page-pad) border-b border-(--border-subtle) bg-(--nav-background) backdrop-blur">
          <MobileToggle open={open} onToggle={() => setOpen((prev) => !prev)} />
          {topbar}
        </header>

        <main className="px-(--page-pad) py-8 max-w-(--w-page) mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
