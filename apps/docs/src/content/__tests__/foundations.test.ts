import { describe, expect, it } from 'vitest'
import { FOUNDATIONS, FOUNDATION_BY_SLUG } from '../foundations'
import { foundationCopy } from '@/i18n/content'
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

/**
 * And the same pages, in Chinese.
 *
 * `FoundationPage` falls back field by field, so an untranslated page is not a
 * blank page or a crash — it is a complete, well-formed English page served
 * under /zh, which reads as a page rather than as a gap. Five of them shipped
 * that way in one week (icons, elevation, shape, agents, getting-started) and
 * nothing here looked, because nothing here knew the Chinese existed.
 *
 * The prose `sections` are checked the same way, keyed by section id and by
 * row term. `snippets` and `commands` are not, and have no Chinese to check:
 * an install line and an `npx` invocation are the same bytes in both languages.
 */
describe('the Chinese foundations copy', () => {
  it('translates the title and summary of every page', () => {
    // These two travel furthest: the rail, the footer, the command palette, the
    // home page card and the <title> of the document all read them.
    const missing = FOUNDATIONS.filter((page) => {
      const zh = foundationCopy('zh', page.slug)
      return !zh.title?.trim() || !zh.summary?.trim()
    })
    expect(missing.map((page) => page.slug)).toEqual([])
  })

  it('keeps the intro the same number of paragraphs', () => {
    // `zh.intro` REPLACES the English array rather than merging into it, so a
    // list one item short does not fall back for the item it is missing — it
    // drops the paragraph, silently, off the end of the page.
    const drifted = FOUNDATIONS.filter(
      (page) => (foundationCopy('zh', page.slug).intro?.length ?? 0) !== page.intro.length,
    )
    expect(drifted.map((page) => page.slug)).toEqual([])
  })

  it('translates every token category heading and note, and invents none', () => {
    // Keyed by the category key rather than positional, which fails in both
    // directions: a key with no entry prints an English heading in the middle
    // of a Chinese page, and a key no page names is a translation that will
    // never be read by anything.
    const gaps = FOUNDATIONS.flatMap((page) => {
      const zh = foundationCopy('zh', page.slug).categories ?? {}
      const named = new Set(page.categories.map((category) => category.key))
      return [
        ...page.categories
          .filter((category) => !zh[category.key]?.title?.trim())
          .map((category) => `${page.slug} → ${category.key}: no title`),
        ...page.categories
          .filter((category) => category.note && !zh[category.key]?.note?.trim())
          .map((category) => `${page.slug} → ${category.key}: no note`),
        ...Object.keys(zh)
          .filter((key) => !named.has(key))
          .map((key) => `${page.slug} → ${key}: not a category on this page`),
      ]
    })
    expect(gaps).toEqual([])
  })

  it('translates every prose section — its heading, its paragraphs and its rows', () => {
    // The two prose pages are the ones a reader arrives on: `getting-started`
    // says what to install and `agents` says what to run. Keyed rather than
    // positional, so it fails in both directions — a section or a row with no
    // entry prints English inside a Chinese page, and a key naming neither is
    // a translation nothing will ever read.
    const gaps = FOUNDATIONS.flatMap((page) => {
      const zh = foundationCopy('zh', page.slug).sections ?? {}
      const sections = page.sections ?? []
      const named = new Set(sections.map((section) => section.id))
      return [
        ...sections.flatMap((section) => {
          const copy = zh[section.id]
          const rows = copy?.rows ?? {}
          const terms = new Set((section.rows ?? []).map((row) => row.term))
          return [
            ...(copy?.title?.trim() ? [] : [`${page.slug}/${section.id}: no title`]),
            // `body` REPLACES the English array rather than merging into it,
            // exactly as `intro` does, so a short list drops paragraphs off
            // the end instead of falling back for the ones it is missing.
            ...(copy?.body?.length === section.body.length
              ? []
              : [
                  `${page.slug}/${section.id}: ${copy?.body?.length ?? 0} paragraphs, not ${section.body.length}`,
                ]),
            ...(section.rows ?? [])
              .filter((row) => !rows[row.term]?.trim())
              .map((row) => `${page.slug}/${section.id} → ${row.term}: no detail`),
            ...Object.keys(rows)
              .filter((term) => !terms.has(term))
              .map((term) => `${page.slug}/${section.id} → ${term}: not a row in this section`),
          ]
        }),
        ...Object.keys(zh)
          .filter((id) => !named.has(id))
          .map((id) => `${page.slug} → ${id}: not a section on this page`),
      ]
    })
    expect(gaps).toEqual([])
  })
})
