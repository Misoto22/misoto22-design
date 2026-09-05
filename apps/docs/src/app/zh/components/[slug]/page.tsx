import type { Metadata } from 'next'
import { ComponentPage } from '@/views/ComponentPage'
import { BY_SLUG, COMPONENTS } from '@/content/registry'
import { componentCopy } from '@/i18n/content'

export function generateStaticParams() {
  return COMPONENTS.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = BY_SLUG.get(slug)
  if (!entry) return {}
  return { title: entry.name, description: componentCopy('zh', slug).summary ?? entry.summary }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ComponentPage locale="zh" slug={slug} />
}
