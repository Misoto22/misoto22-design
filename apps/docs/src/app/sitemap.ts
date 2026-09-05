import type { MetadataRoute } from 'next'
import { ROUTES } from '@/content/routes'

/** A route handler under `output: 'export'` has to say it is static. */
export const dynamic = 'force-static'

/**
 * Every page, from the same list the accessibility sweep walks.
 *
 * A hand-kept sitemap is a second list of what the site publishes, and the two
 * fall out of step in the direction that hides a page rather than the one that
 * breaks a build.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return ROUTES.map((route) => ({
    url: `https://ui.misoto22.com${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '/' ? 1 : 0.7,
  }))
}
