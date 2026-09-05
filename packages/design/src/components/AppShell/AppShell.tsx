'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Navigation content for the sidebar (e.g. a stack of `NavItem`s). */
  sidebar: ReactNode
  /** Optional content for the sticky topbar, laid out after the mobile toggle. */
  topbar?: ReactNode
  /** Optional brand lockup pinned to the top of the sidebar. */
  brand?: ReactNode
  /**
   * Which element the content well renders as.
   *
   * `main` is right for the shell of an application, and is the default. A
   * document may contain exactly one `main` landmark, so an AppShell rendered
   * INSIDE another page — a preview on a documentation site, a screenshot
   * harness — must pass `div`, or the page has two and assistive tech can no
   * longer answer "where is the content".
   */
  contentAs?: 'main' | 'div'
  children: ReactNode
}

/**
 * Two columns on a desktop, one column and a drawer on a phone.
 *
 * The drawer closes on Escape as well as on the scrim, because a drawer that
 * only closes by tapping outside it strands a keyboard user inside a menu they
 * cannot leave. The scrim is a `<button>` for the same reason — a `<div>` with
 * an `onClick` is not reachable by keyboard and not announced as anything.
 *
 * @example
 * <AppShell brand={<Wordmark />} sidebar={<NavItem href="/">Home</NavItem>}>
 *   <Card>…</Card>
 * </AppShell>
 */
export function AppShell({
  sidebar,
  topbar,
  brand,
  contentAs: Content = 'main',
  children,
  className,
  ...rest
}: AppShellProps) {
  const [open, setOpen] = useState(false)
  const sidebarId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div
      className={cn('min-h-svh bg-(--paper) md:grid md:grid-cols-[15rem_1fr]', className)}
      {...rest}
    >
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-(--z-scrim) bg-(--scrim) md:hidden"
        />
      )}

      <aside
        id={sidebarId}
        aria-label="Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-(--z-modal) flex w-60 flex-col border-r border-(--rule) bg-(--paper) transition-transform duration-(--duration-slow) ease-(--ease-out-expo)',
          open ? 'translate-x-0' : '-translate-x-full',
          'md:static md:z-auto md:translate-x-0',
        )}
      >
        {brand && (
          <div className="flex h-14 items-center border-b border-(--rule) px-5">{brand}</div>
        )}
        <nav
          aria-label="Primary"
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 scroll-slim"
        >
          {sidebar}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center gap-3 border-b border-(--rule) bg-(--paper)/85 px-(--page-pad) backdrop-blur">
          <button
            type="button"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls={sidebarId}
            onClick={() => setOpen((previous) => !previous)}
            className="-ml-2.5 grid size-11 place-items-center rounded-(--radius) text-(--ink-2) transition-colors duration-(--duration-fast) hover:text-(--ink) md:hidden"
          >
            {open ? <X size={20} strokeWidth={1.5} aria-hidden /> : <Menu size={20} strokeWidth={1.5} aria-hidden />}
          </button>
          {topbar}
        </header>

        <Content className="mx-auto w-full max-w-(--w-page) px-(--page-pad) py-8">{children}</Content>
      </div>
    </div>
  )
}

export default AppShell
