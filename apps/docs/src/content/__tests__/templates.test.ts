import { describe, expect, it } from 'vitest'
import { TEMPLATES, TEMPLATE_BY_SLUG, TEMPLATE_CATEGORIES } from '../templates'
import { TEMPLATE_COMPONENTS } from '@/generated/template-registry'
import templatesJson from '@/generated/templates.json'

const MODULES = templatesJson as Record<string, { source: string }>

/**
 * The template list is hand-written; the modules it points at are found on
 * disk by the generator. Nothing else makes the two agree.
 *
 * Every failure below is a page that renders a red box or a card that goes
 * nowhere, and none of them fails a build: `TemplateFrame` prints "no template
 * is registered" rather than throwing, which is the right thing at runtime and
 * the reason this has to be checked here instead.
 */
describe('templates', () => {
  it('points every entry at a module that resolves', () => {
    // The generated map is built by importing each file under `src/templates`.
    // An entry whose `id` is not a key of it is an entry naming a file that
    // does not exist — a typo in a slug's PascalCase twin, usually.
    const dangling = TEMPLATES.filter((entry) => !TEMPLATE_COMPONENTS[entry.id])
    expect(dangling.map((entry) => `${entry.slug} → ${entry.id}`)).toEqual([])
  })

  it('has highlighted source for every entry', () => {
    // The "Code" section reads from the same generated file the preview
    // renders from. Missing source is a page with a live template and no
    // listing under it.
    const missing = TEMPLATES.filter((entry) => !MODULES[entry.id]?.source)
    expect(missing.map((entry) => entry.id)).toEqual([])
  })

  it('lists every module that exists', () => {
    // The other direction: a template file nobody added to the list is a
    // screen that was written, compiled, and is reachable from nowhere.
    const claimed = new Set(TEMPLATES.map((entry) => entry.id))
    expect(Object.keys(MODULES).filter((id) => !claimed.has(id))).toEqual([])
  })

  it('uses unique slugs', () => {
    const slugs = TEMPLATES.map((entry) => entry.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    // And the lookup the route handler uses loses none of them.
    expect(TEMPLATE_BY_SLUG.size).toBe(TEMPLATES.length)
  })

  it('uses unique module ids', () => {
    // Two entries on one module is two routes rendering the same screen, with
    // the second one's summary describing something that is not on the page.
    const ids = TEMPLATES.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('files every entry under a declared category', () => {
    // The index's filter strip is built from `TEMPLATE_CATEGORIES`. A category
    // that is not in it has no segment, so its templates are reachable only by
    // clearing the filter — visible, and invisible, at the same time.
    const declared = new Set<string>(TEMPLATE_CATEGORIES)
    const stray = TEMPLATES.filter((entry) => !declared.has(entry.category))
    expect(stray.map((entry) => `${entry.slug} → ${entry.category}`)).toEqual([])
  })

  it('declares no category with nothing in it', () => {
    const used = new Set(TEMPLATES.map((entry) => entry.category))
    expect(TEMPLATE_CATEGORIES.filter((name) => !used.has(name))).toEqual([])
  })

  it('gives every entry a summary, a failure mode and a parts list', () => {
    // `tests` is the field that stops this becoming a screenshot gallery: it
    // names what the entry proves that no other entry does. An empty one is an
    // entry nobody could argue for keeping.
    const thin = TEMPLATES.filter(
      (entry) => !entry.summary.trim() || !entry.tests.trim() || entry.uses.length === 0,
    )
    expect(thin.map((entry) => entry.slug)).toEqual([])
  })
})
