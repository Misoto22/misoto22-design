import { expect, test } from '@playwright/test'

test('compact records use the reading column when their optional index is absent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/components/collection/')
  const example = page.locator('[data-example="Collection/01-searchable-records"]')
  const row = example.locator('.m22-record-link').first()
  const copy = row.locator('.m22-record-copy')
  await expect(copy.getByRole('heading', { name: 'A practice of attention' })).toBeVisible()
  const rowBounds = await row.boundingBox()
  const copyBounds = await copy.boundingBox()
  expect(rowBounds).not.toBeNull()
  expect(copyBounds).not.toBeNull()
  expect(copyBounds!.width).toBeGreaterThan(rowBounds!.width / 2)
})
