import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'
import { resetWarnings } from '../../lib/warn'

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Button', href: '/components/button' },
]

describe('Breadcrumb', () => {
  it('does not link the page you are already on, even when given an href', () => {
    render(<Breadcrumb items={ITEMS} />)
    expect(screen.queryByRole('link', { name: 'Button' })).not.toBeInTheDocument()
    expect(screen.getByText('Button')).toHaveAttribute('aria-current', 'page')
  })

  it('links every earlier crumb', () => {
    render(<Breadcrumb items={ITEMS} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '/components')
  })

  it('hides the separators from assistive tech', () => {
    const { container } = render(<Breadcrumb items={ITEMS} />)
    expect(container.querySelectorAll('li[aria-hidden="true"]')).toHaveLength(2)
  })
})

/**
 * A crumb with no href renders as a <span> in the same --ink-3-aa as the links
 * beside it and gets no aria-current, so the omission is invisible in the
 * browser and invisible in review. The console is the only place left to say
 * it, and the only place an agent repairing its own call will look.
 */
describe('a middle crumb with no destination', () => {
  let warned: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetWarnings()
    warned = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warned.mockRestore()
  })

  const message = () => warned.mock.calls.map((call) => String(call[0])).join('\n')

  it('says so, naming the crumb', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Components' }, { label: 'Button' }]}
      />,
    )
    expect(message()).toContain('BREADCRUMB_CRUMB_NOT_LINKED')
    expect(message()).toContain('Components')
  })

  it('stays quiet for the last crumb, which is text by design', () => {
    render(<Breadcrumb items={ITEMS} />)
    expect(warned).not.toHaveBeenCalled()
  })

  it('stays quiet for a one-item trail, whose only crumb is the current page', () => {
    render(<Breadcrumb items={[{ label: 'Button' }]} />)
    expect(warned).not.toHaveBeenCalled()
  })
})
