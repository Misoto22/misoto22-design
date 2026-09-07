import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NavigationSearchTrigger, PreferenceMenu, SiteNavigation } from './SiteNavigation'

describe('SiteNavigation', () => {
  it('exposes a visible shortcut and activates search from the keyboard', async () => {
    const user = userEvent.setup()
    const open = vi.fn()
    render(<NavigationSearchTrigger label="Search" onClick={open} />)
    expect(screen.getByText('⌘ K').tagName).toBe('KBD')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Search (⌘ K)' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(open).toHaveBeenCalledOnce()
  })
  it('opens a named navigation dialog and returns focus after Escape', async () => {
    const user = userEvent.setup()
    render(<SiteNavigation brand={<a href="/">Portfolio</a>} label="Primary" openLabel="Open menu" closeLabel="Close menu" links={[{ id: 'work', content: <a href="/work">Work</a>, active: true }]} />)
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Primary' })).toBeVisible()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})


describe('PreferenceMenu focus and scroll behavior', () => {
  const menu = () => <PreferenceMenu label="Appearance" value="system" onValueChange={() => {}} icon={<span>Theme</span>} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }]} />
  it('does not lock page scrolling or restore pointer focus after selection', async () => {
    const user = userEvent.setup()
    render(menu())
    const trigger = screen.getByRole('button', { name: 'Appearance' })
    await user.click(trigger)
    expect(document.body).not.toHaveAttribute('data-scroll-locked')
    await user.click(screen.getByRole('menuitemradio', { name: 'Light' }))
    expect(trigger).not.toHaveFocus()
  })
  it('restores trigger focus when dismissed with Escape', async () => {
    const user = userEvent.setup()
    render(menu())
    const trigger = screen.getByRole('button', { name: 'Appearance' })
    await user.tab()
    await user.keyboard('{Enter}')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })
})
