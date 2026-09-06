#!/usr/bin/env node
/**
 * Two questions a design system should be able to answer about itself, and
 * usually cannot: how big is it, and does importing one component drag in the
 * other forty-six?
 *
 * The second is the one that matters. A package can be perfectly tree-shakeable
 * in principle and not be in practice — one `index.ts` side effect, one
 * component importing a barrel instead of a file, and every consumer ships the
 * calendar to render a badge. Nothing about that is visible in review; it shows
 * up as a bundle that grew and nobody knows when.
 *
 * So this bundles a single component with esbuild and asserts the result stays
 * a small fraction of the whole. The budgets are deliberately loose: they exist
 * to catch a step change, not to police a kilobyte.
 */
import { existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

/** Budgets in kilobytes, minified, before network compression. */
const BUDGET = {
  /** The compiled stylesheet, without the vendored font files. */
  styles: 90,
  /** Everything, bundled and minified — the worst case a consumer can hit. */
  everything: 420,
  /**
   * One leaf component, bundled and minified. If this ever approaches
   * `everything`, tree shaking has stopped working and every consumer is
   * paying for the whole set.
   */
  singleComponent: 30,
}

const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10

async function bundleSize(contents) {
  const result = await build({
    stdin: { contents, resolveDir: ROOT, loader: 'js' },
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    logLevel: 'silent',
  })
  return result.outputFiles[0].contents.byteLength
}

async function main() {
  if (!existsSync(join(DIST, 'index.js'))) {
    throw new Error('dist is missing — run `pnpm build:design` first')
  }

  const failures = []
  const report = []

  const stylesBytes = statSync(join(DIST, 'styles.css')).size
  report.push(['styles.css', kb(stylesBytes), BUDGET.styles])
  if (kb(stylesBytes) > BUDGET.styles) failures.push('styles.css')

  const everything = await bundleSize(`export * from './dist/index.js'`)
  report.push(['whole package', kb(everything), BUDGET.everything])
  if (kb(everything) > BUDGET.everything) failures.push('whole package')

  const single = await bundleSize(
    `import { Badge } from './dist/index.js'\nconsole.log(Badge)`,
  )
  report.push(['one component', kb(single), BUDGET.singleComponent])
  if (kb(single) > BUDGET.singleComponent) failures.push('one component')

  const share = Math.round((single / everything) * 100)
  for (const [name, size, budget] of report) {
    console.log(`  ${name.padEnd(16)} ${String(size).padStart(6)} kB   budget ${budget} kB`)
  }
  console.log(`  one component is ${share}% of the whole package`)

  // The proportion is the real test: an absolute budget can be met by a package
  // that ships everything and simply is not very big yet.
  if (share > 25) failures.push(`tree shaking (one component is ${share}% of everything)`)

  if (failures.length > 0) {
    console.error(`\ncheck-size: over budget — ${failures.join(', ')}`)
    process.exit(1)
  }
  console.log('check-size: within budget')
}

await main()
