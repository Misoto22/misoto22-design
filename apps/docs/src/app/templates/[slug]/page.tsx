import type { Metadata } from 'next'
import { TemplatePage } from '@/views/TemplatePage'
import { TEMPLATES, TEMPLATE_BY_SLUG } from '@/content/templates'
import { templateCopy } from '@/i18n/content'

export function generateStaticParams() {
  return TEMPLATES.map((template) => ({ slug: template.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = TEMPLATE_BY_SLUG.get(slug)
  if (!entry) return {}
  return { title: templateCopy('en', slug).name ?? entry.name, description: templateCopy('en', slug).summary ?? entry.summary }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <TemplatePage locale="en" slug={slug} />
}
