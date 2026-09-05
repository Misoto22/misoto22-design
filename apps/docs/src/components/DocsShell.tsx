'use client'

import { Button, Kbd, Separator, TooltipProvider } from '@misoto22/design'
import { Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { AccentMenu } from './AccentMenu'
import { CommandPalette } from './CommandPalette'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

/**
 * The frame every page sits in: a fixed sidebar on a desktop, a drawer under
 * `lg`, and one scrolling content column.
 *
 * Not `AppShell` from the package, deliberately. `AppShell` is the admin-console
 * layout — a topbar plus a content well — and this site needs a documentation
 * layout, with its own drawer behaviour and a sidebar that owns a search field.
 * Bending one into the other would have added props to `AppShell` that exist
 * only to serve this site, which is exactly what DESIGN-ARCH-001 forbids.
 * Everything INSIDE the frame is the package's own components.
 */
export function DocsShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on navigation: a drawer left open over the page the reader just asked
  // for is the most common mobile-nav bug.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <TooltipProvider>
      <CommandPalette />
    <div className="min-h-svh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-toast) focus:rounded-(--radius) focus:bg-(--ink) focus:px-4 focus:py-2 focus:text-sm focus:text-(--paper)"
      >
        Skip to content
      </a>

      {open && (
        <button
          type="button"
          aria-label="Close the navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-(--z-scrim) bg-(--scrim) lg:hidden"
        />
      )}

      <aside
        id="docs-sidebar"
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-(--z-modal) flex w-[17rem] flex-col gap-5 border-r border-(--rule) bg-(--paper) px-4 py-5 transition-transform duration-(--duration-slow) ease-(--ease-out-expo) ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:translate-x-0`}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="font-heading text-[19px] text-(--ink)">misoto22 design</span>
            <span className="mono-meta text-(--ink-3-aa)">the White Reset</span>
          </Link>
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            className="lg:hidden"
            aria-label="Close the navigation"
            onClick={() => setOpen(false)}
          >
            <X size={16} strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
        <Separator />
        <div className="min-h-0 flex-1">
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center justify-between gap-3 border-b border-(--rule) bg-(--paper)/85 px-5 backdrop-blur lg:justify-end">
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            className="lg:hidden"
            aria-label="Open the navigation"
            aria-expanded={open}
            aria-controls="docs-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu size={18} strokeWidth={1.5} aria-hidden />
          </Button>
          <div className="flex items-center gap-1">
            {/* A visible way in, because a shortcut nobody is told about is a
                shortcut for the person who built it. */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => document.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
              )}
              className="gap-2 text-(--ink-3-aa)"
            >
              <Search size={14} strokeWidth={1.5} aria-hidden />
              <span className="max-sm:sr-only">Search</span>
              <Kbd className="max-sm:hidden">⌘K</Kbd>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              href="https://github.com/Misoto22/misoto22-design"
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[11px] tracking-wide"
            >
              GitHub
            </Button>
            <AccentMenu />
            <ThemeToggle />
          </div>
        </header>

        <main id="content" className="min-w-0 flex-1 px-5 pb-24 pt-8 sm:px-8 lg:px-12">
          {children}
        </main>
      </div>
    </div>
    </TooltipProvider>
  )
}
