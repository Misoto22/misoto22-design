import { expect, test, type Page } from '@playwright/test'

/** The site's own chrome hydrates before its shortcuts work; wait for that. */
async function ready(page: Page) {
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()
}

test.describe('command palette', () => {
  test('opens on ⌘K from anywhere and navigates', async ({ page }) => {
    await page.goto('/components/badge/')
    await ready(page)

    await page.keyboard.press('ControlOrMeta+k')
    const palette = page.getByRole('dialog')
    await expect(palette).toBeVisible()

    await page.getByPlaceholder(/Jump to a component/).fill('pagination')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/components\/pagination\//)
  })

  test('closes on Escape without navigating', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await page.keyboard.press('ControlOrMeta+k')
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page).toHaveURL(/\/$/)
  })

  test('has a visible way in, because a secret shortcut helps nobody', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await page.getByRole('button', { name: /Search/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('carries the things that are not pages', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    const before = await page.locator('html').getAttribute('data-mode')

    await page.keyboard.press('ControlOrMeta+k')
    await page.getByPlaceholder(/Jump to a component/).fill('toggle light')
    await page.keyboard.press('Enter')

    await expect(page.locator('html')).not.toHaveAttribute('data-mode', before ?? 'light')
  })
})

test.describe('accent', () => {
  test('re-points one token and the whole system follows', async ({ page }) => {
    await page.goto('/components/button/')
    await ready(page)

    const primary = page.getByRole('button', { name: 'Primary', exact: true }).first()
    const inkFill = await primary.evaluate((element) => getComputedStyle(element).backgroundColor)

    await page.getByRole('button', { name: 'Change the accent' }).click()
    await page.getByRole('menuitem', { name: /Cobalt/ }).click()

    await expect(page.locator('html')).toHaveAttribute('data-accent', 'cobalt')
    // The button was never told about the accent; it reads --ink, which reads
    // the same pointer. That is the claim the switcher exists to demonstrate.
    await expect
      .poll(() => primary.evaluate((element) => getComputedStyle(element).backgroundColor))
      .not.toBe(inkFill)
  })

  test('survives a reload', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await page.getByRole('button', { name: 'Change the accent' }).click()
    await page.getByRole('menuitem', { name: /Forest/ }).click()
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'forest')

    await page.reload()
    // Written before first paint by the inline script, so there is no flash of
    // the wrong accent on the way in.
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'forest')
  })
})

test.describe('templates', () => {
  test('the dashboard renders from the package, not from its own CSS', async ({ page }) => {
    await page.goto('/templates/dashboard/')
    await ready(page)

    // Scoped to the preview: the page also prints the template's source below,
    // so an unscoped text match finds the same words twice.
    const preview = page.getByRole('region', { name: 'Dashboard preview' })
    await expect(preview.getByRole('table', { name: /Recent deploys/ })).toBeVisible()
    await expect(preview.getByRole('tablist')).toBeVisible()
    await expect(preview.getByText('99.98%')).toBeVisible()
  })

  test('the width switcher narrows the frame', async ({ page }) => {
    await page.goto('/templates/landing/')
    await ready(page)

    const frame = page.getByRole('region', { name: 'Landing page preview' })
    const wide = (await frame.boundingBox())?.width ?? 0

    await page.getByRole('radio', { name: 'Mobile' }).click()
    await expect.poll(async () => (await frame.boundingBox())?.width ?? 0).toBeLessThan(wide)
  })

  test('the template page prints its own source', async ({ page }) => {
    await page.goto('/templates/dashboard/')
    await ready(page)
    // The page renders the module and the block is read from the same file, so
    // the two cannot drift.
    await expect(page.getByRole('region', { name: /Dashboard source/ })).toContainText(
      'export function Dashboard',
    )
  })
})
