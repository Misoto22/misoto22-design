import type { Locale } from './locales'
import type { Translation } from './deferred'
import { ZH } from './zh'

/**
 * Reading the keyed translations, from a page.
 *
 * One function, and it takes the English as an argument rather than looking it
 * up: the caller already has it — it came out of the same catalog entry the
 * page is rendering — and a lookup table of every English string would put the
 * whole catalog into the client bundle a second time.
 *
 * That also fixes the fallback. A key with no translation returns the English,
 * so a page renders in the reader's second language rather than blank, and a
 * deferral in `deferred.ts` needs no code change to take effect — nor does
 * lifting one. The translations land, the pages pick them up.
 */

/**
 * `Record<RequiredKey, …>` is total over the keys the compiler insists on, and
 * a deferred key is deliberately not one of them. Widened here, at the one
 * boundary that reads the table, so that a page may ask for a key whose
 * translation has not been written yet and get the English back.
 */
const TABLE = ZH as Record<string, Translation | undefined>

/**
 * The Chinese for a catalog or example string, or the English it was given.
 *
 * Keys are the ones in `src/generated/i18n-keys.ts`:
 * `component.<slug>.summary`, `component.<slug>.anatomy.<i>.description`,
 * `example.<dir>.<id>.title`, and so on. They are built from template literals
 * at the call sites, so `translation-gate.test.ts` checks the SHAPES against the
 * manifest — a key that matches nothing would fall back to English forever and
 * look exactly like a deferral.
 */
export function catalogCopy(locale: Locale, key: string, english: string): string {
  if (locale === 'en') return english
  return TABLE[key]?.[0] ?? english
}
