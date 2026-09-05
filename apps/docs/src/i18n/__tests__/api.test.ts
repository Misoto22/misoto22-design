import { describe, expect, it } from 'vitest'
import propsJson from '@/generated/props.json'
import { API_ZH } from '../api'
import { fingerprint } from '../api-hash'

interface Source {
  components: { name: string; description?: string; props?: { name: string; description?: string }[] }[]
}

/** Every English string the API reference publishes, by its catalogue key. */
const ENGLISH = new Map<string, string>()
for (const [dir, source] of Object.entries(propsJson as unknown as Record<string, Source>)) {
  for (const component of source.components) {
    if (component.description) ENGLISH.set(`${dir}.${component.name}`, component.description)
    for (const prop of component.props ?? []) {
      if (prop.description) ENGLISH.set(`${dir}.${component.name}#${prop.name}`, prop.description)
    }
  }
}

/**
 * The reason the API reference was English for so long was drift: it is parsed
 * out of the package's own source, so a translation is a copy the original can
 * move out from under, and a stale translation says something that stopped
 * being true — worse than English a reader can follow.
 *
 * These are what make translating it safe. Editing a doc comment in the package
 * now fails the build until the Chinese beside it is updated.
 */
describe('the Chinese API reference', () => {
  it('translates every string the pages print', () => {
    const missing = [...ENGLISH.keys()].filter((key) => !API_ZH[key])
    expect(missing).toEqual([])
  })

  it('translates nothing that no longer exists', () => {
    const orphans = Object.keys(API_ZH).filter((key) => !ENGLISH.has(key))
    expect(orphans).toEqual([])
  })

  it.each([...ENGLISH.keys()])('is still current for %s', (key) => {
    // The fingerprint is of the English this was translated from. A mismatch
    // means the doc comment moved and the Chinese did not.
    expect(API_ZH[key]!.hash).toBe(fingerprint(ENGLISH.get(key)!))
  })

  it('reflows without counting as a change', () => {
    // A JSDoc block wrapped at a different column is the same sentence.
    expect(fingerprint('one two\n   three')).toBe(fingerprint('one two three'))
  })
})
