'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger, NavItem, cn } from '@misoto22/design'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { groupedComponents } from '@/content/registry'
import { FOUNDATIONS } from '@/content/foundations'
import { TEMPLATES } from '@/content/templates'
import { sectionFor } from '@/content/sections'
import { ThemeRail } from './ThemeRail'
import { componentName, foundationCopy, groupName, templateCopy } from '@/i18n/content'
import { localePath } from '@/i18n/locales'
import { useLocale, useMessages } from '@/i18n/useLocale'

/**
 * The current section's index, and only the current section's.
 *
 * It used to carry every page the site has, in one column: six "start" rows, the
 * four foundations, and seven collapsed component groups. That answered "what
 * is in this site" only for a reader willing to read all of it, and it put the
 * templates and the themes among the six rows at the top where nobody looked.
 * The masthead now names the four sections; this narrows to whichever one is
 * open, so the column has one job instead of four.
 *
 * It used to carry its own search field too. That was a second search box beside
 * ⌘K answering the same question with less reach, and two of them meant neither
 * was obviously the one to use — so the field is gone and everything it could
 * match moved into the palette (see `content/haystack.ts`).
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useMessages()
  const section = sectionFor(pathname)

  // One page, so there is nothing to INDEX — but plenty to do. The rail is the
  // switch itself rather than a list of links to one destination.
  if (section === 'themes') return <ThemeRail />

  if (section === 'components') {
    return (
      <Nav label={t.nav.documentation}>
        {/* No heading over a single row. "START" sat above "All components" and
            named nothing — the masthead already says which section this is, and
            a label that repeats the tab above it is furniture. */}
        <div className="flex flex-col gap-1">
          <Row href={localePath(locale, '/components/')} pathname={pathname} onNavigate={onNavigate}>
            {t.nav.allComponents}
          </Row>
        </div>
        {/* The group holding the page you are on opens itself. Everything else
            stays rolled up until asked for: forty-nine rows under seven headings
            is a column taller than most screens, and a reader looking at Button
            has no use for the other forty-eight being permanently unrolled. */}
        {groupedComponents().map((group) => (
          <Section
            key={group.group}
            title={groupName(locale, group.group)}
            count={group.entries.length}
            collapsible
            defaultOpen={group.entries.some((entry) =>
              pathname.includes(`/components/${entry.slug}/`),
            )}
          >
            {group.entries.map((entry) => (
              <Row
                key={entry.slug}
                href={localePath(locale, `/components/${entry.slug}/`)}
                pathname={pathname}
                onNavigate={onNavigate}
              >
                {componentName(locale, entry.slug, entry.name)}
              </Row>
            ))}
          </Section>
        ))}
      </Nav>
    )
  }

  if (section === 'templates') {
    return (
      <Nav label={t.nav.documentation}>
        <div className="flex flex-col gap-1">
          <Row href={localePath(locale, '/templates/')} pathname={pathname} onNavigate={onNavigate}>
            {t.nav.allTemplates}
          </Row>
          {TEMPLATES.map((template) => (
            <Row
              key={template.slug}
              href={localePath(locale, `/templates/${template.slug}/`)}
              pathname={pathname}
              onNavigate={onNavigate}
            >
              {templateCopy(locale, template.slug).name ?? template.name}
            </Row>
          ))}
        </div>
      </Nav>
    )
  }

  return (
    <Nav label={t.nav.documentation}>
      <Section title={t.nav.guide}>
        <Row href={localePath(locale, '/')} pathname={pathname} onNavigate={onNavigate}>
          {t.nav.overview}
        </Row>
        <Row href={localePath(locale, '/principles/')} pathname={pathname} onNavigate={onNavigate}>
          {t.nav.principles}
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
    </Nav>
  )
}

function Nav({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="flex h-full flex-col gap-5 overflow-y-auto pb-6 scroll-slim"
    >
      {children}
    </nav>
  )
}

/**
 * A section heading in the rail.
 *
 * Not `eyebrow`. That utility is 11px, uppercase, and tracked at 0.2em — right
 * for a kicker over a page title, and wrong for seven of them stacked in a
 * 17rem column, where it reads as small print. It is worse in Chinese, which
 * has no case to change and where letter-spacing only pulls the characters
 * apart: 「展 示」 is not a heading, it is a heading with a gap in it.
 */
const HEADING =
  'm-0 px-3 pb-1 font-mono text-[12px] tracking-[0.06em] text-(--ink-3-aa)'

interface SectionProps {
  title: string
  count?: number
  collapsible?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}

/**
 * The rule down an open group, and the indent that goes with it.
 *
 * A group's rows used to sit at the same inset as its heading, so a column of
 * fifty rows had nothing in it saying which heading any given row belonged to —
 * only the vertical distance to the last one, which is gone the moment the list
 * is scrolled. A hairline running the height of the group answers it
 * continuously, which is what every documentation rail that works does.
 *
 * `ms-[0.9rem]` puts the rule under the chevron's own centre, so it reads as
 * dropping out of the marker rather than as a second unrelated edge.
 */
const GROUP_RULE = 'ms-[0.9rem] flex flex-col gap-1 border-s border-(--rule) ps-2'

function Section({ title, count, collapsible = false, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  if (!collapsible) {
    return (
      <div className="flex flex-col gap-1">
        <p className={HEADING}>{title}</p>
        <div className={GROUP_RULE}>{children}</div>
      </div>
    )
  }

  return (
    // Radix rather than `{open && …}`. A conditional render cannot animate —
    // the rows are simply not there on the next frame — and Radix publishes the
    // measured height, so the panel opens to what it actually is instead of to
    // a guessed maximum.
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-1">
      <CollapsibleTrigger className="group flex items-center gap-1.5 rounded-(--radius-row) px-3 py-1 text-start transition-colors duration-(--duration-fast) hover:bg-(--stone)">
        <ChevronRight
          size={12}
          strokeWidth={2}
          aria-hidden
          className="shrink-0 text-(--ink-3-aa) transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-data-[state=open]:rotate-90"
        />
        <span className={cn(HEADING, 'm-0 p-0')}>{title}</span>
        {count !== undefined && (
          <span className="ms-auto font-mono text-[12px] text-(--ink-3-aa)">{count}</span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={GROUP_RULE}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
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
    // 15px, and no `font-light`. The rail is the one column that is read at a
    // glance rather than word by word, and a 300 weight at 14px is thin enough
    // to be work — in Chinese, where every glyph carries more strokes in the
    // same box, it is thin enough to be a squint.
    <NavItem asChild href={href} active={active} className="text-[15px]">
      <Link href={href} onClick={onNavigate}>
        {children}
      </Link>
    </NavItem>
  )
}
