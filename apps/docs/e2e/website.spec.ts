import { expect, test } from '@playwright/test'

test('compact records use the reading column when their optional index is absent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/patterns/collection/')
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

test('media detail return control retains its touch target after browser rounding', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 1000 })
  await page.goto('/patterns/media/')
  const example = page.locator('[data-example="Media/02-photograph-detail"]')
  const backLink = example.getByRole('link', { name: 'Back to field observations' })
  await expect(backLink).toBeVisible()
  const bounds = await backLink.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.width).toBeGreaterThanOrEqual(44)
  expect(bounds!.height).toBeGreaterThanOrEqual(44)
})
