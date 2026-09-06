import Link from 'next/link'
import { catalogCopy } from '@/i18n/translate'
import { type Locale, localePath } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/CodeBlock'
import { CommandBlock } from '@/components/CommandBlock'
import { IconSpecimen } from '@/components/IconSpecimen'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { Prose } from '@/components/Prose'
import { TokenTable } from '@/components/TokenTable'
import type { FoundationSection } from '@/content/foundations'
import { FOUNDATION_BY_SLUG } from '@/content/foundations'
import { snippet, tokensByCategory } from '@/lib/docs'

export async function FoundationPage({ locale, slug }: { locale: Locale; slug: string }) {
  const page = FOUNDATION_BY_SLUG.get(slug)
  if (!page) notFound()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
      <PageIntro
        eyebrow={getMessages(locale).nav.foundations}
        title={catalogCopy(locale, `foundation.${slug}.title`, page.title)}
        summary={catalogCopy(locale, `foundation.${slug}.summary`, page.summary)}
        crumbs={[
          { label: getMessages(locale).nav.foundations },
          { label: catalogCopy(locale, `foundation.${slug}.title`, page.title) },
        ]}
      />

      <div className="flex max-w-(--w-reading) flex-col gap-4">
        {page.intro.map((paragraph, index) => (
          <p key={paragraph} className="m-0 text-[15px] leading-relaxed text-(--ink-2)">
            {catalogCopy(locale, `foundation.${slug}.intro.${index}`, paragraph)}
          </p>
        ))}
        {page.related && <RelatedPages locale={locale} slugs={page.related} />}
      </div>

      {slug === 'typography' && <TypeSpecimen />}
      {slug === 'icons' && <IconSpecimen />}

      {/* Prose sections come BEFORE the token tables, on the two pages that have
          both. A page whose subject is a set of tokens leads with them; a page
          that documents a command or a stylesheet leads with the writing, and
          neither of those two has a table to be pushed down. */}
      {page.sections?.map((section) => (
        <ProseSection key={section.id} locale={locale} slug={slug} section={section} />
      ))}

      {page.categories.map((category) => {
        const { rows, dark } = tokensByCategory(category.key)
        return (
          <TokenTable
            key={category.key}
            title={catalogCopy(locale, `foundation.${slug}.category.${category.key}.title`, category.title)}
            note={
              category.note &&
              catalogCopy(locale, `foundation.${slug}.category.${category.key}.note`, category.note)
            }
            rows={rows}
            dark={dark.size > 0 ? dark : undefined}
            locale={locale}
          />
        )
      })}
    </div>
  )
}

/**
 * One prose section: a heading, the writing, an optional definition list, and
 * the blocks a reader came to copy.
 *
 * Every string here resolves through its own key, so a section falls back to
 * English one paragraph at a time rather than all at once — which is what makes
 * a half-finished translation shippable instead of a thing to hold back.
 */
function ProseSection({
  locale,
  slug,
  section,
}: {
  locale: Locale
  slug: string
  section: FoundationSection
}) {
  const at = `foundation.${slug}.section.${section.id}`
  return (
    <section className="flex flex-col gap-5">
      <SectionHeading id={section.id}>
        {catalogCopy(locale, `${at}.title`, section.title)}
      </SectionHeading>
      <Prose
        text={section.body
          .map((paragraph, index) => catalogCopy(locale, `${at}.body.${index}`, paragraph))
          .join('\n\n')}
      />

      {section.rows && (
        <dl className="m-0 flex flex-col divide-y divide-(--rule) border-y border-(--rule)">
          {section.rows.map((row, index) => (
            // A description list rather than a Table: these are a term and its
            // gloss, not a grid, and a table would promise columns that are not
            // there. `md:` only — at a phone's width the two stack.
            <div key={row.term} className="grid gap-1 py-3.5 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-5">
              <dt className="m-0 font-mono text-xs text-(--ink)">
                {catalogCopy(locale, `${at}.row.${index}.term`, row.term)}
              </dt>
              <dd className="m-0 max-w-(--measure-record) text-[13px] leading-relaxed text-(--ink-2)">
                {catalogCopy(locale, `${at}.row.${index}.detail`, row.detail)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {section.snippets?.map((id) => <CodeBlock key={id} {...snippet(id)} label={id} />)}
      {section.commands?.map((command, index) => (
        <CommandBlock
          key={command.source}
          source={command.source}
          label={catalogCopy(locale, `${at}.command.${index}.label`, command.label)}
        />
      ))}
    </section>
  )
}

/**
 * Where this page deliberately stops.
 *
 * Slugs rather than hrefs, so the locale prefix is applied here and a renamed
 * page fails `foundations.test.ts` instead of shipping a 404 nobody clicks.
 */
function RelatedPages({ locale, slugs }: { locale: Locale; slugs: string[] }) {
  return (
    <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-2">
      <span className="eyebrow text-(--ink-3-aa)">{getMessages(locale).section.readNext}</span>
      {slugs.map((slug) => {
        const target = FOUNDATION_BY_SLUG.get(slug)
        if (!target) return null
        return (
          <Link
            key={slug}
            href={localePath(locale, `/foundations/${slug}/`)}
            className="text-sm text-(--ink-2) underline decoration-(--rule-2) underline-offset-4 transition-colors duration-(--duration-fast) hover:text-(--ink)"
          >
            {catalogCopy(locale, `foundation.${slug}.title`, target.title)}
          </Link>
        )
      })}
    </p>
  )
}

/** The heading ladder, set at the sizes it actually resolves to. */
function TypeSpecimen() {
  const STEPS = [
    { token: '--fs-title', label: 'Page title', sample: 'The White Reset' },
    { token: '--fs-lead', label: 'Band heading', sample: 'A row of counted facts' },
    { token: '--fs-heading', label: 'Record title', sample: 'Depth is a hairline' },
    { token: '--fs-sub', label: 'Card sub-head', sample: 'Bound to state, never to brand' },
    { token: '--fs-item', label: 'In-card title', sample: 'One pointer, and it is ink' },
  ]

  return (
    <section className="flex flex-col divide-y divide-(--rule) border-y border-(--rule)">
      {STEPS.map((step) => (
        <div key={step.token} className="flex flex-col gap-1.5 py-6">
          <p className="m-0 mono-meta text-(--ink-3-aa)">
            {step.label} · <code>{step.token}</code>
          </p>
          <p
            className="m-0 font-heading font-normal leading-tight text-(--ink)"
            style={{ fontSize: `var(${step.token})` }}
          >
            {step.sample}
          </p>
        </div>
      ))}
    </section>
  )
}
