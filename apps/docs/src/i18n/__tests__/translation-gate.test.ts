import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import manifest from '@/generated/i18n-source.json'
import { DEFERRED, isDeferred, matches, patternSource, type Translation } from '../deferred'
import { fingerprint } from '../api-hash'
import { fingerprint as buildFingerprint } from '../../../scripts/i18n-manifest.mjs'
import { ZH } from '../zh'

/**
 * The gate.
 *
 * Three mechanisms guard the same promise, and they fail at different moments
 * on purpose. The COMPILER refuses a missing translation, because `ZH` is total
 * over every key that is not deferred — that one is not in this file, it is the
 * type in `deferred.ts`, and it fires while the catalog is being edited. What is
 * here is the rest: the translation that no longer belongs to anything, the
 * deferral that outlived its backlog, the call site asking for a key that does
 * not exist, and — the one that motivated all of it — the translation that is
 * still present, still typed, and no longer true.
 *
 * The failure this whole arrangement exists to prevent is not a blank page. It
 * is a Chinese sentence that confidently states what the English used to say.
 */

const SOURCE = manifest as Record<string, { en: string; hash: string }>
const KEYS = Object.keys(SOURCE)
const TABLE = ZH as Record<string, Translation>

describe('the translation gate', () => {
  it('requires exactly the keys that are not deferred', () => {
    // `ZH` is typed `Record<RequiredKey, …>`, and `RequiredKey` is the generated
    // union minus the DeferredKey patterns. `isDeferred` is the runtime twin of
    // those patterns. Two hand-written things that must agree is the very bug
    // this file exists to prevent, so they are compared rather than trusted:
    // this one assertion catches a pattern that drifted from its type arm, a
    // translation for a key that no longer exists, and — before the compiler
    // gets there — a key with no translation at all.
    const required = KEYS.filter((key) => !isDeferred(key)).sort()
    expect(Object.keys(TABLE).sort()).toEqual(required)
  })

  it('carries no deferral that has stopped matching anything', () => {
    // A field that gets translated must not leave its excuse behind. This is
    // what makes the list in `deferred.ts` a backlog rather than a graveyard:
    // finishing the work forces the line explaining why it was not done to be
    // deleted in the same commit.
    const dead = DEFERRED.flatMap((deferral) => deferral.patterns).filter(
      (pattern) => !KEYS.some((key) => matches(pattern, key)),
    )
    expect(dead).toEqual([])
  })

  it('gives every deferral an owner, a date and a reason', () => {
    // "TODO" is not a reason, and a deferral nobody owns is one nobody lifts.
    const thin = DEFERRED.filter(
      (deferral) =>
        deferral.patterns.length === 0 ||
        !deferral.owner ||
        !/^\d{4}-\d{2}-\d{2}$/.test(deferral.since) ||
        deferral.reason.trim().length < 40,
    )
    expect(thin.flatMap((deferral) => deferral.patterns)).toEqual([])
  })

  it('is still current for every translated string', () => {
    // The one that catches a REWORDED English. A translation records the
    // fingerprint of the sentence it was made from; the catalog is a build
    // artifact of the package, so editing a summary there lands here with no
    // other signal at all. The message carries the replacement line, because a
    // gate that reports drift without saying what to paste is a gate people
    // learn to route around.
    const stale = Object.entries(TABLE)
      .filter(([key, [, hash]]) => hash !== SOURCE[key]!.hash)
      .map(([key, [zh]]) => `  ${JSON.stringify(key)}: [${JSON.stringify(zh)}, '${SOURCE[key]!.hash}'],`)
    expect(stale, stale.length ? `English moved. Re-read these, then paste:\n${stale.join('\n')}` : '')
      .toEqual([])
  })

  it('asks only for keys that exist', () => {
    // The gate's blind spot, closed. A page reads its Chinese by building a key
    // from a template literal, and a key that matches nothing falls back to the
    // English — which looks exactly like a deferral and would therefore never
    // be noticed. Every interpolated key in the render layer has to match at
    // least one real string.
    //
    // Interpolated ones only: `${` is what tells a call site apart from the
    // same path written inside a doc comment.
    const unresolved: string[] = []
    for (const { file, text } of renderSources()) {
      for (const match of text.matchAll(/`((?:component|example|foundation|template|law)\.[^`]*)`/g)) {
        const template = match[1]!
        if (!template.includes('${')) continue
        const shape = new RegExp(`^${patternSource(template.replace(/\$\{[^}]*\}/g, '*'))}$`)
        if (!KEYS.some((key) => shape.test(key))) unresolved.push(`${file} → ${template}`)
      }
    }
    expect(unresolved).toEqual([])
  })

  it('bolds nothing, because these strings are printed as plain text', () => {
    // Inherited from the catalogue this table replaced, and still true: the API
    // reference is rendered as markdown and this is not, which is invisible
    // from inside either one — so `**…**` here reaches the page as literal
    // asterisks. The English emphasises with CAPS, which Chinese has no
    // equivalent of, and every case turned out to carry its emphasis
    // structurally anyway.
    const marked = Object.entries(TABLE)
      .filter(([, [zh]]) => zh.includes('**'))
      .map(([key]) => key)
    expect(marked).toEqual([])
  })

  it('fingerprints the same way the build script does', () => {
    // The manifest is stamped by a build script and checked by the app, which
    // are two copies of one function — the build must not depend on the app
    // compiling, so they cannot be one. If they ever disagree every entry goes
    // stale at once, which is loud but points at the wrong thing.
    for (const sample of ['one two three', 'a\n  b', '按钮', '']) {
      expect(buildFingerprint(sample)).toBe(fingerprint(sample))
    }
    // And the stamps in the manifest are the stamps of the English beside them.
    const wrong = KEYS.filter((key) => SOURCE[key]!.hash !== fingerprint(SOURCE[key]!.en))
    expect(wrong).toEqual([])
  })
})


/**
 * The render layer — the files that build translation keys.
 *
 * `src/i18n` is skipped: it holds the tables themselves, and their doc comments
 * name key shapes in order to explain them.
 */
function renderSources(): { file: string; text: string }[] {
  const src = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const found: { file: string; text: string }[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'generated' && entry.name !== 'i18n') walk(path)
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        found.push({ file: relative(src, path), text: readFileSync(path, 'utf8') })
      }
    }
  }
  walk(src)
  return found
}
