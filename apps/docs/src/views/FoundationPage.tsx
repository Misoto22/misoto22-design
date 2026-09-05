import { foundationCopy } from '@/i18n/content'
import type { Locale } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import { notFound } from 'next/navigation'
import { PageIntro } from '@/components/PageIntro'
import { TokenTable } from '@/components/TokenTable'
import { FOUNDATION_BY_SLUG } from '@/content/foundations'
import { tokensByCategory } from '@/lib/docs'

export async function FoundationPage({ locale, slug }: { locale: Locale; slug: string }) {
  const page = FOUNDATION_BY_SLUG.get(slug)
  if (!page) notFound()
  const zh = foundationCopy(locale, slug)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
      <PageIntro
        eyebrow={getMessages(locale).nav.foundations}
        title={zh.title ?? page.title}
        summary={zh.summary ?? page.summary}
        crumbs={[{ label: getMessages(locale).nav.foundations }, { label: zh.title ?? page.title }]}
      />

      <div className="flex max-w-(--w-reading) flex-col gap-4">
        {(zh.intro ?? page.intro).map((paragraph) => (
          <p key={paragraph} className="m-0 text-[15px] leading-relaxed text-(--ink-2)">
            {paragraph}
          </p>
        ))}
      </div>

      {slug === 'typography' && <TypeSpecimen />}

      {page.categories.map((category) => {
        const { rows, dark } = tokensByCategory(category.key)
        return (
          <TokenTable
            key={category.key}
            title={zh.categories?.[category.key]?.title ?? category.title}
            note={zh.categories?.[category.key]?.note ?? category.note}
            rows={rows}
            dark={dark.size > 0 ? dark : undefined}
            locale={locale}
          />
        )
      })}
    </div>
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
