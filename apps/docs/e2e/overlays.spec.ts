import { expect, test } from '@playwright/test'

/**
 * An open panel has to stay inside the card that shows it.
 *
 * This was reported twice. The first round raised the reserved heights, which
 * treated the symptom: a panel portalled to `document.body` is positioned
 * against the VIEWPORT, so a card sitting low on the screen made Radix flip the
 * panel upwards and out of the card no matter how tall the card was. The panel
 * now renders into the card and collides with its edges, and the reserved
 * heights in the registry are the remaining, measured part of the answer.
 */
const ANCHORED = [
  'select',
  'dropdown-menu',
  'combobox',
  'date-picker',
  'popover',
  'searchable-menu',
]

/**
 * `command` is left out: its palette renders inline, with nothing to escape.
 * So is `calendar` — its month and year picker draws IN PLACE of the day grid
 * rather than portalling a panel over it, which is the point of that redesign
 * and is covered by `interactions.spec.ts` instead.
 */

for (const slug of ANCHORED) {
  test(`${slug}: the open panel stays inside the example card`, async ({ page }) => {
    await page.goto(`/components/${slug}/`)
    await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()

    const frames = page.locator('[data-density]')
    let opened = 0

    for (let f = 0; f < (await frames.count()); f++) {
      const frame = frames.nth(f)
      // Centre the card first. The viewport still bounds the panel, and it is
      // right that a card hanging half off-screen opens its panel upwards —
      // the claim under test is about a card the reader is actually looking at.
      await frame.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      const triggers = frame.locator('[aria-haspopup], [aria-expanded]')

      for (let i = 0; i < Math.min(await triggers.count(), 2); i++) {
        const trigger = triggers.nth(i)
        if (!(await trigger.isVisible())) continue
        await trigger.click()

        // Panels are portalled into the frame, so they are found through it.
        const panel = frame.locator('[data-radix-popper-content-wrapper]').first()
        if (!(await panel.isVisible().catch(() => false))) continue
        const box = await panel.boundingBox()
        const card = await frame.boundingBox()
        if (!box || !card || box.height < 40) continue
        opened++

        // One pixel of slack for sub-pixel layout, not for a panel that escapes.
        expect(box.y, `${slug} panel escapes the top`).toBeGreaterThanOrEqual(card.y - 1)
        expect(box.y + box.height, `${slug} panel escapes the bottom`).toBeLessThanOrEqual(
          card.y + card.height + 1,
        )

        await page.keyboard.press('Escape')
        await expect(panel).toBeHidden()
      }
    }

    // A test that opened nothing proves nothing.
    expect(opened, `${slug} exposed no panel to measure`).toBeGreaterThan(0)
  })
}

test('context-menu: the open panel stays inside the example card', async ({ page }) => {
  await page.goto('/components/context-menu/')
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()

  const frame = page.locator('[data-density]').first()
  await frame.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  // A context menu has no trigger to click — it answers a right-click on its
  // target, which is why the sweep above cannot reach it.
  await frame.locator('[data-slot="context-menu-target"], :text("Right-click")').first().click({ button: 'right' })

  const panel = frame.locator('[data-radix-popper-content-wrapper]').first()
  await expect(panel).toBeVisible()
  const box = (await panel.boundingBox())!
  const card = (await frame.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(card.y - 1)
  expect(box.y + box.height).toBeLessThanOrEqual(card.y + card.height + 1)
})
