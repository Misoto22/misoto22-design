import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchableMenu, type MenuAction } from './SearchableMenu'
import { resetWarnings } from '../../lib/warn'

/**
 * Ids as an application actually has them: opaque, stable, and nothing a reader
 * would ever type. The labels are the words on screen.
 */
const ACTIONS: MenuAction[] = [
  { id: '5f1c9a2e-0b3d-4c77-9c1a-2b6f0e7d8a41', label: 'Duplicate frame', onSelect: () => {} },
  { id: 'c8b7e6d5-4a39-4f21-8e0d-1c2b3a4d5e6f', label: 'Export as PNG', onSelect: () => {} },
  { id: '9d2e1f0a-7c6b-4d5e-8f90-a1b2c3d4e5f6', label: 'Archive', onSelect: () => {} },
]

async function open() {
  const user = userEvent.setup()
  render(
    <SearchableMenu label="Frame actions" actions={ACTIONS}>
      Actions
    </SearchableMenu>,
  )
  await user.click(screen.getByRole('button', { name: 'Frame actions' }))
  return user
}

/**
 * The component's whole purpose is filtering, and it filtered on the wrong
 * string.
 *
 * cmdk derives an item's value from the first string in
 * `[props.value, props.children, ref]` — the `textContent` fallback is only
 * reached when `value` is absent. This passed `value={action.id}`, so with the
 * opaque ids a real application has, typing the label a reader can SEE scored
 * zero against every row and the menu showed its empty state.
 */
describe('SearchableMenu filtering', () => {
  it('matches the label a reader can see', async () => {
    const user = await open()
    await user.type(screen.getByPlaceholderText('Filter…'), 'Export')
    expect(screen.getByRole('option', { name: /Export as PNG/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Archive/ })).not.toBeInTheDocument()
  })

  it('still matches on keywords, which stay the escape hatch', async () => {
    const user = userEvent.setup()
    render(
      <SearchableMenu
        label="Frame actions"
        actions={[{ id: 'a1', label: 'Export as PNG', keywords: ['download'], onSelect: () => {} }]}
      >
        Actions
      </SearchableMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'Frame actions' }))
    await user.type(screen.getByPlaceholderText('Filter…'), 'download')
    expect(screen.getByRole('option', { name: /Export as PNG/ })).toBeInTheDocument()
  })

  it('runs the action the row stands for', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <SearchableMenu
        label="Frame actions"
        actions={[{ id: '5f1c9a2e-0b3d', label: 'Duplicate frame', onSelect }]}
      >
        Actions
      </SearchableMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'Frame actions' }))
    await user.type(screen.getByPlaceholderText('Filter…'), 'Duplicate')
    await user.click(screen.getByRole('option', { name: /Duplicate frame/ }))
    expect(onSelect).toHaveBeenCalledOnce()
  })
})

describe('a label the filter cannot read', () => {
  let warned: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetWarnings()
    warned = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warned.mockRestore()
  })

  const message = () => warned.mock.calls.map((call) => String(call[0])).join('\n')

  /**
   * A label built entirely out of elements has no text this component can lift,
   * and the failure is the silent kind: the row renders, looks right, and never
   * matches anything the reader types.
   */
  it('says so rather than shipping a row that matches nothing', () => {
    render(
      <SearchableMenu
        label="Frame actions"
        actions={[{ id: 'a1', label: <svg role="img" aria-label="Export" />, onSelect: () => {} }]}
      >
        Actions
      </SearchableMenu>,
    )
    expect(message()).toContain('SEARCHABLE_MENU_LABEL_UNREADABLE')
    expect(message()).toContain('keywords')
  })

  it('stays quiet when keywords supply the words instead', () => {
    render(
      <SearchableMenu
        label="Frame actions"
        actions={[
          {
            id: 'a1',
            label: <svg role="img" aria-label="Export" />,
            keywords: ['export', 'png'],
            onSelect: () => {},
          },
        ]}
      >
        Actions
      </SearchableMenu>,
    )
    expect(warned).not.toHaveBeenCalled()
  })

  it('stays quiet for a label it can read through a wrapper', () => {
    render(
      <SearchableMenu
        label="Frame actions"
        actions={[
          {
            id: 'a1',
            label: (
              <span>
                Export <strong>as PNG</strong>
              </span>
            ),
            onSelect: () => {},
          },
        ]}
      >
        Actions
      </SearchableMenu>,
    )
    expect(warned).not.toHaveBeenCalled()
  })
})
