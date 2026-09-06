import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ERROR_ACTION_CLASS, ErrorState } from './ErrorState'

function renderState(props: { level?: 1 | 2 | 3 | 4 | 5 | 6; heading: string }) {
  return render(
    <ErrorState
      code="404"
      message="The page has moved, or never existed."
      action={
        <a href="/" className={ERROR_ACTION_CLASS}>
          Back home
        </a>
      }
      {...props}
    />,
  )
}

describe('ErrorState', () => {
  it('is the page h1 by default', () => {
    // It replaces the page rather than sitting inside one, so the page's only
    // h1 is the one it renders.
    renderState({ heading: 'Page not found' })
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
  })

  it('renders the element the level names', () => {
    renderState({ level: 2, heading: 'Inside a shell' })
    // The advice "do not render it inside a shell that already has an h1" is
    // only followable if there is a prop that follows it.
    expect(screen.getByRole('heading', { level: 2, name: 'Inside a shell' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('keeps the heading at --fs-heading whatever the level is', () => {
    // Moving it down the outline must not shrink it: an error page demoted to
    // an h2 is the same error page.
    renderState({ heading: 'Default level' })
    renderState({ level: 6, heading: 'Buried level' })
    for (const name of ['Default level', 'Buried level']) {
      const className = screen.getByText(name).className
      expect(className, name).toContain('var(--fs-heading)')
      expect(className, name).not.toContain('var(--fs-title)')
      expect(className, name).not.toContain('var(--fs-item)')
      expect(className, name).not.toContain('font-mono')
    }
  })

  it('keeps the spacing the heading had before it was a Heading', () => {
    // mt-6 under the code, mb-4 above the message. Heading resets margins to
    // zero, so these have to survive the merge or the whole column reflows.
    renderState({ heading: 'Spacing' })
    const className = screen.getByText('Spacing').className
    expect(className).toContain('mt-6')
    expect(className).toContain('mb-4')
  })
})
