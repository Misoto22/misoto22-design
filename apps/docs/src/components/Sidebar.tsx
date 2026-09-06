'use client'

import {
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarProvider,
} from '@misoto22/design'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { groupedComponents } from '@/content/registry'
import { foundationsInGroup } from '@/content/foundations'
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
        {/* The group holding the page you are on opens itself. Everything else
            stays rolled up until asked for: forty-nine rows under seven headings
            is a column taller than most screens, and a reader looking at Button
            has no use for the other forty-eight being permanently unrolled. */}
        {groupedComponents().map((group) => (
          <Section
            key={group.group}
            title={groupName(locale, group.group)}
            count={group.entries.length}
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
        <Section title={t.nav.templates} count={TEMPLATES.length} defaultOpen>
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
        </Section>
      </Nav>
    )
  }

  // Built as data rather than written as JSX, so the group can be counted and
  // can know whether the page being read is inside it — the two things every
  // other rail's groups already do, and the whole of what made this one look
  // like a different component.
  //
  // "Getting started" and "Working with AI" live at /foundations/… like every
  // other page in this file: they are foundations entries carrying prose
  // instead of a token category. They belong in Guide rather than under
  // Foundations, because a reader looking for the install command is not
  // looking for a scale.
  const guide = [
    { href: localePath(locale, '/'), label: t.nav.overview },
    ...foundationsInGroup('guide').map((page) => ({
      href: localePath(locale, `/foundations/${page.slug}/`),
      label: foundationCopy(locale, page.slug).title ?? page.title,
    })),
    { href: localePath(locale, '/principles/'), label: t.nav.principles },
    { href: localePath(locale, '/changelog/'), label: t.nav.changelog },
  ]
  const foundations = foundationsInGroup('foundations').map((page) => ({
    href: localePath(locale, `/foundations/${page.slug}/`),
    label: foundationCopy(locale, page.slug).title ?? page.title,
  }))

  return (
    <Nav label={t.nav.documentation}>
      {[
        { title: t.nav.guide, rows: guide },
        { title: t.nav.foundations, rows: foundations },
      ].map((group) => (
        <Section
          key={group.title}
          title={group.title}
          count={group.rows.length}
          defaultOpen={group.rows.some((row) => row.href === pathname)}
        >
          {group.rows.map((row) => (
            <Row key={row.href} href={row.href} pathname={pathname} onNavigate={onNavigate}>
              {row.label}
            </Row>
          ))}
        </Section>
      ))}
    </Nav>
  )
}

/**
 * The rail's own chrome, from the package rather than from here.
 *
 * `collapsible="none"`: the SHELL owns whether this column is on screen, and it
 * takes the whole thing away rather than collapsing it to icons — ninety-two
 * component rows collapse to ninety-two identical file icons, which is a column
 * of width answering nothing. So the provider is here for the group and row
 * styling, and the state it would otherwise hold is never used.
 */
function Nav({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <SidebarProvider collapsible="none" shortcut={null}>
      <nav aria-label={label} className="flex h-full flex-col">
        <SidebarContent className="gap-5 p-0 pb-6">{children}</SidebarContent>
      </nav>
    </SidebarProvider>
  )
}

/**
 * A group in the rail.
 *
 * A thin pass to the package's own `SidebarGroup`: this site was carrying its
 * own heading, chevron, count and indent rule, which is how three rails that
 * render the same component ended up looking like three components. What is
 * left here is the one thing the package cannot know — whether the page being
 * read is inside this group.
 */
function Section({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <SidebarGroup label={title} count={count} defaultOpen={defaultOpen}>
      {children}
    </SidebarGroup>
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
    <SidebarItem asChild href={href} active={active} className="text-[15px]">
      <Link href={href} onClick={onNavigate}>
        {children}
      </Link>
    </SidebarItem>
  )
}
