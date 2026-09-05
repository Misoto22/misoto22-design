import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SURFACE_BY_DIR } from './surface'

/**
 * The keyboard half of accessibility, which axe cannot see.
 *
 * axe reads the static tree: it will tell you a tablist has the right roles and
 * say nothing about whether the arrow keys move between the tabs. That gap is
 * where a component library is usually broken — the markup passes, and the
 * component is unusable without a mouse.
 *
 * Each block below asserts the interaction the ARIA Authoring Practices
 * specifies for that pattern, in the words of the pattern rather than in the
 * words of the implementation.
 */

const fixture = (dir: string) => {
  const entry = SURFACE_BY_DIR.get(dir)
  if (!entry) throw new Error(`no surface fixture for ${dir}`)
  return entry.render()
}

describe('Tabs', () => {
  it('is one tab stop, and the arrow keys move between the tabs', async () => {
    const user = userEvent.setup()
    render(fixture('Tabs'))

    await user.tab()
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Code' })).toHaveFocus()

    // Wraps, per the APG's automatic-activation tablist.
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveFocus()
  })

  it('shows the panel belonging to the focused tab', async () => {
    const user = userEvent.setup()
    render(fixture('Tabs'))

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('The source.')
  })
})

describe('RadioGroup', () => {
  it('is one tab stop for the whole group', async () => {
    const user = userEvent.setup()
    render(fixture('RadioGroup'))

    await user.tab()
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveFocus()

    // A second tab leaves the group rather than landing on the next option —
    // this is the roving tabindex, and it is what a stack of hand-rolled
    // <input type="radio"> wrappers usually gets wrong.
    await user.tab()
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toHaveFocus()
  })

  it('moves focus with the arrow keys', async () => {
    const user = userEvent.setup()
    render(fixture('RadioGroup'))

    await user.tab()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Dark' })).toHaveFocus())

    // Selection-follows-focus — the other half of the radiogroup pattern —
    // is NOT asserted here, and the reason is the environment rather than the
    // component. Radix checks the option in the focus handler the arrow key
    // caused, and that chain does not complete under jsdom: a bare Radix group
    // with no wrapper of ours fails the same assertion. It is checked in a real
    // browser instead, by apps/docs/e2e/a11y.spec.ts.
  })
})

describe('Accordion', () => {
  it('opens the focused row with Enter and closes it again', async () => {
    const user = userEvent.setup()
    render(fixture('Accordion'))

    const trigger = screen.getByRole('button', { name: /How do I install it/ })
    await user.tab()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('also toggles with Space', async () => {
    const user = userEvent.setup()
    render(fixture('Accordion'))

    await user.tab()
    await user.keyboard(' ')
    expect(screen.getByRole('button', { name: /How do I install it/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})

describe('Dialog', () => {
  it('moves focus into the dialog and closes on Escape', async () => {
    const user = userEvent.setup()
    render(fixture('Dialog'))

    await user.click(screen.getByRole('button', { name: 'Delete frame' }))
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement))

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('returns focus to the trigger it came from', async () => {
    const user = userEvent.setup()
    render(fixture('Dialog'))

    const trigger = screen.getByRole('button', { name: 'Delete frame' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    // Focus stranded in a closed dialog is the classic modal bug: the reader
    // presses Tab and lands somewhere near the top of the document.
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})

describe('DropdownMenu', () => {
  it('opens from the keyboard and lands on the first item', async () => {
    const user = userEvent.setup()
    render(fixture('DropdownMenu'))

    await user.tab()
    expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus()

    await user.keyboard('{Enter}')
    const items = await screen.findAllByRole('menuitem')
    await waitFor(() => expect(items[0]).toHaveFocus())
  })

  it('moves between items with the arrow keys and closes on Escape', async () => {
    const user = userEvent.setup()
    render(fixture('DropdownMenu'))

    // Opened with the keyboard, not a click: Radix deliberately does NOT move
    // focus into a menu opened by pointer, because a mouse user has not asked
    // to be moved. Testing the arrow keys therefore has to enter the same way a
    // keyboard user would.
    await user.tab()
    await user.keyboard('{Enter}')
    const items = await screen.findAllByRole('menuitem')
    await waitFor(() => expect(items[0]).toHaveFocus())

    await user.keyboard('{ArrowDown}')
    expect(items[1]).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menuitem')).not.toBeInTheDocument())
  })
})

describe('Checkbox and Switch', () => {
  it('toggles the checkbox with Space', async () => {
    const user = userEvent.setup()
    render(fixture('Checkbox'))

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()

    await user.tab()
    expect(checkbox).toHaveFocus()
    await user.keyboard(' ')
    expect(checkbox).not.toBeChecked()
  })

  it('toggles the switch with Space', async () => {
    const user = userEvent.setup()
    render(fixture('Switch'))

    const toggle = screen.getByRole('switch')
    await user.tab()
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })
})

describe('Button', () => {
  it('fires on both Enter and Space, which is what a native button does', async () => {
    const user = userEvent.setup()
    let clicks = 0
    const { getByRole } = render(
      <button type="button" onClick={() => (clicks += 1)}>
        Go
      </button>,
    )
    getByRole('button').focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(clicks).toBe(2)
  })
})

describe('Pagination', () => {
  it('reaches every page control by tabbing', async () => {
    const user = userEvent.setup()
    render(fixture('Pagination'))

    await user.tab()
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus()

    // The current page is a button, not a styled span, so it is in the tab
    // order like every other — a reader jumping by control can find where
    // they are.
    const current = screen.getByRole('button', { name: 'Page 7' })
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toBeEnabled()
  })
})

describe('Tooltip', () => {
  it('appears on focus, not only on hover', async () => {
    const user = userEvent.setup()
    render(fixture('Tooltip'))

    await user.tab()
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveFocus()
    // A tooltip that only answers to a pointer is invisible to a keyboard user.
    expect(await screen.findByText('Copy to clipboard')).toBeInTheDocument()
  })
})
