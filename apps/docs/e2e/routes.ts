import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Every page the built site actually published, read off the export.
 *
 * This used to re-export the app's own route list, which is derived from the
 * content registries. That was the same idea — check what is published — but it
 * reached it through the source, and the source now reads generated data that
 * this job does not produce: the browser workflow downloads `out/` and runs the
 * suite against it, without ever running the generator.
 *
 * Walking the export is also the stronger version of the check. A route list
 * built from the registries proves the sweep agrees with the thing the pages
 * were rendered from; walking `out/` proves it agrees with the pages that
 * shipped. A page that failed to render is missing from the second and present
 * in the first.
 */
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'out')

function walk(dir: string, routes: string[]): void {
  for (const entry of readdirSync(dir).sort()) {
    // Next's own build output, not a page anyone visits. `404` is a real page
    // and deliberately excluded: it is not in the sitemap either, and sweeping
    // it would widen what this suite covers rather than keep it in step.
    if (entry.startsWith('_') || entry.startsWith('.') || entry === '404') continue
    const path = join(dir, entry)
    if (!statSync(path).isDirectory()) continue
    if (existsSync(join(path, 'index.html'))) {
      routes.push(`/${relative(OUT, path).split(sep).join('/')}/`)
    }
    walk(path, routes)
  }
}

function published(): string[] {
  if (!existsSync(join(OUT, 'index.html'))) {
    throw new Error(`No static export at ${OUT}. Run \`pnpm build\` before the e2e suite.`)
  }
  const routes = ['/']
  walk(OUT, routes)
  return routes
}

export const ROUTES: string[] = published()
