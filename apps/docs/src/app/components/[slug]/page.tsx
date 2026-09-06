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
  return {
    title: entry.name,
    description: componentCopy('en', slug).summary ?? entry.summary,
    // The page it is on, written for a reader that does not render CSS. The
    // root layout already advertises the index and the whole-site file; this is
    // the one that is about THIS component, and it is a few hundred tokens
    // against the full file's tens of thousands.
    alternates: {
      types: {
        'text/plain': [
          { url: `/components/${slug}/llms.txt`, title: `${entry.name} for agents` },
        ],
        // The same bytes under the extension an agent guesses rather than
        // reads. Declared as markdown because that is what it is; the
        // `text/plain` entry above keeps the llmstxt.org name it was published
        // under, and dropping that would break anything already pointed at it.
        'text/markdown': [
          { url: `/components/${slug}.md`, title: `${entry.name} as markdown` },
        ],
      },
    },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ComponentPage locale="en" slug={slug} />
}
