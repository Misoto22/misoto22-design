#!/usr/bin/env node
/**
 * The same text, at the URL an agent guesses.
 *
 * Every component page already publishes its markdown at
 * `/components/<slug>/llms.txt`, and the page's head points at it. That covers a
 * reader who reads the head. It does not cover the commoner behaviour: an agent
 * holding a page URL appends `.md` to it and fetches, because that is what
 * enough documentation sites now serve for the guess to be worth making.
 *
 * The one retrieval-layer technique with a measured effect is this one — the
 * saving is proportional to how much of the HTML the agent would otherwise have
 * pulled, and a component page is mostly rendered examples and highlighted
 * source. `llms.txt` itself is, on the published evidence, almost never fetched.
 *
 * Copied rather than re-rendered, and after the export rather than beside it.
 * Next cannot express a route at `/components/<slug>.md` — a dynamic segment
 * carrying its own extension collides with the page at the same path — and a
 * second renderer for the same bytes is the kind of duplicate that goes quietly
 * out of step. Copying makes drift impossible rather than merely unlikely.
 */
import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'out')
const COMPONENTS = join(OUT, 'components')

function main() {
  if (!existsSync(COMPONENTS)) {
    throw new Error(`No static export at ${OUT}. This runs after \`next build\`.`)
  }

  let written = 0
  for (const slug of readdirSync(COMPONENTS).sort()) {
    const dir = join(COMPONENTS, slug)
    if (!statSync(dir).isDirectory()) continue

    const source = join(dir, 'llms.txt')
    if (!existsSync(source)) continue

    copyFileSync(source, join(COMPONENTS, `${slug}.md`))
    written += 1
  }

  // The site index too, under the name a reader guesses for a root document.
  const index = join(OUT, 'llms.txt')
  if (existsSync(index)) {
    copyFileSync(index, join(OUT, 'index.md'))
    written += 1
  }

  if (written === 0) {
    throw new Error('No llms.txt files found to copy — the export is missing its agent text.')
  }
  console.log(`emit-markdown: ${written} files → out/**.md`)
}

main()
