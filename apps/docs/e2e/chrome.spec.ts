import { expect, test } from '@playwright/test'

/**
 * The page's two ends.
 *
 * Both used to fail the same way and for the same reason: the site's own name
 * was carried by whatever happened to be on screen. The masthead had no mark
 * and lost the wordmark entirely once the sidebar was collapsed or the viewport
 * went narrow, and the page had no footer at all — it ran out of content and
 * stopped. These are the assertions that would have caught either.
 */

test('the brand is on screen in every state of the sidebar', async ({ page }) => {
  await page.goto('/components/button/')
  const brand = page.getByRole('link', { name: 'misoto22 design' })

  // Docked: the rail's own head carries it.
  await expect(brand.first()).toBeVisible()
  expect(await brand.count()).toBeGreaterThan(0)

  // Collapsed: the aside goes `lg:hidden`, and the wordmark used to go with it.
  await page.getByRole('button', { name: 'Collapse the sidebar' }).click()
  await expect(page.getByRole('button', { name: 'Show the sidebar' })).toBeVisible()
  const inHeader = page.locator('header').getByRole('link', { name: 'misoto22 design' })
  await expect(inHeader).toBeVisible()

  // And it is a mark, not only type — an <svg> inside the link.
  await expect(inHeader.locator('svg')).toHaveCount(1)
})

test('the current section is marked by more than a step of grey', async ({ page }) => {
  await page.goto('/components/button/')
  const current = page.getByRole('navigation', { name: 'Sections' }).getByRole('link', {
    name: 'Components',
  })

  await expect(current).toHaveAttribute('aria-current', 'page')
  // The underline sits on the masthead's own bottom rule. Colour alone was
  // carrying this, and one step of grey is not a state anyone can see.
  const width = await current.evaluate((el) => getComputedStyle(el).borderBottomWidth)
  expect(parseFloat(width)).toBeGreaterThan(0)
})

test('every page ends in a footer rather than in whitespace', async ({ page }) => {
  await page.goto('/components/button/')
  const footer = page.getByRole('contentinfo')

  await expect(footer).toBeVisible()
  await expect(footer.getByRole('link', { name: 'Principles' })).toBeVisible()
  await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible()

  // The version is read off the changelog the site already generates, so it
  // cannot disagree with the release it names.
  await expect(footer.getByText(/@misoto22\/design v\d+\.\d+\.\d+/)).toBeVisible()

  // A short page must not leave the footer stranded halfway up the viewport.
  await page.goto('/themes/')
  const box = (await page.getByRole('contentinfo').boundingBox())!
  const viewport = page.viewportSize()!
  expect(box.y + box.height).toBeGreaterThanOrEqual(viewport.height - 1)
})
