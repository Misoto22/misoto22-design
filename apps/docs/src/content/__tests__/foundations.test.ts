import { describe, expect, it } from 'vitest'
import { FOUNDATIONS, FOUNDATION_BY_SLUG } from '../foundations'
import { ROUTES } from '../routes'
import snippetsJson from '@/generated/snippets.json'
import tokensJson from '@/generated/tokens.json'

/**
 * The foundations pages are the one part of this site with two shapes.
 *
 * Most of them name a token category and render whatever the extractor found
 * under it; two of them carry prose and name nothing. Both shapes fail the same
 * way — a page that renders a title and a void — and neither failure shows up
 * in a build log, because a missing category and an empty section are both
 * perfectly valid data.
 */

const TOKEN_CATEGORIES = new Set(
  Object.values(tokensJson as Record<string, { category: string }>).map((token) => token.category),
)
const SNIPPET_IDS = new Set(Object.keys(snippetsJson))

describe('foundations', () => {
  it('uses unique slugs', () => {
    const slugs = FOUNDATIONS.map((page) => page.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    // And the lookup the page view uses covers all of them. A duplicate slug
    // would pass the count above and still shadow a page in the Map.
    expect(FOUNDATION_BY_SLUG.size).toBe(FOUNDATIONS.length)
  })

  it('publishes a route for every entry, in both languages', () => {
    const routes = new Set(ROUTES)
    const missing = FOUNDATIONS.flatMap((page) =>
      [`/foundations/${page.slug}/`, `/zh/foundations/${page.slug}/`].filter(
        (route) => !routes.has(route),
      ),
    )
    expect(missing).toEqual([])
  })

  it('backs every published foundations route with a page', () => {
    // The other direction: a route added by hand that no entry answers is a
    // sitemap URL and an accessibility sweep pointed at a 404.
    const dangling = ROUTES.filter((route) => route.includes('/foundations/')).filter((route) => {
      const slug = route.replace(/^\/zh/, '').replace('/foundations/', '').replace(/\/$/, '')
      return !FOUNDATION_BY_SLUG.has(slug)
    })
    expect(dangling).toEqual([])
  })

  it('only names token categories the extractor actually emits', () => {
    // A renamed category does not throw — `tokensByCategory` returns no rows
    // and `TokenTable` returns null — so the section simply stops existing.
    const unknown = FOUNDATIONS.flatMap((page) =>
      page.categories
        .filter((category) => !TOKEN_CATEGORIES.has(category.key))
        .map((category) => `${page.slug} → ${category.key}`),
    )
    expect(unknown).toEqual([])
  })

  it('gives every page something to render', () => {
    // A page needs a table or prose. Either alone is fine; neither is a title
    // over an empty column.
    const empty = FOUNDATIONS.filter(
      (page) => page.categories.length === 0 && (page.sections?.length ?? 0) === 0,
    )
    expect(empty.map((page) => page.slug)).toEqual([])
  })

  it('cross-links only to pages that exist, and never to itself', () => {
    const broken = FOUNDATIONS.flatMap((page) =>
      (page.related ?? [])
        .filter((slug) => !FOUNDATION_BY_SLUG.has(slug) || slug === page.slug)
        .map((slug) => `${page.slug} → ${slug}`),
    )
    expect(broken).toEqual([])
  })

  it('names only snippets the generator produced', () => {
    // `snippet()` throws on a miss, which would take the whole static export
    // down rather than one block — worth catching in a unit test first.
    const missing = FOUNDATIONS.flatMap((page) =>
      (page.sections ?? []).flatMap((section) =>
        (section.snippets ?? [])
          .filter((id) => !SNIPPET_IDS.has(id))
          .map((id) => `${page.slug}/${section.id} → ${id}`),
      ),
    )
    expect(missing).toEqual([])
  })

  it('gives every prose section a unique anchor within its page', () => {
    const collisions = FOUNDATIONS.flatMap((page) => {
      const ids = (page.sections ?? []).map((section) => section.id)
      return new Set(ids).size === ids.length ? [] : [page.slug]
    })
    expect(collisions).toEqual([])
  })
})
