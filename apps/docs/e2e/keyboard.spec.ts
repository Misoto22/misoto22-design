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

test('the sidebar groups collapse, so the index is not one long column', async ({ page }) => {
  // The component groups live under the Components section: the masthead names
  // the four sections, and the sidebar indexes whichever one is open.
  await page.goto('/components/')
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()

  const nav = page.getByRole('navigation', { name: 'Documentation' })
  const surfaces = nav.getByRole('button', { name: /Surfaces/ })

  // Forty-nine rows under seven headings is taller than most screens, and a
  // reader looking at one component has no use for the other forty-eight.
  await expect(surfaces).toHaveAttribute('aria-expanded', 'false')
  await expect(nav.getByRole('link', { name: 'Table', exact: true })).toBeHidden()

  await surfaces.click()
  await expect(surfaces).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('link', { name: 'Table', exact: true })).toBeVisible()
})

test('the group holding the current page opens itself', async ({ page }) => {
  await page.goto('/components/table/')
  const nav = page.getByRole('navigation', { name: 'Documentation' })
  await expect(nav.getByRole('button', { name: /Surfaces/ })).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('link', { name: 'Table', exact: true })).toBeVisible()
})

test('the sidebar can be put away, and stays away', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()

  const nav = page.getByRole('navigation', { name: 'Documentation' })
  await expect(nav).toBeVisible()

  await page.getByRole('button', { name: 'Collapse the sidebar' }).click()
  await expect(nav).toBeHidden()

  // A reader who put it away did not mean "until the next page".
  await page.goto('/components/button/')
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeHidden()

  await page.getByRole('button', { name: 'Show the sidebar' }).click()
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible()
})

test('the playground renders what you type', async ({ page }) => {
  await page.goto('/components/badge/')
  await page.getByRole('button', { name: 'Edit' }).first().click()

  const editor = page.getByRole('textbox', { name: 'Editable example source' })
  await expect(editor).toBeVisible()

  // Replace the whole snippet and check the preview followed. This is the
  // claim the feature makes — that the code beside the component IS the
  // component — and it is only true if editing it changes what renders.
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('<Badge tone="danger">Typed live</Badge>')

  // The preview, not the editor: both show the same words, and the claim under
  // test is that the rendered half followed.
  await expect(page.locator('[data-playground-preview]').getByText('Typed live')).toBeVisible()
})

test('the playground reports a mistake instead of blanking', async ({ page }) => {
  await page.goto('/components/badge/')
  await page.getByRole('button', { name: 'Edit' }).first().click()

  const editor = page.getByRole('textbox', { name: 'Editable example source' })
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('<NotAComponent')

  // A live editor that renders nothing on a typo teaches nothing. What matters
  // is that a message appears and names the problem — not which message, since
  // that depends on whether the fragment failed to parse or failed to resolve.
  const errors = page.getByRole('status', { name: 'Example errors' })
  await expect(errors).toContainText(/Error/)
})

test('the palette reaches beyond titles, into props and keyboard keys', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()
  await page.getByRole('button', { name: /Search/ }).first().click()
  const filter = page.getByRole('combobox').first()

  // This reach used to belong to the sidebar's own search field. That was a
  // second search box beside ⌘K answering the same question with less of the
  // page behind it, so the field went and the reach moved here.
  await filter.fill('sortDirection')
  await expect(page.getByRole('option').first()).toContainText('Table')

  // And a key.
  await filter.fill('')
  await filter.fill('PageUp')
  await expect(page.getByRole('option').first()).toContainText('Slider')
})

test('the changelog page reads the repository CHANGELOG', async ({ page }) => {
  await page.goto('/changelog/')
  await expect(page.getByRole('heading', { name: 'Changelog', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: '0.1.0', level: 2 })).toBeVisible()
})

test('the playground resolves a name to the component, not to the icon', async ({ page }) => {
  await page.goto('/components/table/')
  await page.getByRole('button', { name: 'Edit' }).first().click()

  const editor = page.getByRole('textbox', { name: 'Editable example source' })
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('<Badge tone="success">shipped</Badge>')

  // lucide ships icons called Badge, Table, Command and Dialog. With icons last
  // in the scope, typing one of those names drew a small grey outline and no
  // error — the package spreads last so it wins every collision.
  const preview = page.locator('[data-playground-preview]')
  await expect(preview.getByText('shipped')).toBeVisible()
  await expect(preview.locator('svg.lucide-badge')).toHaveCount(0)
})
