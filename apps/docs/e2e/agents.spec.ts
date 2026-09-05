import { expect, test } from '@playwright/test'
import { COMPONENTS } from '../src/content/registry'

/**
 * The site has two audiences, and only one of them renders CSS.
 *
 * These check the second one is actually served: that the text exists, that it
 * is derived from the same registry the pages are, and that it carries the
 * parts an agent needs most and a rendered page spreads thinnest — every prop
 * with its type, the keyboard contract, the whole example source.
 */
test('llms.txt lists every component the site publishes', async ({ request }) => {
  const response = await request.get('/llms.txt')
  expect(response.status()).toBe(200)
  const body = await response.text()

  expect(body).toContain('# misoto22 design')
  // The laws, the theme axes and the install line: the three things an agent
  // has to know before it writes a single line against this package.
  expect(body).toContain('The accent is ink')
  expect(body).toContain('data-surface')
  expect(body).toContain("npm install @misoto22/design")

  for (const entry of COMPONENTS) {
    expect(body, `${entry.name} missing from llms.txt`).toContain(
      `/components/${entry.slug}/llms.txt`,
    )
  }
})

test('each component has its own file, with its props and its keyboard', async ({ request }) => {
  const response = await request.get('/components/button/llms.txt')
  expect(response.status()).toBe(200)
  const body = await response.text()

  expect(body).toContain('# Button')
  expect(body).toContain("import { Button } from '@misoto22/design'")
  // A prop table is the part a rendered page spreads over the most pixels.
  expect(body).toContain('`iconOnly`')
  expect(body).toContain('## Keyboard')
  expect(body).toContain('## Example')
})

test('a component with no page of its own is not published as text either', async ({ request }) => {
  const response = await request.get('/components/not-a-component/llms.txt')
  expect(response.status()).toBe(404)
})

test('llms-full.txt carries every component inline', async ({ request }) => {
  const response = await request.get('/llms-full.txt')
  expect(response.status()).toBe(200)
  const body = await response.text()

  for (const entry of COMPONENTS) {
    expect(body, `${entry.name} missing from llms-full.txt`).toContain(`# ${entry.name}\n`)
  }
})

test('a crawler is pointed at both the sitemap and the text', async ({ request, page }) => {
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain('Sitemap: https://ui.misoto22.com/sitemap.xml')

  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('https://ui.misoto22.com/components/button/')
  expect(sitemap).toContain('https://ui.misoto22.com/zh/components/button/')

  // Declared in the document too, so an agent that landed on a page rather
  // than on the root still finds it.
  await page.goto('/')
  await expect(page.locator('link[rel="alternate"][href="/llms.txt"]')).toHaveCount(1)
})
