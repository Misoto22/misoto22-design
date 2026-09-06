import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toolbar } from './Toolbar'

describe('Toolbar', () => {
  it('is a named group, so a page with two of them has two distinct announcements', () => {
    render(
      <>
        <Toolbar label="Form actions">
          <button type="submit">Save</button>
        </Toolbar>
        <Toolbar label="List filters" position="top">
          <button type="button">Status</button>
        </Toolbar>
      </>,
    )
    expect(screen.getByRole('group', { name: 'Form actions' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'List filters' })).toBeInTheDocument()
  })

  it('does not claim role="toolbar", which it does not implement', () => {
    // The role promises arrow-key movement between the controls. Declaring it
    // without that tells a screen-reader user to press keys that do nothing.
    render(
      <Toolbar label="Form actions">
        <button type="submit">Save</button>
      </Toolbar>,
    )
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })

  it('leaves every control in the tab order', () => {
    render(
      <Toolbar label="Form actions">
        <button type="button">Cancel</button>
        <button type="submit">Save</button>
      </Toolbar>,
    )
    for (const button of screen.getAllByRole('button')) {
      expect(button).not.toHaveAttribute('tabindex')
    }
  })

  it('sticks to the edge it draws its rule on', () => {
    const { rerender } = render(
      <Toolbar label="Form actions">
        <button type="submit">Save</button>
      </Toolbar>,
    )
    const bottom = screen.getByRole('group', { name: 'Form actions' })
    expect(bottom.className).toContain('bottom-0')
    expect(bottom.className).toContain('border-t')

    rerender(
      <Toolbar label="Form actions" position="top">
        <button type="submit">Save</button>
      </Toolbar>,
    )
    const top = screen.getByRole('group', { name: 'Form actions' })
    expect(top.className).toContain('top-0')
    expect(top.className).toContain('border-b')
  })

  it('drops the stickiness but keeps the rule when static', () => {
    render(
      <Toolbar label="Form actions" position="static">
        <button type="submit">Save</button>
      </Toolbar>,
    )
    const bar = screen.getByRole('group', { name: 'Form actions' })
    // `classList`, not a substring: `z-(--z-sticky)` contains the word.
    expect(bar.classList.contains('sticky')).toBe(false)
    expect(bar.className).toContain('border-t')
  })
})
