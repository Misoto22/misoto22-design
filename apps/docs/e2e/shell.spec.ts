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

  test('ranks an exact name above a loose one', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await page.getByRole('button', { name: /Search/ }).first().click()

    // With a group per section, cmdk ranked only WITHIN a group and rendered
    // groups in registry order, so typing "table" listed Tag, FigureBand and
    // Alert above Table. One group, and the section moved onto the row.
    await page.getByRole('combobox').fill('table')
    await expect(page.getByRole('option').first()).toContainText('Table')

    await page.getByRole('combobox').fill('')
    await page.getByRole('combobox').fill('dark')
    await expect(page.getByRole('option').first()).toContainText(/dark/i)
  })

  test('says which keys do what', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await page.getByRole('button', { name: /Search/ }).first().click()

    // A palette is a keyboard surface whose keys are otherwise invisible.
    const palette = page.getByRole('dialog')
    await expect(palette).toContainText('navigate')
    await expect(palette).toContainText('open')
    await expect(palette).toContainText('close')
  })

  test('draws each accent in its own colour, in either theme', async ({ page }) => {
    await page.goto('/')
    await ready(page)
    await page.getByRole('button', { name: /Search/ }).first().click()

    const swatch = page.getByRole('option', { name: /Accent: Clay/ }).locator('svg')
    const colour = () => swatch.evaluate((el) => getComputedStyle(el).color)

    // The swatch used to be a hex in TypeScript, which meant Ink was drawn at
    // #101010 against a #0d0d0d ground — invisible.
    const light = await colour()
    await page.evaluate(() => {
      document.documentElement.dataset.mode = 'dark'
    })
    await expect.poll(colour).not.toBe(light)
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

  test('the width switcher reflows the template, not just the frame', async ({ page }) => {
    await page.goto('/templates/dashboard/')
    await ready(page)

    const frame = page.getByRole('region', { name: 'Dashboard preview' })
    const sidebar = frame.locator('aside')
    const heading = page.locator('[data-fluid-frame] h1, [data-fluid-frame] .font-heading').first()

    await expect(sidebar).toBeVisible()

    await page.getByRole('radio', { name: 'Mobile' }).click()
    // The templates and the fluid ramp read the FRAME's width, not the window's.
    // With viewport breakpoints this sidebar stayed open and the type stayed at
    // its desktop size while the frame shrank to 390px around them.
    await expect(sidebar).toBeHidden()
    await expect.poll(async () => (await frame.boundingBox())?.width ?? 0).toBeLessThan(400)

    const band = frame.locator('dl').first()
    await expect
      .poll(async () => (await band.evaluate((el) => getComputedStyle(el).gridTemplateColumns)).split(' ').length)
      .toBe(2)

    // Nothing may hang outside the frame at phone width.
    const escaped = await frame.evaluate((el) => {
      const box = el.getBoundingClientRect()
      return [...el.querySelectorAll('*')].filter((child) => {
        const b = child.getBoundingClientRect()
        return b.width > 0 && (b.right > box.right + 1 || b.left < box.left - 1)
      }).length
    })
    expect(escaped).toBe(0)
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
