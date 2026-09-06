import type { TranslatableKey } from '@/generated/i18n-keys'

/**
 * The translations this site has decided not to write yet, and why.
 *
 * A gate with no escape valve is a gate somebody switches off. The escape valve
 * is this file, and its whole point is that using it costs a visible edit: a
 * deferral is a block with an owner, a date and a reason, sitting in the diff
 * beside the English that caused it. "Ship English now, Chinese later" is a
 * legitimate call — `docs/astryx-parity-plan.md` made it deliberately — but the
 * version of it that went wrong was the one nothing wrote down, so nothing
 * remembered: five foundations pages and eight templates sat in English on a
 * Chinese site for as long as nobody happened to open them. Those thirteen were
 * the first thing this file was used to clear, and clearing them is what
 * deleted their entries from it.
 *
 * The list only ever shrinks. `translation-gate.test.ts` fails on a pattern
 * that no longer matches anything, so a page that gets translated cannot leave
 * its excuse behind.
 */
export interface Deferral {
  /**
   * Key patterns, where `*` stands for any run of characters — so
   * `component.*.anatomy.*` names that field across every component.
   *
   * A list rather than one string because a single decision often covers
   * several pages — the thirteen this file opened with were two decisions —
   * and one reason written once beats the same sentence thirteen times. Each
   * pattern is still checked for deadness on its own, so finishing ONE page
   * forces an edit here.
   *
   * They must mirror the arms of `DeferredKey` below exactly. Two hand-written
   * things that have to agree is the failure this whole file exists to prevent,
   * so the gate cross-checks them rather than trusting the pair.
   */
  patterns: string[]
  /** Why this is English for now. Not "TODO" — the actual reason. */
  reason: string
  /** When the deferral was taken, so its age is readable. */
  since: string
  /** Who decided. */
  owner: string
}

export const DEFERRED: Deferral[] = [
  {
    patterns: ['component.*.anatomy.*'],
    reason:
      'Anatomy arrived with the parity sweep and landed on all 92 components at once — 880 strings. The plan that added it chose English first and Chinese as its own phase, which is defensible for a section that names parts rather than explaining them. This is that phase, unstarted.',
    since: '2026-09-06',
    owner: 'henry',
  },
  {
    patterns: ['component.*.practices.*'],
    reason:
      'Best practices arrived in the same sweep — 544 judgements, the densest prose in the catalog and the most expensive to translate badly. A wrong translation of "do this or that breaks" is worse than the English, which is the argument for deferring rather than machine-filling it.',
    since: '2026-09-06',
    owner: 'henry',
  },
  {
    patterns: ['example.*'],
    reason:
      'Every example carries a title and a sentence — 632 strings across 316 files, both authored in the example file itself rather than in a table. Worth doing once the two catalog fields above are done and the keyed shape has proved itself.',
    since: '2026-09-06',
    owner: 'henry',
  },
]

/**
 * The same patterns, as a type.
 *
 * This is the half that makes the gate a compile error rather than a test
 * failure: `RequiredKey` is every key MINUS these, and `ZH` is a total record
 * over it, so a catalog entry that grows a new accessibility line fails `tsc`
 * naming the key. A template literal arm and a `*` pattern above must say the
 * same thing; `translation-gate.test.ts` is what holds them together.
 */
export type DeferredKey =
  | `component.${string}.anatomy.${string}`
  | `component.${string}.practices.${string}`
  | `example.${string}`

/** Every key the compiler insists on a translation for. */
export type RequiredKey = Exclude<TranslatableKey, DeferredKey>

/** One translation, and the fingerprint of the English it was made from. */
export type Translation = readonly [zh: string, hash: string]

/** Whether a key is covered by a deferral. The runtime twin of `DeferredKey`. */
export function isDeferred(key: string): boolean {
  return DEFERRED.some((deferral) => deferral.patterns.some((pattern) => matches(pattern, key)))
}

/**
 * `component.*.anatomy.*` matches `component.button.anatomy.0.element`.
 *
 * `*` spans dots, exactly as `${string}` does in the type. A `*` that stopped
 * at a segment boundary would be the more familiar glob, and would quietly
 * disagree with the type for any key deeper than the pattern.
 */
export function matches(pattern: string, key: string): boolean {
  return new RegExp(`^${patternSource(pattern)}$`).test(key)
}

/** The regex body for a pattern, shared with the gate's own shape checks. */
export function patternSource(pattern: string): string {
  return pattern
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
}
