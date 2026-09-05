/**
 * Parses `CHANGELOG.md` into the structure the changelog page renders.
 *
 * A tolerant parser rather than a Markdown library, and deliberately: the file
 * has exactly one shape today (hand-written) and will have a second once
 * changesets starts assembling it (`### Minor Changes` and a bullet per
 * change). Both are headings, bullets and paragraphs. Pulling in a Markdown
 * pipeline to read two heading levels would be a dependency and a sanitiser
 * for no reading the page could not already do.
 *
 * Anything it does not recognise becomes a paragraph, so a future entry cannot
 * silently vanish from the page.
 */
import { readFileSync } from 'node:fs'

/** `## 0.2.0 — 2026-09-05` → `{ version, date }`. */
function parseVersionHeading(line) {
  const text = line.replace(/^##\s+/, '').trim()
  const [version, date] = text.split(/\s+[—–-]\s+/)
  return { version: version?.trim() ?? text, date: date?.trim() }
}

export function extractChangelog(path) {
  const lines = readFileSync(path, 'utf8').split('\n')

  const releases = []
  let release
  let section
  let paragraph = []

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    const text = paragraph.join(' ').trim()
    paragraph = []
    if (!text) return
    if (!release) return
    ;(section ?? ensureSection('')).items.push({ kind: 'paragraph', text })
  }

  const ensureSection = (title) => {
    if (!release) return { items: [] }
    let found = release.sections.find((candidate) => candidate.title === title)
    if (!found) {
      found = { title, items: [] }
      release.sections.push(found)
    }
    section = found
    return found
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.startsWith('## ')) {
      flushParagraph()
      release = { ...parseVersionHeading(line), sections: [] }
      section = undefined
      releases.push(release)
      continue
    }

    if (line.startsWith('### ')) {
      flushParagraph()
      ensureSection(line.replace(/^###\s+/, '').trim())
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph()
      ;(section ?? ensureSection('')).items.push({
        kind: 'item',
        text: line.replace(/^[-*]\s+/, '').trim(),
      })
      continue
    }

    if (line.trim() === '') {
      flushParagraph()
      continue
    }

    // A continuation of the previous bullet, if there is one — changesets wraps
    // long entries across lines.
    const current = section?.items.at(-1)
    if (current?.kind === 'item' && /^\s{2,}\S/.test(raw)) {
      current.text = `${current.text} ${line.trim()}`
      continue
    }

    if (release) paragraph.push(line.trim())
  }
  flushParagraph()

  return releases
}
