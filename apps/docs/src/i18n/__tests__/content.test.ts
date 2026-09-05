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
