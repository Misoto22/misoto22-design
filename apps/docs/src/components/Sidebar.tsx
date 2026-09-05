'use client'

import { Input, Kbd, NavItem, cn } from '@misoto22/design'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { COMPONENTS, groupedComponents } from '@/content/registry'
import { FOUNDATIONS } from '@/content/foundations'

/**
 * The site's index, and its search.
 *
 * Filtering happens here rather than through a search index: the whole
 * navigable surface is forty-odd titles that ship in the bundle anyway, so
 * matching them in a `useMemo` is both smaller and instant. A search that has
 * to fetch anything would be slower than the page it is finding.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !/^(INPUT|TEXTAREA)$/.test((event.target as HTMLElement)?.tagName)) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const needle = query.trim().toLowerCase()
  const sections = useMemo(() => {
    if (!needle) return groupedComponents()
    const matches = COMPONENTS.filter(
      (entry) =>
        entry.name.toLowerCase().includes(needle) || entry.summary.toLowerCase().includes(needle),
    )
    return groupedComponents()
      .map((section) => ({
        ...section,
        entries: section.entries.filter((entry) => matches.includes(entry)),
      }))
      .filter((section) => section.entries.length > 0)
  }, [needle])

  const foundations = FOUNDATIONS.filter(
    (page) => !needle || page.title.toLowerCase().includes(needle),
  )

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="relative">
        <Input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search the documentation"
          className="pr-12"
        />
        <Kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">/</Kbd>
      </div>

      <nav aria-label="Documentation" className="flex flex-col gap-6 overflow-y-auto scroll-slim">
        <Section title="Start">
          <Row href="/" pathname={pathname} onNavigate={onNavigate}>
            Overview
          </Row>
          <Row href="/principles/" pathname={pathname} onNavigate={onNavigate}>
            Principles
          </Row>
          <Row href="/components/" pathname={pathname} onNavigate={onNavigate}>
            All components
          </Row>
        </Section>

        {foundations.length > 0 && (
          <Section title="Foundations">
            {foundations.map((page) => (
              <Row
                key={page.slug}
                href={`/foundations/${page.slug}/`}
                pathname={pathname}
                onNavigate={onNavigate}
              >
                {page.title}
              </Row>
            ))}
          </Section>
        )}

        {sections.map((section) => (
          <Section key={section.group} title={section.group}>
            {section.entries.map((entry) => (
              <Row
                key={entry.slug}
                href={`/components/${entry.slug}/`}
                pathname={pathname}
                onNavigate={onNavigate}
              >
                {entry.name}
              </Row>
            ))}
          </Section>
        ))}

        {needle && sections.length === 0 && foundations.length === 0 && (
          <p className="m-0 px-3 text-sm text-(--ink-3-aa)">Nothing matches “{query}”.</p>
        )}
      </nav>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="m-0 px-3 pb-1 eyebrow text-(--ink-3-aa)">{title}</p>
      {children}
    </div>
  )
}

function Row({
  href,
  pathname,
  onNavigate,
  children,
}: {
  href: string
  pathname: string
  onNavigate?: () => void
  children: React.ReactNode
}) {
  // Exact match: `/components/` must not light up while `/components/button/`
  // is open, or two rows claim to be the current page at once.
  const active = pathname === href
  return (
    <NavItem asChild href={href} active={active} className={cn(!active && 'font-light')}>
      <Link href={href} onClick={onNavigate}>
        {children}
      </Link>
    </NavItem>
  )
}
