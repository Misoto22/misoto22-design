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
    await expect(page.getByText('这套系统的动作')).toBeVisible()
    await expect(page.getByRole('heading', { name: '示例' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '键盘操作' })).toBeVisible()
  })

  test('the API reference is translated too, and the code is not', async ({ page }) => {
    await page.goto('/zh/components/button/')
    await ready(page)
    // Prop descriptions are parsed from the package source, so translating
    // them risks drift — `api.ts` records a fingerprint of the English beside
    // each one, and the build fails when a doc comment moves out from under it.
    const table = page.getByRole('table', { name: /Button props/ })
    await expect(table).toContainText('这个屏幕最希望你做的那一件事')
    // Identifiers and type signatures stay as they are; they are code.
    await expect(table).toContainText('ButtonVariant')
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

test('the Chinese pages translate the API reference too', async ({ page }) => {
  await page.goto('/zh/components/badge/')

  // The Notes section and the prop table used to stay English by design. They
  // are translated now, with a fingerprint of the English beside each one so a
  // changed doc comment fails the build rather than going stale in silence.
  const notes = page.locator('#notes').locator('..')
  await expect(notes).toContainText('徽章不可交互')

  const table = page.getByRole('table', { name: /Badge/ })
  await expect(table).toContainText('是这套系统里唯一的彩色')

  // Identifiers and type signatures are code and stay as they are.
  await expect(table).toContainText('BadgeTone')
})

test('the keyboard table is translated, key by key', async ({ page }) => {
  await page.goto('/zh/components/select/')
  const table = page.getByRole('table', { name: /keyboard/i })
  await expect(table).toContainText('展开列表')
  await expect(table).toContainText('首字母跳转')
  // Keys themselves are keys.
  await expect(table).toContainText('Enter')
})

test('no page promises the reference is in English any more', async ({ page }) => {
  await page.goto('/zh/components/button/')
  await expect(page.getByText('保持英文')).toHaveCount(0)
})
