import { describe, expect, it } from 'vitest'
import { COMPONENTS } from '@/content/registry'
import { COMPONENTS_ZH } from '../content'

/**
 * The Chinese catalogue is written by hand against a registry that moves.
 *
 * Everything here is a way the two fall out of step silently: a slug that no
 * longer exists translates nothing, and a keyboard list of the wrong length
 * pairs a Chinese sentence with the wrong key — which reads as a translation
 * rather than as a bug, and is therefore worse than no translation at all.
 */
describe('the Chinese catalogue', () => {
  it('translates only slugs that exist', () => {
    const slugs = new Set(COMPONENTS.map((entry) => entry.slug))
    expect(Object.keys(COMPONENTS_ZH).filter((slug) => !slugs.has(slug))).toEqual([])
  })

  it('gives every component a summary', () => {
    const missing = COMPONENTS.filter((entry) => !COMPONENTS_ZH[entry.slug]?.summary)
    expect(missing.map((entry) => entry.slug)).toEqual([])
  })

  it('gives every component a Chinese name', () => {
    // The sidebar prints `Button 按钮`, and a component with no name here is
    // simply an English word in a Chinese index. It went unnoticed for all
    // twenty chart and data primitives, because nothing in this file looked:
    // the summary was there, the page read as translated, and the one place
    // the gap showed was a list nobody diffs.
    const missing = COMPONENTS.filter((entry) => !COMPONENTS_ZH[entry.slug]?.name)
    expect(missing.map((entry) => entry.slug)).toEqual([])
  })

  it('bolds nothing, because these fields are printed as plain text', () => {
    // `api.ts` is rendered as markdown and this file is not, which is not
    // visible from inside either one — so `**…**` here reached the page as
    // literal asterisks, on nineteen lines, for as long as they had been there.
    //
    // The English never bolds either; it emphasises with CAPS, which Chinese
    // has no equivalent of. Every one of the nineteen turned out to carry its
    // emphasis structurally anyway — 不只是…是…, 却, a repeated noun — so the
    // markers were decoration on prose that did not need them.
    //
    // Backticks are deliberately NOT checked here. Those print literally too,
    // but they are in the English as well, so they are one defect in the
    // package's catalog rather than a translation that drifted.
    const marked: string[] = []
    for (const [slug, copy] of Object.entries(COMPONENTS_ZH)) {
      const strings = [
        copy.name,
        copy.summary,
        copy.when,
        ...(copy.accessibility ?? []),
        ...(copy.keyboard ?? []),
      ]
      if (strings.some((text) => text?.includes('**'))) marked.push(slug)
    }
    expect(marked).toEqual([])
  })

  it.each(COMPONENTS.filter((entry) => entry.keyboard?.length))(
    'pairs $slug keyboard rows one to one',
    (entry) => {
      // Positional, so a row added in English without one here would shift
      // every sentence below it onto the wrong key.
      const zh = COMPONENTS_ZH[entry.slug]?.keyboard
      expect(zh, `${entry.slug} has no Chinese keyboard rows`).toBeDefined()
      expect(zh).toHaveLength(entry.keyboard!.length)
    },
  )

  it.each(COMPONENTS.filter((entry) => entry.accessibility?.length))(
    'pairs $slug accessibility lines one to one',
    (entry) => {
      const zh = COMPONENTS_ZH[entry.slug]?.accessibility
      expect(zh, `${entry.slug} has no Chinese accessibility lines`).toBeDefined()
      expect(zh).toHaveLength(entry.accessibility!.length)
    },
  )
})
