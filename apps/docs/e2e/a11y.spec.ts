import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { ROUTES } from './routes'

/**
 * axe, in a real browser, on every page — in both themes.
 *
 * This is where the half a jsdom suite cannot reach gets checked:
 *
 *   colour-contrast   needs layout and computed colour; jsdom has neither, so
 *                     a unit axe pass silently skips the single rule a
 *                     monochrome system is most likely to break.
 *   region            needs a whole document to ask whether content sits
 *                     inside a landmark.
 *   page-has-heading-one, landmark-one-main
 *                     are properties of a page, not of a component.
 *
 * Both themes, because the dark side is a value swap on the same token names.
 * A contrast ratio that clears AA on paper can fail on ink, and nothing in the
 * light-mode pass would notice.
 */
const THEMES = ['light', 'dark'] as const

async function setTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('m22-mode', value)
    } catch {
      // A storage-blocked context still gets the attribute below.
    }
  }, theme)
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    for (const route of ROUTES) {
      test(`${route} has no axe violations`, async ({ page }) => {
        await setTheme(page, theme)
        await page.goto(route)
        await expect(page.locator('main')).toBeVisible()
        // The inline theme script runs before paint; assert it actually did,
        // so a failure here is "the theme did not apply" rather than a
        // confusing pile of contrast violations.
        await expect(page.locator('html')).toHaveAttribute('data-mode', theme)

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()

        const summary = results.violations
          .map(
            (violation) =>
              `${violation.id} (${violation.impact}) — ${violation.help}\n` +
              violation.nodes.map((node) => `    ${node.target.join(' ')}`).join('\n'),
          )
          .join('\n')

        expect(results.violations, summary).toEqual([])
      })
    }
  })
}
