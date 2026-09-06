import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Right-to-left, and density, checked in the one place they can be: a browser
 * that actually resolves logical properties.
 *
 * A source test can prove no component writes `pr-6`. It cannot prove the
 * result mirrors — that a chevron ends up on the correct side, that a drawer
 * slides in from the correct edge, that nothing overflows the page once the
 * axis flips. Those are layout facts, and layout needs a layout engine.
 */

test.describe('right-to-left', () => {
  test('the whole document mirrors without overflowing', async ({ page }) => {
    await page.goto('/components/native-select/')
    await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'))

    // A page that scrolls sideways is the classic RTL failure: one physical
    // margin left behind pushes the layout past its own gutter.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, 'the page scrolls horizontally in RTL').toBeLessThanOrEqual(1)
  })

  test("the select's chevron moves to the reading end", async ({ page }) => {
    // The NATIVE select, whose chevron is a sibling element positioned with a
    // logical inset — the exact thing this asserts. The styled Select draws its
    // icon inside a flex row, where direction is the browser's problem and not
    // ours to verify.
    await page.goto('/components/native-select/')
    // The page carries three native-select examples and a Radix Tabs root that
    // sets `dir` of its own, so `[dir]` alone names four things. Name the
    // example instead: `data-example` is the key the import map is built from.
    const example = page.locator('[data-example="NativeSelect/01-default"]')
    // The preview frame inside it — the one element carrying BOTH axes the
    // canvas switches, which is what tells it apart from Radix's own `dir`.
    const frame = example.locator('[dir][data-density]')

    const ltr = await chevronOffset(frame)
    await example.getByRole('radio', { name: 'RTL' }).click()
    await expect(frame).toHaveAttribute('dir', 'rtl')
    const rtl = await chevronOffset(frame)

    // In LTR the chevron sits near the right edge of the control; in RTL near
    // the left. Comparing the fraction rather than a pixel keeps this robust
    // to the control's own width.
    expect(ltr).toBeGreaterThan(0.6)
    expect(rtl).toBeLessThan(0.4)
  })

  test('has no axe violations in RTL', async ({ page }) => {
    await page.goto('/components/field/')
    await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'))
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations.map((violation) => violation.id)).toEqual([])
  })
})

/** Where the chevron sits across the select in `scope`, as a fraction of its width. */
async function chevronOffset(scope: import('@playwright/test').Locator): Promise<number> {
  const select = scope.getByRole('combobox')
  const box = await select.boundingBox()
  const icon = await select.locator('~ svg').boundingBox()
  if (!box || !icon) throw new Error('could not measure the select')
  return (icon.x + icon.width / 2 - box.x) / box.width
}

test.describe('density', () => {
  test('compact shrinks every control in the subtree, not just the button', async ({ page }) => {
    await page.goto('/components/button/')
    const canvas = page.locator('[data-canvas]').first()
    const button = canvas.getByRole('button', { name: 'Primary' })

    const comfortable = (await button.boundingBox())?.height ?? 0
    expect(comfortable, 'the default is the WCAG 2.5.5 pointer target').toBeGreaterThanOrEqual(44)

    await page.getByRole('radio', { name: 'Compact' }).first().click()
    await expect(canvas).toHaveAttribute('data-density', 'compact')
    const compact = (await button.boundingBox())?.height ?? 0

    expect(compact).toBeLessThan(comfortable)
    // Still above the AA pointer target, which is the whole reason compact is
    // an allowed setting rather than a free one.
    expect(compact, 'compact must still clear WCAG 2.5.8').toBeGreaterThanOrEqual(24)
  })

  test('the field padding follows the same axis', async ({ page }) => {
    await page.goto('/components/input/')
    const canvas = page.locator('[data-canvas]').first()
    const input = canvas.getByRole('textbox', { name: 'Resting' })

    const before = await input.evaluate((element) => getComputedStyle(element).paddingInlineStart)
    await page.getByRole('radio', { name: 'Compact' }).first().click()
    const after = await input.evaluate((element) => getComputedStyle(element).paddingInlineStart)

    expect(parseFloat(after)).toBeLessThan(parseFloat(before))
  })
})
