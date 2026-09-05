import { COMPONENTS } from '@/content/registry'
import { componentText } from '@/lib/agent-text'

export const dynamic = 'force-static'

/** One file per component, so an agent can fetch one rather than the system. */
export function generateStaticParams() {
  return COMPONENTS.map((entry) => ({ slug: entry.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = COMPONENTS.find((candidate) => candidate.slug === slug)
  if (!entry) return new Response('Not found', { status: 404 })

  return new Response(componentText(entry), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
