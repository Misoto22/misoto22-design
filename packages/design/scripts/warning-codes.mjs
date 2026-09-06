/**
 * The development warnings this package can emit, read out of the source that
 * emits them.
 *
 * They are part of the agent-facing contract, not an implementation detail: an
 * agent that sees `FIELD_CONTROL_NOT_LABELLABLE` in a console should be able to
 * look it up, and a documentation site that lists three of the four is worse
 * than one that lists none, because the missing one reads as "not a real code".
 *
 * Derived for the same reason the theme axes are. A hand-kept list of codes is
 * a list that goes stale the first time someone adds a warning and does not
 * think about the website — which is exactly how the site came to describe a
 * `data-accent` attribute that never existed.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')

/** `code: 'FIELD_CONTROL_NOT_WIRED',` — the one shape `warn()` accepts. */
const CODE = /code:\s*'([A-Z][A-Z0-9_]+)'/g

function walk(dir, files) {
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      walk(path, files)
      continue
    }
    // Tests assert on codes and must not be able to invent one.
    if (/\.test\.tsx?$/.test(entry)) continue
    if (/\.tsx?$/.test(entry)) files.push(path)
  }
  return files
}

/**
 * @returns {string[]} every warning code the package emits, sorted.
 */
export function warningCodes() {
  const found = new Set()
  for (const file of walk(SRC, [])) {
    for (const [, code] of readFileSync(file, 'utf8').matchAll(CODE)) found.add(code)
  }
  return [...found].sort()
}
