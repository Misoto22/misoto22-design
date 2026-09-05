import { expect, test } from '@playwright/test'

/**
 * The interaction chains jsdom cannot complete.
 *
 * Radix drives several patterns through real focus events — the roving
 * tabindex checking an option as focus lands on it, a focus trap that has to
 * see a real Tab. Under jsdom those chains stall, and a bare Radix component
 * with none of our code fails the same assertions. Rather than assert a weaker
 * thing in the unit suite and call the pattern covered, they are checked here,
 * against the live examples on the documentation site.
 */

test('radiogroup: selection follows focus', async ({ page }) => {
  await page.goto('/components/radio-group/')
  const group = page.getByRole('radiogroup', { name: 'Appearance' })
  await expect(group).toBeVisible()

  const light = group.getByRole('radio', { name: 'Light' })
  const dark = group.getByRole('radio', { name: 'Dark' })

  await light.focus()
  await page.keyboard.press('ArrowDown')
  // The other half of the ARIA radiogroup pattern: moving focus moves the
  // selection, so a keyboard user never has to press an extra key to commit.
  await expect(dark).toBeChecked()
  await expect(light).not.toBeChecked()
})

test('radiogroup: the whole group is one tab stop', async ({ page }) => {
  await page.goto('/components/radio-group/')
  const group = page.getByRole('radiogroup', { name: 'Appearance' })
  await group.getByRole('radio', { name: 'Light' }).focus()
  await page.keyboard.press('Tab')
  await expect(group.getByRole('radio', { name: 'Dark' })).not.toBeFocused()
})

test('dialog: traps focus and restores it to the trigger', async ({ page }) => {
  await page.goto('/components/dialog/')
  const trigger = page.getByRole('button', { name: 'Delete frame' })
  await trigger.click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // Tab several times; focus must not leave the dialog.
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab')
    const inside = await dialog.evaluate((element) => element.contains(document.activeElement))
    expect(inside, 'focus escaped the dialog').toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('tabs: arrow keys move between tabs and switch the panel', async ({ page }) => {
  await page.goto('/components/tabs/')
  const list = page.getByRole('tablist').first()
  await list.getByRole('tab', { name: 'Preview' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(list.getByRole('tab', { name: 'Code' })).toBeFocused()
  await expect(page.getByRole('tabpanel')).toContainText('The source that produced it.')
})

test('the skip link is the first thing a keyboard reaches', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  // And it must be visible once focused, or it is a link nobody can see to use.
  await expect(skip).toBeVisible()
})

test('the theme toggle is reachable and flips the document', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: /Switch to the (light|dark) theme/ })
  const before = await page.locator('html').getAttribute('data-mode')
  await toggle.click()
  await expect(page.locator('html')).not.toHaveAttribute('data-mode', before ?? 'light')
})

test('search narrows the sidebar and "/" focuses it', async ({ page }) => {
  await page.goto('/')
  // The "/" shortcut is registered by an effect, so the key press has to wait
  // for hydration. The theme toggle only gets its accessible name after mount,
  // which makes it a reliable signal that effects have run — a fixed timeout
  // would be a flake waiting for a slower runner.
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()
  await page.keyboard.press('/')
  const search = page.getByRole('searchbox', { name: 'Search the documentation' })
  await expect(search).toBeFocused()

  await search.fill('pagination')
  const nav = page.getByRole('navigation', { name: 'Documentation' })
  await expect(nav.getByRole('link', { name: 'Pagination' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Button', exact: true })).toBeHidden()
})
