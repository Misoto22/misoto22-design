import { expect, test, type Page } from '@playwright/test'

/**
 * The behaviours a screenshot cannot confirm.
 *
 * Every test here was a bug someone found by using the site, and each one was
 * invisible to the suites that already existed: axe reads a static tree and had
 * nothing to say about a value that never updates, a pill that never moves, or
 * a checkbox frozen by its own props.
 */

/** The examples hydrate before their controls do anything; wait for that. */
async function ready(page: Page) {
  await expect(page.getByRole('button', { name: /Switch to the (light|dark) theme/ })).toBeVisible()
}

test('checkbox: the select-all row is operable, and reports "some"', async ({ page }) => {
  await page.goto('/components/checkbox/')
  await ready(page)

  const all = page.getByRole('checkbox', { name: 'Select all' })
  // It starts indeterminate because exactly one of three below it is ticked —
  // and it was previously frozen there, because the example passed `checked`
  // with no handler.
  await expect(all).toHaveAttribute('aria-checked', 'mixed')

  await all.click()
  await expect(all).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Notify the channel' })).toBeChecked()

  await all.click()
  await expect(all).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Ship on merge' })).not.toBeChecked()
})

test('slider: the printed value tracks the thumb', async ({ page }) => {
  await page.goto('/components/slider/')
  await ready(page)

  const thumb = page.getByRole('slider', { name: 'Quality' })
  await expect(page.getByText('80%')).toBeVisible()

  await thumb.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')

  // The figure exists to say where the thumb is. Reading it off `defaultValue`
  // meant it said 80 forever.
  await expect(page.getByText('90%')).toBeVisible()
})

test('toggle group: single picks one, multiple picks several', async ({ page }) => {
  await page.goto('/components/toggle-group/')
  await ready(page)

  // The page now carries a second "Layout" group — the controlled example that
  // refuses to switch itself off — so the groups have to be reached through the
  // example that owns them rather than by their label alone.
  const example = page.locator('[data-example="ToggleGroup/01-default"]')
  const single = example.getByRole('radiogroup', { name: 'Layout' })
  const multiple = example.getByRole('toolbar', { name: 'Formats' })

  await single.getByRole('radio', { name: 'Map' }).click()
  await expect(single.getByRole('radio', { name: 'Map' })).toHaveAttribute('data-state', 'on')
  await expect(single.getByRole('radio', { name: 'Grid' })).toHaveAttribute('data-state', 'off')

  // And the multiple group genuinely holds several at once — the thing that
  // looked like a bug until the two kinds stopped looking identical.
  await multiple.getByRole('button', { name: 'Digital' }).click()
  await expect(multiple.getByRole('button', { name: 'Film' })).toHaveAttribute('data-state', 'on')
  await expect(multiple.getByRole('button', { name: 'Digital' })).toHaveAttribute('data-state', 'on')
})

test('toggle group: one pill travels between the options', async ({ page }) => {
  await page.goto('/components/toggle-group/')
  await ready(page)

  // Same two "Layout" groups as above; the travelling pill belongs to the first
  // example, which is the one that puts both modes side by side.
  const example = page.locator('[data-example="ToggleGroup/01-default"]')
  const single = example.getByRole('radiogroup', { name: 'Layout' })
  const pill = single.locator('span[aria-hidden]').first()
  const start = await pill.evaluate((element) => element.style.transform)

  await single.getByRole('radio', { name: 'Map' }).click()
  await expect
    .poll(() => pill.evaluate((element) => element.style.transform))
    .not.toBe(start)
  await expect(pill).toHaveCSS('transition-property', /transform/)
})

test('pagination: the current pill moves rather than blinking', async ({ page }) => {
  await page.goto('/components/pagination/')
  await ready(page)

  const nav = page.getByRole('navigation', { name: 'Pagination' })
  await expect(page.getByText('page 1 of 20')).toBeVisible()

  const pill = nav.locator('span[aria-hidden]').first()
  const start = await pill.evaluate((element) => element.style.transform)

  await nav.getByRole('button', { name: 'Page 20' }).click()
  await expect(page.getByText('page 20 of 20')).toBeVisible()
  await expect.poll(() => pill.evaluate((element) => element.style.transform)).not.toBe(start)
})

test('select: the option list is ours, and grouped', async ({ page }) => {
  await page.goto('/components/select/')
  await ready(page)

  await page.getByRole('combobox', { name: 'Region' }).first().click()
  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible()
  // A native <select> renders its options in the OS, where none of this exists.
  await expect(listbox.getByRole('group')).toHaveCount(2)
  await expect(listbox.getByRole('option', { name: 'Japan' })).toBeVisible()

  await listbox.getByRole('option', { name: 'Japan' }).click()
  await expect(page.getByRole('combobox', { name: 'Region' }).first()).toContainText('Japan')
})

test('combobox: several at once, and the panel stays open', async ({ page }) => {
  await page.goto('/components/combobox/')
  await ready(page)

  // A trigger is named by its label AND its value — "Tags, Film" — so the name
  // moves as the value does and cannot be the whole of what identifies it. The
  // prefix is the label half, and the trailing SPACE is what separates it from
  // the panel's own filter: that is a combobox too, named "Tags: Search…"
  // deliberately, so the two are told apart.
  const trigger = page.getByRole('combobox', { name: /^Tags / })
  await trigger.click()

  const list = page.getByRole('listbox')
  await list.getByRole('option', { name: 'Portrait' }).click()
  // Still open: picking three things should not cost three round trips.
  await expect(list).toBeVisible()
  await list.getByRole('option', { name: 'Street' }).click()

  await page.keyboard.press('Escape')
  await expect(trigger).toContainText('3 selected')
  // On the screen AND in the ear. `aria-label` used to outrank the trigger's
  // own text, so a reader heard "Tags" and never what they had picked.
  await expect(trigger).toHaveAccessibleName('Tags 3 selected')
})

test('combobox: the panel is clipped to its own corners', async ({ page }) => {
  await page.goto('/components/combobox/')
  await ready(page)
  await page.getByRole('combobox', { name: 'Camera' }).click()

  const panel = page.getByRole('listbox').locator('xpath=ancestor::*[@role="dialog"][1]')
  await expect(panel).toHaveCSS('overflow-x', 'hidden')
  await expect(panel).not.toHaveCSS('border-bottom-left-radius', '0px')
})

test('date picker: the caption opens a month picker in place of the grid', async ({ page }) => {
  await page.goto('/components/date-picker/')
  await ready(page)

  await page.getByRole('button', { name: 'Publish on' }).first().click()

  const calendar = page.locator('.rdp-root')
  // One control, not two dropdowns. "September 2026" is how the date is said,
  // and the two Selects it replaces portalled a three-row scrolling list over
  // the grid the reader opened it to change.
  const caption = calendar.getByRole('button', { name: /\w+ \d{4}/ }).first()
  await expect(caption).toHaveAttribute('aria-expanded', 'false')

  await caption.click()
  // `dialog`, not `group`: the panel now holds Tab inside itself, and the role
  // follows from that containment rather than decorating it.
  const picker = calendar.getByRole('dialog', { name: 'Month and year' })
  await expect(picker).toBeVisible()
  // Twelve months at the size of the grid they replace: no scrolling, and
  // nothing floating over the calendar.
  await expect(picker.getByRole('button')).toHaveCount(15)
  const pickerBox = (await picker.boundingBox())!
  const calendarBox = (await calendar.boundingBox())!
  expect(pickerBox.y + pickerBox.height).toBeLessThanOrEqual(calendarBox.y + calendarBox.height + 1)

  // Escape closes it and hands focus back, rather than leaving the grid covered.
  await page.keyboard.press('Escape')
  await expect(picker).toBeHidden()
  await expect(caption).toBeFocused()

  const nav = calendar.locator('nav')
  await expect(nav).toHaveCSS('position', 'absolute')

  // The card reserves the room the open state needs, so the panel does not
  // spill over whatever is printed beneath it.
  const panel = await calendar.boundingBox()
  const card = await page.locator('[data-density]').first().boundingBox()
  expect(panel && card && panel.y + panel.height).toBeLessThanOrEqual((card?.y ?? 0) + (card?.height ?? 0) + 1)
})

test('date picker: a range keeps the panel open until both ends are set', async ({ page }) => {
  await page.goto('/components/date-picker/')
  await ready(page)

  await page.getByRole('button', { name: 'Reporting period' }).first().click()
  const calendar = page.locator('.rdp-root')
  await expect(calendar).toBeVisible()
  // Two months at once, because a range crossing a boundary is the common case.
  await expect(calendar.getByRole('grid')).toHaveCount(2)

  // Day buttons are named with the full date ("Thursday, September 10th…"),
  // so pick one by that rather than by the numeral, which also matches a year.
  await calendar.getByRole('button', { name: /10th/ }).first().click()
  // Still open: a range is not a value until it has a second date, and closing
  // on the first one would mean re-opening to finish.
  await expect(calendar).toBeVisible()
})

test('tooltip: a copy control says it copied', async ({ page }) => {
  await page.goto('/components/tooltip/')
  await ready(page)

  // The page's own snippets have a copy button too ("Copy the snippet"), so the
  // control under test is reached through the example that owns it.
  const example = page.locator('[data-example="Tooltip/01-an-icon-button"]')
  const copy = example.getByRole('button', { name: 'Copy' })
  await copy.click()
  // The name, the icon and the tip all change together — a control that looks
  // identical afterwards gets clicked twice.
  await expect(example.getByRole('button', { name: 'Copied' })).toBeVisible()
})

test('switch: the label follows the state', async ({ page }) => {
  await page.goto('/components/switch/')
  await ready(page)

  const row = page.locator('label').filter({ hasText: 'Email notifications' })
  await expect(row).toContainText('On')
  await row.getByRole('switch').click()
  await expect(row).toContainText('Off')
})

test('table: only the column that opted in can sort, and it says which way', async ({ page }) => {
  await page.goto('/components/table/')
  await ready(page)

  const table = page.getByRole('table', { name: 'Recent deploys' }).first()
  // Three of the four headers carry no sort affordance at all. A table where
  // every header is a button invites sorting a column the data cannot order by.
  await expect(table.getByRole('columnheader').filter({ hasText: /Commit|Branch|State/ })).toHaveCount(3)
  await expect(table.getByRole('columnheader').getByRole('button')).toHaveCount(1)

  const duration = table.getByRole('columnheader', { name: 'Duration' })
  await expect(duration).toHaveAttribute('aria-sort', 'none')

  const seconds = () => table.locator('tbody tr td:nth-child(3)').allInnerTexts()
  expect(await seconds()).toEqual(['2m 14s', '2m 41s', '1m 02s', '2m 20s'])

  await duration.getByRole('button').click()
  await expect(duration).toHaveAttribute('aria-sort', 'ascending')
  expect(await seconds()).toEqual(['1m 02s', '2m 14s', '2m 20s', '2m 41s'])

  await duration.getByRole('button').click()
  await expect(duration).toHaveAttribute('aria-sort', 'descending')
  expect(await seconds()).toEqual(['2m 41s', '2m 20s', '2m 14s', '1m 02s'])
})

test('table: alignment and borders are settings, not per-cell classes', async ({ page }) => {
  await page.goto('/components/table/')
  await ready(page)

  const table = page.getByRole('table', { name: 'Recent deploys' }).first()
  await expect(table.locator('tbody tr').first().locator('td').nth(2)).toHaveCSS('text-align', 'end')
  await expect(table.locator('tbody tr').first().locator('td').nth(3)).toHaveCSS('text-align', 'center')

  // `grid` rules between columns; `rows` does not. Both are drawn from the
  // wrapper, so a cell never has to be told what its table decided.
  const grid = page.getByRole('table', { name: 'grid example' })
  await expect(grid.locator('tbody tr').first().locator('td').first()).toHaveCSS('border-right-width', '1px')
  const rows = page.getByRole('table', { name: 'rows example' })
  await expect(rows.locator('tbody tr').first().locator('td').first()).toHaveCSS('border-right-width', '0px')
})

test('searchable menu: the filter narrows nine actions to one', async ({ page }) => {
  await page.goto('/components/searchable-menu/')
  await ready(page)

  // Scoped to the example: the sidebar has a collapsible group of the same name.
  await page.locator('[data-density]').getByRole('button', { name: 'Actions' }).first().click()
  const list = page.getByRole('listbox')
  await expect(list.getByRole('option')).toHaveCount(9)

  // Keywords search too: "iframe" is nowhere in the visible label.
  await page.getByPlaceholder('Filter actions…').fill('iframe')
  await expect(list.getByRole('option')).toHaveCount(1)
  await page.keyboard.press('Enter')

  await expect(page.getByText('ran: Copy embed code')).toBeVisible()
  await expect(list).toBeHidden()
})

test('date picker: a shortcut fills both ends of the range at once', async ({ page }) => {
  await page.goto('/components/date-picker/')
  await ready(page)

  const trigger = page.getByRole('button', { name: 'Reporting period' }).first()
  await trigger.click()
  await page.getByRole('button', { name: 'Last 30 days' }).click()

  // A preset is a complete value, so unlike picking a start date it closes.
  await expect(page.locator('.rdp-root')).toBeHidden()
  await expect(trigger).toHaveText(/\w+ \d+, \d{4} – \w+ \d+, \d{4}/)
})

test('calendar: the year picker replaces the grid, and the day it selects is round', async ({ page }) => {
  await page.goto('/components/calendar/')
  await ready(page)

  const calendar = page.locator('.rdp-root').first()
  await calendar.getByRole('button', { name: /\w+ \d{4}/ }).first().click()
  // The year label inside the month panel opens the year grid — twenty years
  // in one page, which is why the default span is ten either side.
  await calendar
    .getByRole('dialog', { name: 'Month and year' })
    .getByRole('button', { name: /^\d{4}$/ })
    .click()
  const years = calendar.getByRole('dialog', { name: 'Year' })
  // Pages tile the range from its first year rather than being centred on the
  // year showing, so every year in the span is reachable — twenty-one here,
  // which is the ten either side the default span promises plus this one.
  await expect(years.getByRole('button', { name: /^\d{4}$/ })).toHaveCount(21)
  const box = (await years.boundingBox())!
  const frame = (await calendar.boundingBox())!
  expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height + 1)
  await page.keyboard.press('Escape')

  const day = calendar.getByRole('button', { name: /15th/ }).first()
  await day.click()
  // react-day-picker states the selection in the label, not in aria-selected.
  await expect(day).toHaveAttribute('aria-label', /selected/)
  // The pill radius, not the square that a doubled range-end override produced.
  const radius = await day.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)
  expect(Number.parseFloat(radius)).toBeGreaterThan(8)
  await expect(day).toHaveCSS('background-color', /rgba?\((?!0, 0, 0, 0)/)
})

test('toggle group: the sliding pill lands on its segment, scaled or not', async ({ page }) => {
  // The pill only renders once the strip has measured itself, so this polls
  // rather than reading once — and allows a pixel for sub-pixel layout, not for
  // a pill that missed.
  const landsOnTarget = async (scope: string) => {
    await expect(page.locator(`${scope} span[aria-hidden]`).first()).toBeVisible()
    await expect
      .poll(async () =>
        page.evaluate((selector) => {
          const group = [...document.querySelectorAll(selector)].find((element) =>
            /Grid/.test(element.textContent ?? ''),
          )
          const pill = group?.querySelector('span[aria-hidden]')
          const segment = group?.querySelector('[role="radio"]')
          if (!pill || !segment) return -1
          const a = pill.getBoundingClientRect()
          const b = segment.getBoundingClientRect()
          return Math.round(
            Math.max(Math.abs(a.left - b.left), Math.abs(a.top - b.top), Math.abs(a.width - b.width)),
          )
        }, scope),
      )
      .toBeLessThanOrEqual(1)
  }

  await page.goto('/components/toggle-group/')
  await ready(page)
  await landsOnTarget('[data-density] [role="radiogroup"]')

  // And inside the zoomed thumbnails on the index. The indicator used to
  // measure with getBoundingClientRect, which reports VISUAL pixels — so in any
  // scaled or zoomed container the pill landed short by the scale factor while
  // looking perfectly fine everywhere else.
  await page.goto('/components/')
  await landsOnTarget('[inert] [role="radiogroup"]')
})
