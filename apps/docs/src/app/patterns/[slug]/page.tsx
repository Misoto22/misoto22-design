import type { Metadata } from 'next'
import { ComponentPage } from '@/views/ComponentPage'
import { PATTERN_BY_SLUG, PATTERNS } from '@/content/registry'
import { componentCopy } from '@/i18n/content'

export function generateStaticParams() {
  return PATTERNS.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = PATTERN_BY_SLUG.get(slug)
  if (!entry) return {}
  return {
    title: entry.name,
    description: componentCopy('en', slug).summary ?? entry.summary,
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ComponentPage locale="en" slug={slug} kind="pattern" />
}
