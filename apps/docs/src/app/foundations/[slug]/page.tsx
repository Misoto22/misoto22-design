import type { Metadata } from 'next'
import { FoundationPage } from '@/views/FoundationPage'
import { FOUNDATIONS, FOUNDATION_BY_SLUG } from '@/content/foundations'
import { catalogCopy } from '@/i18n/translate'

export function generateStaticParams() {
  return FOUNDATIONS.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = FOUNDATION_BY_SLUG.get(slug)
  if (!entry) return {}
  return {
    title: catalogCopy('en', `foundation.${slug}.title`, entry.title),
    description: catalogCopy('en', `foundation.${slug}.summary`, entry.summary),
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <FoundationPage locale="en" slug={slug} />
}
