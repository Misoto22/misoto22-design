import './jsdom-layout'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { COMPONENTS } from '@/content/registry'
import { ComponentPage } from '@/views/ComponentPage'

/**
 * Next's two runtime pieces, stubbed to what this page actually uses them for.
 *
 * `Link` is an anchor here, and `usePathname` is how every client component in
 * the chrome finds the locale. Neither has an app-router context under vitest,
 * and neither is what these assertions are about.
 */
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
 * One entry with the two new fields taken back off it.
 *
 * The absent case has to be pinned rather than discovered. Fifty-one entries
 * carry neither field today and the package is filling them in; a test that
 * goes looking for one would pass until the day the catalog is finished and
 * then fail for the best possible reason, which is the worst kind of failing
 * test. Everything else about this entry is Button's real data, so what it
 * proves is exactly the absence.
 */
vi.mock('@/content/registry', async () => {
  const actual =
    await vi.importActual<typeof import('@/content/registry')>('@/content/registry')
  const bare = {
    ...actual.BY_SLUG.get('button')!,
    slug: 'bare',
    name: 'Bare',
    anatomy: undefined,
    practices: undefined,
  }
  return {
    ...actual,
    COMPONENTS: [...actual.COMPONENTS, bare],
    BY_SLUG: new Map([...actual.BY_SLUG, ['bare', bare]]),
  }
})

/**
 * Radix activates a tab on mouse DOWN, not on click — the same decision the
 * platform makes for a tab strip, and the reason a `click` here selects nothing.
 */
function selectTab(name: string) {
  fireEvent.mouseDown(screen.getByRole('tab', { name }))
}

/** The page is an async server component; awaiting it is what a render does. */
async function page(slug: string) {
  return render(await ComponentPage({ locale: 'en', slug }))
}

const DOCUMENTED = COMPONENTS.find((entry) => entry.anatomy?.length && entry.practices?.length)

describe('ComponentPage', () => {
  it('splits into an overview and a properties panel, and starts on the overview', async () => {
    await page('button')

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Properties' })).toHaveAttribute('aria-selected', 'false')

    // The examples are the overview's; the props are not, and Radix does not
    // render the panel that is not showing.
    expect(screen.getByRole('heading', { name: 'Examples' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Props' })).toBeNull()
  })

  it('puts the live panel behind the second tab', async () => {
    await page('button')
    selectTab('Properties')

    expect(screen.getByRole('heading', { name: 'Props' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copy JSX/ })).toBeInTheDocument()
    // Button's own variant union, resolved through the alias the package
    // exports rather than through an inline union it does not write.
    expect(screen.getByRole('combobox', { name: 'variant' })).toBeInTheDocument()
  })

  it('renders anatomy and best practices where the catalog has them', async () => {
    expect(DOCUMENTED, 'no catalog entry carries anatomy and practices yet').toBeTruthy()
    await page(DOCUMENTED!.slug)

    expect(screen.getByRole('heading', { name: 'Anatomy' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Best practices' })).toBeInTheDocument()
    // Do and don't are told apart by a word, not only by the colour of an icon.
    expect(screen.getByRole('heading', { name: 'Do' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Don’t' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: `${DOCUMENTED!.name} anatomy` })).toBeInTheDocument()
  })

  it('renders a component that has neither, without either section', async () => {
    await page('bare')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bare')
    expect(screen.queryByRole('heading', { name: 'Anatomy' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Best practices' })).toBeNull()
    // The sections that do not depend on the new fields are still there, which
    // is the half of "renders without throwing" a passing render cannot show.
    expect(screen.getByRole('heading', { name: 'Usage' })).toBeInTheDocument()
  })
})
