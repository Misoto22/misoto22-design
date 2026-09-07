import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionMenu, ScrollControl } from './Actions'

describe('ActionMenu', () => {
  it('moves between actions with the keyboard and restores focus after Escape', async () => {
    const user = userEvent.setup()
    const select = vi.fn()
    function Menu() {
      const [open, setOpen] = useState(false)
      return <ActionMenu label="Share" icon={<span aria-hidden>+</span>} open={open} onOpenChange={setOpen} align="end" items={[{ id: 'copy', label: 'Copy link', onSelect: select, keepOpen: true }, { id: 'open', label: 'Open elsewhere', onSelect: select }]} />
    }
    render(<Menu />)
    const trigger = screen.getByRole('button', { name: 'Share' })
    trigger.focus()
    await user.keyboard('{Enter}')
    const menu = screen.getByRole('menu')
    expect(menu).toHaveAttribute('data-align', 'end')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Copy link' })).toHaveFocus())
    await user.keyboard('{Enter}')
    expect(select).toHaveBeenCalledOnce()
    expect(menu).toBeInTheDocument()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Open elsewhere' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('runs a host native action without opening the menu', async () => {
    const user = userEvent.setup()
    const nativeAction = vi.fn()
    render(<ActionMenu label="Share" icon={<span />} items={[]} open={false} onOpenChange={vi.fn()} onTriggerAction={nativeAction} />)
    await user.click(screen.getByRole('button', { name: 'Share' }))
    expect(nativeAction).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

describe('ScrollControl', () => {
  it('removes an invisible control from keyboard and accessibility navigation', () => {
    const { rerender } = render(<ScrollControl label="Back to top" visible={false} onActivate={vi.fn()} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Back to top')).toBeDisabled()
    expect(screen.getByLabelText('Back to top')).toHaveAttribute('tabindex', '-1')
    rerender(<ScrollControl label="Back to top" visible onActivate={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeEnabled()
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0')
  })
})
