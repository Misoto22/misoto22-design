'use client'

import { NavItem, cn } from '@misoto22/design'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { groupedComponents } from '@/content/registry'
import { FOUNDATIONS } from '@/content/foundations'
import { foundationCopy, groupName } from '@/i18n/content'
import { localePath } from '@/i18n/locales'
import { useLocale, useMessages } from '@/i18n/useLocale'

/**
 * The site's index.
 *
 * It used to carry its own search field. That was a second search box beside
 * ⌘K answering the same question with less reach, and two of them meant
 * neither was obviously the one to use — so the field is gone and everything it
 * could match moved into the palette (see `content/haystack.ts`).
 *
 * The component groups collapse. Forty-nine rows under seven headings is a
 * column taller than most screens, and a reader looking at Button has no use
 * for the other forty-eight being permanently unrolled beneath it.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useMessages()
  const sections = groupedComponents()

  return (
    <nav
      aria-label={t.nav.documentation}
      className="flex h-full flex-col gap-5 overflow-y-auto scroll-slim pb-6"
    >
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
        <Row href={localePath(locale, '/themes/')} pathname={pathname} onNavigate={onNavigate}>
          {t.themes.title}
        </Row>
        <Row href={localePath(locale, '/changelog/')} pathname={pathname} onNavigate={onNavigate}>
          {t.nav.changelog}
        </Row>
      </Section>

      <Section title={t.nav.foundations}>
        {FOUNDATIONS.map((page) => (
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

      {sections.map((section) => {
        // The group holding the page you are on opens itself. Everything else
        // stays rolled up until asked for.
        const holdsCurrent = section.entries.some((entry) =>
          pathname.includes(`/components/${entry.slug}/`),
        )
        return (
          <Section
            key={section.group}
            title={groupName(locale, section.group)}
            count={section.entries.length}
            collapsible
            defaultOpen={holdsCurrent}
          >
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
        )
      })}
    </nav>
  )
}

interface SectionProps {
  title: string
  count?: number
  collapsible?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ title, count, collapsible = false, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  if (!collapsible) {
    return (
      <div className="flex flex-col gap-1">
        <p className="m-0 px-3 pb-1 eyebrow text-(--ink-3-aa)">{title}</p>
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-1.5 rounded-(--radius-sm) px-3 py-1 text-start transition-colors duration-(--duration-fast) hover:bg-(--stone)"
      >
        <ChevronRight
          size={12}
          strokeWidth={2}
          aria-hidden
          className={cn(
            'shrink-0 text-(--ink-3-aa) transition-transform duration-(--duration-fast) ease-(--ease-out-expo)',
            open && 'rotate-90',
          )}
        />
        <span className="eyebrow text-(--ink-3-aa)">{title}</span>
        {count !== undefined && (
          <span className="ms-auto mono-meta text-(--ink-3-aa)">{count}</span>
        )}
      </button>
      {open && <div className="flex flex-col gap-1">{children}</div>}
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
