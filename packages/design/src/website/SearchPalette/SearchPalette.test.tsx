import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchPalette } from './SearchPalette'

describe('SearchPalette', () => {
  it('uses externally filtered results and selects with the keyboard', async () => {
    const user = userEvent.setup()
    const selected = vi.fn()
    function Example() {
      const [query, setQuery] = useState('')
      return <SearchPalette open onOpenChange={() => {}} label="Search the archive" inputLabel="Query" placeholder="Search" query={query} onQueryChange={setQuery}
        groups={[{ id: 'pages', label: 'Pages', items: [{ id: 'remote-hit', title: 'A distant place', onSelect: selected }] }]}
        emptyLabel="Nothing found" labels={{ close: 'Close search', navigate: 'Navigate', select: 'Open', back: 'Back' }} />
    }
    render(<Example />)
    await user.type(screen.getByRole('combobox', { name: 'Query' }), 'mountains')
    expect(screen.getByRole('option', { name: 'A distant place' })).toBeVisible()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(selected).toHaveBeenCalledOnce()
  })

  it('returns from detail with Escape, then closes and restores focus', async () => {
    const user = userEvent.setup()
    function Example() {
      const [open, setOpen] = useState(false)
      const [detail, setDetail] = useState(true)
      return <>
        <button onClick={() => setOpen(true)}>Launch search</button>
        <SearchPalette open={open} onOpenChange={setOpen} label="Search" inputLabel="Query" placeholder="Search" query="hello" onQueryChange={() => {}} groups={[]}
          emptyLabel="Nothing found" labels={{ close: 'Close search', navigate: 'Navigate', select: 'Ask', back: 'Back' }}
          detail={detail ? { label: 'Answer', content: <a href="/source">Read source</a>, onBack: () => setDetail(false), onSubmit: () => {} } : undefined} />
      </>
    }
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Launch search' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Query' })).toHaveFocus()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
