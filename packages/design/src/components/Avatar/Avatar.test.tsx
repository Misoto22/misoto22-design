import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

/**
 * The avatar's accessible name is the whole of what it contributes, and for
 * most rows of a real list there is no photograph — so the case with no `src`
 * is the case that has to work. Radix renders the image only once `src` is
 * given and jsdom's `Image` never loads, so the fallback branch is what every
 * test here exercises whether or not it passes a `src`.
 */
describe('Avatar', () => {
  it('names the person when there is no photograph', () => {
    // The failure this exists for: alt reaches the DOM only through the image,
    // the image renders only under `src`, and the initials are aria-hidden —
    // so an avatar with no photograph announced nothing at all.
    render(<Avatar alt="Henry Chen" fallback="HC" />)
    expect(screen.getByRole('img', { name: 'Henry Chen' })).toBeInTheDocument()
  })

  it('names the person exactly once', () => {
    // Two named elements in one circle is the other half of the bug: a reader
    // hears the person twice, once from the root and once from the image.
    render(<Avatar src="/henry.jpg" alt="Henry Chen" fallback="HC" />)
    expect(screen.getAllByRole('img', { name: 'Henry Chen' })).toHaveLength(1)
  })

  it('leaves the tree alone for the deliberate empty alt', () => {
    // An empty string is the documented, correct markup for an avatar whose
    // person is already named beside it. Announcing an unnamed image there
    // would be the false positive the empty string exists to avoid.
    render(<Avatar alt="" fallback="HC" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('keeps the initials out of what is read aloud', () => {
    // Unchanged, and it has to stay unchanged: the name now comes from the
    // root, so initials read out beside it would be noise on top of it.
    const { container } = render(<Avatar alt="Henry Chen" fallback="HC" />)
    const hidden = container.querySelector('[aria-hidden="true"]')
    expect(hidden?.textContent).toBe('HC')
  })
})
