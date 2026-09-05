<<<<<<< HEAD
import type { Metadata } from 'next'
import { TemplatePage } from '@/views/TemplatePage'
import { TEMPLATES, TEMPLATE_BY_SLUG } from '@/content/templates'
import { templateCopy } from '@/i18n/content'
=======
import { Tag } from '@misoto22/design'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/CodeBlock'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { TemplateFrame } from '@/components/TemplateFrame'
import { TEMPLATES, TEMPLATE_BY_SLUG } from '@/content/templates'
import { templateSource } from '@/lib/docs'
>>>>>>> origin/main

export function generateStaticParams() {
  return TEMPLATES.map((template) => ({ slug: template.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
<<<<<<< HEAD
  const entry = TEMPLATE_BY_SLUG.get(slug)
  if (!entry) return {}
  return { title: templateCopy('en', slug).name ?? entry.name, description: templateCopy('en', slug).summary ?? entry.summary }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <TemplatePage locale="en" slug={slug} />
=======
  const template = TEMPLATE_BY_SLUG.get(slug)
  if (!template) return {}
  return { title: template.name, description: template.summary }
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const template = TEMPLATE_BY_SLUG.get(slug)
  if (!template) notFound()

  const source = templateSource(template.id)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <PageIntro
        eyebrow="Template"
        title={template.name}
        summary={template.summary}
        crumbs={[{ label: 'Templates', href: '/templates/' }, { label: template.name }]}
      >
        <p className="m-0 max-w-(--w-reading) border-s border-(--rule-2) ps-4 text-sm leading-relaxed text-(--ink-2)">
          {template.tests}
        </p>
      </PageIntro>

      <TemplateFrame templateId={template.id} name={template.name} />

      <section className="flex flex-col gap-4">
        <SectionHeading id="uses">Built from</SectionHeading>
        <div className="flex flex-wrap gap-1.5">
          {template.uses.map((name) => (
            <Tag key={name}>{name}</Tag>
          ))}
        </div>
        <p className="m-0 max-w-(--w-reading) text-sm leading-relaxed text-(--ink-3-aa)">
          Nothing here was styled specially for the template. That is the only arrangement where it
          stays honest as the system changes — a template with its own CSS stops being a test of the
          components and becomes a screenshot.
        </p>
      </section>

      {source && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="source">Source</SectionHeading>
          <CodeBlock html={source.html} source={source.source} label={`${template.name} source`} />
        </section>
      )}
    </div>
  )
>>>>>>> origin/main
}
