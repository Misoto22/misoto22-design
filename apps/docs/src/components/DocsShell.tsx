'use client'

import { Button, Kbd, TooltipProvider } from '@misoto22/design'
import { Menu, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { ThemeMenu } from './ThemeMenu'
import { CommandPalette } from './CommandPalette'
import { LocaleMenu } from './LocaleMenu'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'
import { localePath } from '@/i18n/locales'
import { useLocale, useMessages } from '@/i18n/useLocale'

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
  // Desktop only. `true` until told otherwise, and remembered afterwards: a
  // reader who put the sidebar away did not mean "until the next page".
  const [docked, setDocked] = useState(true)

  // Whether the sidebar is a column or a drawer. A closed drawer is only
  // translated off-screen, so without knowing which it is there is no way to
  // say when its sixty links should leave the tab order.
  const [isDrawer, setIsDrawer] = useState(false)

  useEffect(() => {
    const query = matchMedia('(max-width: 1023px)')
    const sync = () => setIsDrawer(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    try {
      setDocked(localStorage.getItem('m22-sidebar') !== 'closed')
    } catch {
      // A storage-blocked context just starts docked every time.
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('m22-sidebar', docked ? 'open' : 'closed')
    } catch {
      // Same.
    }
  }, [docked])
  const pathname = usePathname()
  const locale = useLocale()
  const t = useMessages()

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
        {t.nav.skip}
      </a>

      {open && (
        <button
          type="button"
          aria-label={t.nav.closeNav}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-(--z-scrim) bg-(--scrim) lg:hidden"
        />
      )}

      <aside
        id="docs-sidebar"
        aria-label={t.nav.sidebar}
        // A drawer that is merely translated off-screen still holds focus and
        // is still read aloud: closed, it put sixty links between the reader
        // and the page they were on.
        inert={isDrawer && !open}
        className={`fixed inset-y-0 start-0 z-(--z-modal) flex w-[17rem] flex-col border-e border-(--rule) bg-(--paper) transition-transform duration-(--duration-slow) ease-(--ease-out-expo) ${
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        } lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:translate-x-0 ${docked ? '' : 'lg:hidden'}`}
      >
        {/* The same 3.5rem as the header beside it, and its own bottom rule, so
            the two run as one line across the page. They used to be a
            content-height block against a fixed-height bar, and the rules did
            not meet. */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-(--rule) px-4">
          <Link href={localePath(locale, '/')} className="flex flex-col leading-none">
            <span className="font-heading text-[17px] leading-tight text-(--ink)">
              misoto22 design
            </span>
            <span className="mono-meta text-(--ink-3-aa)">{t.tagline}</span>
          </Link>
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            className="lg:hidden"
            aria-label={t.nav.closeNav}
            onClick={() => setOpen(false)}
          >
            <X size={16} strokeWidth={1.5} aria-hidden />
          </Button>
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            className="max-lg:hidden"
            aria-label={t.nav.collapseNav}
            onClick={() => setDocked(false)}
          >
            <PanelLeftClose size={16} strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
        <div className="min-h-0 flex-1 px-4 pt-4">
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* `size="sm"` is 36px, which the Button docs are explicit about being
            below the pointer-target floor — a deliberate density for a mouse.
            A finger is not a mouse, so every control in this bar gets 44px on a
            coarse pointer. */}
        <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center justify-between gap-3 border-b border-(--rule) bg-(--paper)/85 px-5 backdrop-blur pointer-coarse:[&_a]:min-h-11 pointer-coarse:[&_button]:min-h-11">
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            className="lg:hidden"
            aria-label={t.nav.openNav}
            aria-expanded={open}
            aria-controls="docs-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu size={18} strokeWidth={1.5} aria-hidden />
          </Button>
          <Button
            iconOnly
            size="sm"
            variant="ghost"
            className={docked ? 'hidden' : 'max-lg:hidden'}
            aria-label={t.nav.expandNav}
            onClick={() => setDocked(true)}
          >
            <PanelLeftOpen size={16} strokeWidth={1.5} aria-hidden />
          </Button>
          <div className="flex-1" />
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
              <span className="max-sm:sr-only">{t.search}</span>
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
            <LocaleMenu />
            <ThemeMenu />
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
