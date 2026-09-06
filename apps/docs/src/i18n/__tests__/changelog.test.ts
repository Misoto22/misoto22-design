import { describe, expect, it } from 'vitest'
import changelog from '@/generated/changelog.json'
import { CHANGELOG_ZH } from '../changelog'
import { fingerprint } from '../api-hash'

interface Block { text: string }
interface Item { text: string; body?: Block[] }
interface Release { sections: { title: string; items: Item[] }[] }

/** Every English string the changelog page prints, by its fingerprint. */
const ENGLISH = new Map<string, string>()
for (const release of changelog as unknown as Release[]) {
  for (const section of release.sections) {
    if (section.title) ENGLISH.set(fingerprint(section.title), section.title)
    for (const item of section.items) {
      ENGLISH.set(fingerprint(item.text), item.text)
      for (const block of item.body ?? []) ENGLISH.set(fingerprint(block.text), block.text)
    }
  }
}

/**
 * The changelog's translation is keyed by the fingerprint of the English, so
 * drift can only ever produce a fallback to English — never a stale sentence
 * presented as current. There is therefore nothing to enforce about coverage;
 * an untranslated line is a backlog item, not a bug.
 *
 * An ORPHAN is different. A translation whose English exists nowhere is either
 * a typo in the key or a line that was reworded, and in both cases the Chinese
 * it carries will never be shown again — so it is dead weight that reads as
 * work already done.
 */
describe('the Chinese changelog', () => {
  it('translates nothing that is not in the changelog', () => {
    const orphans = Object.keys(CHANGELOG_ZH).filter((key) => !ENGLISH.has(key))
    expect(orphans).toEqual([])
  })

  it('covers the releases the page leads with', () => {
    // Not every line, ever — but the current release being half-English would
    // be worse than no translation at all, so that much is a gate.
    const latest = (changelog as unknown as Release[])[0]!
    const strings = latest.sections.flatMap((section) => [
      section.title,
      ...section.items.flatMap((item) => [item.text, ...(item.body ?? []).map((b) => b.text)]),
    ])
    const missing = strings.filter((text) => text && !CHANGELOG_ZH[fingerprint(text)])
    expect(missing).toEqual([])
  })
})
