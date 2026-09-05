'use client'

import { Input, Kbd, NavItem, cn } from '@misoto22/design'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { COMPONENTS, groupedComponents, type ComponentEntry } from '@/content/registry'
import { FOUNDATIONS } from '@/content/foundations'
import { foundationCopy, groupName } from '@/i18n/content'
import { localePath } from '@/i18n/locales'
import { fill } from '@/i18n/messages'
import { useLocale, useMessages } from '@/i18n/useLocale'
import propsJson from '@/generated/props.json'

/**
 * Everything about a component a reader might plausibly type.
 *
 * The name and the summary are the obvious half. The rest is the half that
 * makes search useful rather than decorative: someone looking for "aria-sort"
 * or "asChild" or "focus trap" is looking for a component, and matching only
 * titles sends them away empty. Built once at module load, from data the build
 * already produced.
 */
const HAYSTACK = new Map<string, string>(
  COMPONENTS.map((entry) => {
    type Prop = { name: string; type: string; description: string }
    const source = (propsJson as Record<string, { components?: { props?: Prop[] }[] }>)[entry.dir]
    // Names, types AND descriptions: someone searching for "aria-sort" is
    // looking for the table, and only the description says so. A search that
    // stops at prop names is a search that answers the questions you did not
    // need to ask.
    const props = (source?.components ?? []).flatMap((component) =>
      (component.props ?? []).flatMap((prop) => [prop.name, prop.type, prop.description]),
    )
    return [
      entry.slug,
      [
        entry.name,
        entry.dir,
        entry.group,
        entry.summary,
        entry.when ?? '',
        ...(entry.accessibility ?? []),
        ...(entry.keyboard ?? []).flatMap((row) => [...row.keys, row.does]),
        ...props,
      ]
        .join(' ')
        .toLowerCase(),
    ]
  }),
)

const matches = (entry: ComponentEntry, needle: string) =>
  (HAYSTACK.get(entry.slug) ?? '').includes(needle)

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
  const locale = useLocale()
  const t = useMessages()
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
    return groupedComponents()
      .map((section) => ({
        ...section,
        entries: section.entries.filter((entry) => matches(entry, needle)),
      }))
      .filter((section) => section.entries.length > 0)
  }, [needle])

  const hits = needle
    ? sections.reduce((total, section) => total + section.entries.length, 0)
    : 0

  const foundations = FOUNDATIONS.filter((page) => {
    if (!needle) return true
    const title = foundationCopy(locale, page.slug).title ?? page.title
    return title.toLowerCase().includes(needle) || page.title.toLowerCase().includes(needle)
  })

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="relative">
        <Input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.search}
          aria-label={t.searchAria}
          className="pr-12"
        />
        <Kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">/</Kbd>
      </div>

      <nav aria-label={t.nav.documentation} className="flex flex-col gap-6 overflow-y-auto scroll-slim">
        <Section title={t.nav.start}>
          <Row href={localePath(locale, '/')} pathname={pathname} onNavigate={onNavigate}>
            {t.nav.overview}
          </Row>
          <Row href={localePath(locale, '/principles/')} pathname={pathname} onNavigate={onNavigate}>
            {t.nav.principles}
          </Row>
          <Row href={localePath(locale, '/components/')} pathname={pathname} onNavigate={onNavigate}>
            {t.nav.allComponents}
          </Row>
          <Row href={localePath(locale, '/templates/')} pathname={pathname} onNavigate={onNavigate}>
            {t.nav.templates}
          </Row>
          <Row href={localePath(locale, '/changelog/')} pathname={pathname} onNavigate={onNavigate}>
            {t.nav.changelog}
          </Row>
        </Section>

        {foundations.length > 0 && (
          <Section title={t.nav.foundations}>
            {foundations.map((page) => (
              <Row
                key={page.slug}
                href={localePath(locale, `/foundations/${page.slug}/`)}
                pathname={pathname}
                onNavigate={onNavigate}
              >
                {foundationCopy(locale, page.slug).title ?? page.title}
              </Row>
            ))}
          </Section>
        )}

        {sections.map((section) => (
          <Section key={section.group} title={groupName(locale, section.group)}>
            {section.entries.map((entry) => (
              <Row
                key={entry.slug}
                href={localePath(locale, `/components/${entry.slug}/`)}
                pathname={pathname}
                onNavigate={onNavigate}
              >
                {entry.name}
              </Row>
            ))}
          </Section>
        ))}

        {needle && (hits > 0 || foundations.length > 0) && (
          <p className="m-0 px-3 mono-meta text-(--ink-3-aa)" role="status">
            {fill(t.matching, { count: hits + foundations.length })}
          </p>
        )}

        {needle && sections.length === 0 && foundations.length === 0 && (
          <p className="m-0 px-3 text-sm text-(--ink-3-aa)" role="status">
            {fill(t.searchEmpty, { query })}
          </p>
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
