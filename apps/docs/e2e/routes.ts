import { COMPONENTS } from '../src/content/registry'
import { FOUNDATIONS } from '../src/content/foundations'

/**
 * Every page the site publishes, derived from the same registries the pages
 * are generated from.
 *
 * Not a hand-written list: a new component would then get a page nobody ever
 * checked, which is the failure mode a documentation site's own tests exist to
 * prevent.
 */
export const ROUTES: string[] = [
  '/',
  '/principles/',
  '/components/',
  '/changelog/',
  ...FOUNDATIONS.map((page) => `/foundations/${page.slug}/`),
  ...COMPONENTS.map((entry) => `/components/${entry.slug}/`),
]
