import type { Metadata } from 'next'
import { FoundationPage } from '@/views/FoundationPage'
import { FOUNDATIONS, FOUNDATION_BY_SLUG } from '@/content/foundations'
import { foundationCopy } from '@/i18n/content'

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
  return { title: foundationCopy('zh', slug).title ?? entry.title, description: foundationCopy('zh', slug).summary ?? entry.summary }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <FoundationPage locale="zh" slug={slug} />
}
