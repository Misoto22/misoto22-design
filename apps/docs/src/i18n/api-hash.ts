/**
 * A short, stable fingerprint of an English source string.
 *
 * The API reference is parsed out of the package's own source, so a translation
 * of it is a copy that the original can move out from under. The fingerprint is
 * what makes that loud: each translation records the English it was made from,
 * and `api.test.ts` fails when the two no longer match. A stale translation
 * then breaks the build instead of quietly telling a Chinese reader something
 * that stopped being true.
 *
 * FNV-1a, because it needs to be short, deterministic across Node and the
 * browser, and readable in a diff — not cryptographic.
 */
export function fingerprint(source: string): string {
  let hash = 0x811c9dc5
  // Normalised the way the pages consume it, so a reflowed JSDoc comment — the
  // same words at a different column width — is not a change.
  const text = source.replace(/\s+/g, ' ').trim()
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
