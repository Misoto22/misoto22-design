import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * English written directly into JSX, where nothing can translate it.
 *
 * The other two mechanisms cover prose that has somewhere to live: the catalog
 * and the site's own content go through `zh.ts`, and the chrome goes through
 * `messages.ts`, which types the Chinese off the English so a missing key is a
 * compile error. Neither of them can see a sentence typed straight into a
 * component — and that is the easiest way to add one, because it renders
 * correctly, reviews cleanly, and is only wrong on a page half the readers use.
 *
 * Three of them were found the day this test was written: a paragraph on every
 * component page explaining the Parts section, a "Read next" above the
 * foundations cross-links, and the editor's loading state. All three had been
 * there long enough that nobody read them as English any more.
 *
 * The bar is two words or more, because a one-word label is as likely to be an
 * identifier as copy, and this test is worth nothing if it cries wolf.
 */

/**
 * A JSX text child that reads like a sentence rather than an identifier.
 *
 * Text between `>` and `<` only, so a `className`, an `aria-label` or a prop
 * string is out of scope — those need a rule of their own and would drown this
 * one in false positives from utility classes.
 */
const PROSE = />\s*([A-Za-z][A-Za-z'’]*(?:\s+[A-Za-z'’.,—-]+)+[.!?]?)\s*</g

/**
 * Files whose English is the point.
 *
 * A specimen page prints English so a reader can see the type set; translating
 * it would be translating the exhibit. Each of these is a deliberate exception
 * with a reason, not a file somebody could not be bothered with.
 */
const ENGLISH_BY_DESIGN: Record<string, string> = {
  'app/not-found.tsx':
    'A static export serves one 404 for both locales, and it has no locale to read — there is no route parameter on a page that answers requests for routes that do not exist.',
  'app/opengraph-image.tsx':
    'One social card, rendered once at build time and served to both locales. The image has no reader to have a language.',
  'components/LawDemo.tsx':
    'The specimens ARE the demonstration: each law is illustrated with English type at the weight and step it argues about, and Chinese would change the thing being shown.',
  'components/ThemeSpecimen.tsx': 'Specimen labels, shown as an example of the type rather than read.',
  'components/IconSpecimen.tsx': 'Specimen captions, on the same argument as ThemeSpecimen.',
}

/**
 * Sentences that are addressed to whoever is building this site, not to a
 * reader — they appear only when the data and the code disagree.
 */
const DEVELOPER_FACING = ['No example is registered for', 'No template is registered for']

describe('chrome that no mechanism can translate', () => {
  it('routes every user-facing sentence through the message catalogue', () => {
    const stranded: string[] = []
    for (const { file, text } of chrome()) {
      if (ENGLISH_BY_DESIGN[file]) continue
      for (const match of text.matchAll(PROSE)) {
        const sentence = match[1]!.trim()
        if (DEVELOPER_FACING.some((prefix) => sentence.startsWith(prefix))) continue
        stranded.push(`${file} → ${sentence.slice(0, 60)}`)
      }
    }
    expect(stranded).toEqual([])
  })

  it('carries no exception for a file that has stopped needing one', () => {
    // Same rule the deferred translations follow: an excuse outlives the thing
    // it excused unless something fails when it does.
    const files = new Set(chrome().map((entry) => entry.file))
    expect(Object.keys(ENGLISH_BY_DESIGN).filter((file) => !files.has(file))).toEqual([])
  })
})

/**
 * The site's own components and views.
 *
 * `examples` and `templates` are excluded, and not as an oversight: they are
 * the code a reader copies, and a Chinese label inside a snippet about Button
 * would be pasted into somebody's English app. `i18n` holds the catalogues
 * themselves.
 */
function chrome(): { file: string; text: string }[] {
  const skip = new Set(['generated', 'i18n', 'examples', 'templates', '__tests__'])
  const found: { file: string; text: string }[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(path)
      } else if (entry.name.endsWith('.tsx')) {
        found.push({
          // Comments legitimately hold English prose, and explaining a rule is
          // most of what the comments in this repository do.
          file: relative(SRC, path),
          text: readFileSync(path, 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s*\/\/.*$/gm, ''),
        })
      }
    }
  }
  walk(SRC)
  return found
}
