import { expect, test, type Page } from '@playwright/test'

async function ready(page: Page) {
  await expect(page.getByRole('button', { name: /切换到|Switch to the/ })).toBeVisible()
}

/**
 * English has no prefix and Chinese sits under `/zh`, matching misoto22.com.
 *
 * That shape is not only for consistency: the English pages were linked before
 * Chinese existed, and a scheme that moves every URL to `/en/…` breaks them for
 * nothing.
 */
test.describe('locales', () => {
  test('English keeps its original URLs', async ({ page }) => {
    await page.goto('/components/button/')
    await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('Chinese renders the editorial layer in Chinese', async ({ page }) => {
    await page.goto('/zh/components/button/')
    await ready(page)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
    // The summary, the "when to reach for it" note and the section headings.
    await expect(page.getByText('系统的动作')).toBeVisible()
    await expect(page.getByRole('heading', { name: '示例' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '键盘操作' })).toBeVisible()
  })

  test('the API reference stays in English, and says so', async ({ page }) => {
    await page.goto('/zh/components/button/')
    await ready(page)
    // Prop descriptions are parsed from the package source; translating them
    // would be a second copy that drifts on the first doc-comment edit.
    await expect(page.getByText(/直接来自包的源码，保持英文/)).toBeVisible()
    await expect(page.getByRole('table', { name: /Button props/ })).toBeVisible()
  })

  test('the switcher goes to the same page, not the home page', async ({ page }) => {
    await page.goto('/components/pagination/')
    await ready(page)
    await page.getByRole('button', { name: /Language|语言/ }).click()
    await page.getByRole('menuitem', { name: '中文' }).click()
    // Being thrown back to the top of a site is the moment a reader is least
    // equipped to navigate back.
    await expect(page).toHaveURL(/\/zh\/components\/pagination\//)

    await page.getByRole('button', { name: /Language|语言/ }).click()
    await page.getByRole('menuitem', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/components\/pagination\/$/)
  })

  test('navigation inside Chinese stays inside Chinese', async ({ page }) => {
    await page.goto('/zh/')
    await ready(page)
    await page.getByRole('navigation', { name: '文档导航' }).getByRole('link', { name: '设计原则' }).click()
    await expect(page).toHaveURL(/\/zh\/principles\//)
    await expect(page.getByRole('heading', { name: '设计原则', level: 1 })).toBeVisible()
  })

  test('the palette navigates within the current language', async ({ page }) => {
    await page.goto('/zh/')
    await ready(page)
    await page.keyboard.press('ControlOrMeta+k')
    await page.getByPlaceholder(/跳到某个组件/).fill('Pagination')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/zh\/components\/pagination\//)
  })
})
