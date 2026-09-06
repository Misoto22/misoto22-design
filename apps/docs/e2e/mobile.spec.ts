import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ROUTES } from './routes'

/**
 * The site at phone width.
 *
 * Everything else in this suite runs at a desktop viewport, which is how a page
 * that scrolls sideways on a phone shipped: nothing was looking. These are the
 * two failures that are invisible on a laptop and total on a phone — a page
 * wider than the screen, and a control too small to hit.
 */
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

test('no page is wider than the phone it is read on', async ({ page }) => {
  // One test rather than one per route, because the check is a loop of
  // navigations and paying browser startup a hundred and seventy times to
  // parallelise it costs more than it saves. The consequence is that the time
  // budget has to SCALE with the site: a fixed 30 s passed until the charts
  // entry added forty pages, and then failed on CI while still passing on a
  // warm laptop — the least useful way for a suite to break.
  test.setTimeout(Math.max(60_000, ROUTES.length * 1_500))

  const wide: { route: string; over: number; culprit: string }[] = []

  for (const route of ROUTES) {
    await page.goto(route)
    const result = await page.evaluate(() => {
      const width = document.documentElement.clientWidth
      const over = Math.round(document.documentElement.scrollWidth - width)
      if (over <= 1) return null
      // A table or a code block scrolling INSIDE its own box is the design;
      // only something dragging the document sideways counts.
      const scrolls = (element: Element) => {
        for (let node = element.parentElement; node; node = node.parentElement) {
          if (/auto|scroll/.test(getComputedStyle(node).overflowX)) return true
        }
        return false
      }
      const culprit = [...document.querySelectorAll('body *')].find((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 0 && box.right > width + 1 && !scrolls(element)
      })
      return { over, culprit: (culprit?.className ?? '').toString().slice(0, 70) }
    })
    if (result) wide.push({ route, ...result })
  }

  expect(wide).toEqual([])
})

test('every control in the top bar can be hit with a thumb', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()

  // `size="sm"` is 36px, which the Button docs are explicit about being under
  // the pointer-target floor. The bar overrides it on a coarse pointer.
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('header a, header button')]
      // Zero-sized means `hidden` at this width, not an unhittable control.
      .filter((element) => {
        const box = element.getBoundingClientRect()
        return box.height > 0 && box.height < 44
      })
      .map((element) => element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '?'),
  )
  expect(small).toEqual([])
})

test('the copy control is reachable without a hover', async ({ page }) => {
  await page.goto('/')
  const copy = page.getByRole('button', { name: /Copy the snippet/ }).first()

  // It is revealed by `group-hover` on a mouse. A touch screen has no hover, so
  // the control simply did not exist there.
  await expect(copy).toBeVisible()
  const box = (await copy.boundingBox())!
  expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44)
})

test('the drawer opens, closes, and carries the whole index', async ({ page }) => {
  await page.goto('/components/button/')
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()

  const aside = page.locator('aside')
  const nav = page.getByRole('navigation', { name: 'Documentation' })

  // Closed means unreachable, not merely off-screen: `inert` is what takes its
  // sixty links out of the tab order and out of the accessibility tree. A
  // translate alone left them all in front of the page the reader was on.
  await expect(aside).toHaveAttribute('inert', '')
  expect((await aside.boundingBox())!.x).toBeLessThan(0)

  await page.getByRole('button', { name: 'Open the navigation' }).click()
  await expect(aside).not.toHaveAttribute('inert', '')
  // Both halves of the index, because the drawer carries both: the four
  // sections, which live in the masthead on a desktop and have nowhere to go on
  // a phone, and the open section's own tree underneath them.
  await expect(aside.getByRole('link', { name: 'Templates' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'All components' })).toBeVisible()

  // Polled: the drawer slides in on --duration-slow, and reading the box once
  // catches it mid-travel.
  await expect.poll(async () => Math.round((await aside.boundingBox())!.x)).toBe(0)
  const drawer = (await aside.boundingBox())!
  expect(drawer.x + drawer.width).toBeLessThanOrEqual(391)

  // The scrim carries the same name, so this names the control inside the drawer.
  await aside.getByRole('button', { name: 'Close the navigation' }).click()
  await expect(aside).toHaveAttribute('inert', '')
})

test('the overlays fit the screen they open on', async ({ page }) => {
  await page.goto('/components/button/')
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()

  const fits = async (name: string) => {
    const box = (await page.getByRole('dialog').first().boundingBox())!
    expect(box.x, `${name} escapes the left edge`).toBeGreaterThanOrEqual(-1)
    expect(box.x + box.width, `${name} escapes the right edge`).toBeLessThanOrEqual(391)
  }

  await page.getByRole('button', { name: /Search/ }).first().click()
  await fits('the palette')
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Theme', exact: true }).click()
  await fits('the theme panel')
})

/**
 * axe at phone width.
 *
 * The full sweep runs at a desktop viewport, and the DOM is the same at both —
 * so this is not a second copy of it. It is a handful of routes where the
 * RESPONSIVE layout changes what is rendered: the shell swaps a column for a
 * drawer, the example canvas reflows, the templates change their grid.
 */
const RESPONSIVE = ['/', '/components/app-shell/', '/components/table/', '/templates/dashboard/']

for (const theme of ['light', 'dark'] as const) {
  for (const route of RESPONSIVE) {
    test(`${theme}: ${route} has no axe violations on a phone`, async ({ page }) => {
      await page.addInitScript((value) => {
        try {
          window.localStorage.setItem('m22-mode', value)
        } catch {
          // A storage-blocked context still gets the attribute below.
        }
      }, theme)
      await page.goto(route)
      await expect(page.locator('html')).toHaveAttribute('data-mode', theme)

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze()

      const summary = results.violations
        .map((v) => `${v.id} (${v.impact}) — ${v.help}\n    ${v.nodes[0]?.target.join(' ')}`)
        .join('\n')
      expect(results.violations, summary).toEqual([])
    })
  }
}
