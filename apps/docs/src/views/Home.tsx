import { Button, FigureBand, StatusPill } from '@misoto22/design'
import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { FOUNDATIONS } from '@/content/foundations'
import { COMPONENTS, groupedComponents } from '@/content/registry'
import { foundationCopy, groupName, PAGE_ZH } from '@/i18n/content'
import { localePath, type Locale } from '@/i18n/locales'
import { fill, getMessages } from '@/i18n/messages'
import { snippet, snippetSource, tokenCount } from '@/lib/docs'

const EN = {
  eyebrow: 'misoto22 design',
  title: 'The White Reset',
  summary:
    'A pure-white monochrome design system for software, writing and photography. The ground is paper-white, the mark is near-black, and the only chroma left in the file is status — which is bound to state and never to brand.',
  browse: 'Browse components',
  readPrinciples: 'Read the principles',
  componentsCount: '{count} components',
  figures: {
    components: 'Components',
    tokens: 'Tokens',
    tokensNote: 'light and dark',
    radius: 'Radius steps',
    radiusNote: 'and there is no fifth',
    shadow: 'Blurred shadows',
    shadowNote: 'depth is a hairline',
  },
  installNote:
    'Six runtime dependencies — Radix for the behaviour nobody should re-implement, cmdk for the combobox pattern, react-day-picker for the calendar, lucide for icons, sonner for toasts, and clsx + tailwind-merge to resolve a class conflict in the caller’s favour. No router, no state library, no CSS-in-JS.',
  tailwindNote:
    'Take the portable token layers on their own and skip the second copy of the utilities. The mode is an attribute on <html>, so it can be written before the first paint and never flashes the wrong theme.',
} as const

export function Home({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const copy = locale === 'zh' ? PAGE_ZH.home : EN
  const groups = groupedComponents()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
      <PageIntro eyebrow={copy.eyebrow} title={copy.title} summary={copy.summary}>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild>
            <Link href={localePath(locale, '/components/')}>{copy.browse}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={localePath(locale, '/principles/')}>{copy.readPrinciples}</Link>
          </Button>
          <StatusPill>{fill(copy.componentsCount, { count: COMPONENTS.length })}</StatusPill>
        </div>
      </PageIntro>

      <FigureBand
        label={copy.figures.components}
        scale="sub"
        figures={[
          { id: 'components', label: copy.figures.components, value: String(COMPONENTS.length) },
          {
            id: 'tokens',
            label: copy.figures.tokens,
            value: String(tokenCount()),
            note: copy.figures.tokensNote,
          },
          { id: 'radius', label: copy.figures.radius, value: '4', note: copy.figures.radiusNote },
          { id: 'shadow', label: copy.figures.shadow, value: '0', note: copy.figures.shadowNote },
        ]}
      />

      <section className="flex flex-col gap-5">
        <SectionHeading id="install">{t.section.install}</SectionHeading>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="flex flex-col gap-4">
            <CodeBlock html={snippet('install')} source={snippetSource('install')} />
            <p className="m-0 text-sm leading-relaxed text-(--ink-3-aa)">{copy.installNote}</p>
          </div>
          <CodeBlock html={snippet('usage')} source={snippetSource('usage')} />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="foundations">{t.nav.foundations}</SectionHeading>
        <div className="grid gap-px overflow-hidden rounded-(--radius-lg) border border-(--rule) bg-(--rule) sm:grid-cols-2">
          {FOUNDATIONS.map((page) => {
            const zh = foundationCopy(locale, page.slug)
            return (
              <Link
                key={page.slug}
                href={localePath(locale, `/foundations/${page.slug}/`)}
                className="group flex flex-col gap-2 bg-(--paper) p-6 transition-colors duration-(--duration-fast) hover:bg-(--paper-2)"
              >
                <span className="font-heading text-[length:var(--fs-item)] text-(--ink)">
                  {zh.title ?? page.title}
                </span>
                <span className="text-[13px] leading-relaxed text-(--ink-3-aa)">
                  {zh.summary ?? page.summary}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="components">{t.section.components}</SectionHeading>
        <div className="flex flex-col divide-y divide-(--rule) border-y border-(--rule)">
          {groups.map((section) => (
            <div key={section.group} className="grid gap-4 py-6 md:grid-cols-[10rem_minmax(0,1fr)]">
              <p className="m-0 eyebrow text-(--ink-3-aa)">{groupName(locale, section.group)}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {section.entries.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={localePath(locale, `/components/${entry.slug}/`)}
                    className="text-sm text-(--ink-2) underline decoration-transparent underline-offset-4 transition-colors duration-(--duration-fast) hover:text-(--ink) hover:decoration-(--rule-2)"
                  >
                    {entry.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="tailwind">{t.section.tailwind}</SectionHeading>
        <p className="m-0 max-w-(--w-reading) text-sm leading-relaxed text-(--ink-2)">
          {copy.tailwindNote}
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <CodeBlock html={snippet('tailwind')} source={snippetSource('tailwind')} />
          <div className="flex flex-col gap-4">
            <CodeBlock html={snippet('theme')} source={snippetSource('theme')} />
            <CodeBlock html={snippet('override')} source={snippetSource('override')} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="agents">{t.section.agents}</SectionHeading>
        <p className="m-0 max-w-(--w-reading) text-sm leading-relaxed text-(--ink-2)">
          {t.agents.note}
        </p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {[
            { href: '/llms.txt', note: t.agents.index },
            { href: '/llms-full.txt', note: t.agents.full },
            { href: '/components/button/llms.txt', note: t.agents.perComponent },
          ].map((row) => (
            <li key={row.href} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <a
                href={row.href}
                className="font-mono text-[13px] text-(--ink) underline decoration-(--rule-2) underline-offset-4 hover:decoration-(--ink)"
              >
                {row.href}
              </a>
              <span className="text-[13px] text-(--ink-3-aa)">{row.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
