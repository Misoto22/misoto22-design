import './jsdom-layout'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import examplesJson from '@/generated/examples.json'
import type { ExampleData } from '@/lib/docs'
import { ComponentPage } from '@/views/ComponentPage'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/components/button/',
  notFound: () => {
    throw new Error('notFound')
  },
}))

/**
 * Two examples with one field between them.
 *
 * Both halves have to be pinned rather than found in the real data: every
 * example file is getting a description, so a test that went looking for one
 * without would pass until the day the sweep finished and then fail for the
 * best possible reason. The ids are real, because the canvas resolves them
 * through the generated import map and renders an error where it cannot.
 */
const DESCRIBED: ExampleData = {
  id: '01-variants',
  title: 'described',
  description: 'What this shows, and the consequence of reaching for it here.',
  snippet: '<Button />',
  html: '<pre class="shiki"><code></code></pre>',
  lang: 'tsx',
}

const BARE: ExampleData = {
  id: '02-sizes',
  title: 'bare',
  snippet: '<Button />',
  html: '<pre class="shiki"><code></code></pre>',
  lang: 'tsx',
}

vi.mock('@/lib/docs', async () => {
  const actual = await vi.importActual<typeof import('@/lib/docs')>('@/lib/docs')
  return { ...actual, componentExamples: () => [DESCRIBED, BARE] }
})

/** The heading and its sentence share a wrapper; this is that wrapper. */
function caption(title: string): HTMLElement {
  return screen.getByText(title).parentElement!
}

describe('an example description', () => {
  it('reaches the generated data from the file it was written in', () => {
    const examples = examplesJson as unknown as Record<string, ExampleData[]>
    const sizes = examples.Button!.find((example) => example.id === '02-sizes')

    // Reflowed to one line on the way through: the block is wrapped to the
    // file's column and the page sets its own measure.
    expect(sizes!.description).toMatch(/^The three sizes on one variant/)
    expect(sizes!.description).not.toMatch(/\n/)
  })

  it('is not printed a second time inside the snippet', () => {
    // The page shows the sentence above the canvas. A reader who opens the code
    // to copy it wants the JSX, not the paragraph they have just read.
    const leaked = Object.entries(examplesJson as unknown as Record<string, ExampleData[]>)
      .flatMap(([dir, list]) => list.map((example) => ({ dir, ...example })))
      .filter((example) => example.snippet.includes('/**'))
      .map((example) => `${example.dir}/${example.id}`)

    expect(leaked).toEqual([])
  })

  it('renders under the example heading it belongs to', async () => {
    render(await ComponentPage({ locale: 'en', slug: 'button' }))

    expect(screen.getByText(DESCRIBED.description!)).toBeInTheDocument()
    expect(caption('described').textContent).toBe(`described${DESCRIBED.description}`)
  })

  it('leaves the heading alone where an example has none', async () => {
    render(await ComponentPage({ locale: 'en', slug: 'button' }))

    // The absence is the assertion: a heading with nothing under it is how this
    // section has always read, and most example files still read that way.
    expect(screen.getByText('bare')).toBeInTheDocument()
    expect(caption('bare').textContent).toBe('bare')
  })
})
