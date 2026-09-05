import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

/**
 * Open to everything, and pointing at both indexes.
 *
 * The site is documentation for a public package: there is nothing here to
 * withhold from a crawler, and an agent that reads `llms.txt` first gets a
 * better answer than one that scrapes the rendered pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://ui.misoto22.com/sitemap.xml',
    host: 'https://ui.misoto22.com',
  }
}
