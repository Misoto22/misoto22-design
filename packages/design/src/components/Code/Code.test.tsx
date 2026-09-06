import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Code } from './Code'

describe('Code', () => {
  it('renders a <code> element, not a styled span', () => {
    // The element is the whole point: a mono <span> looks identical and tells
    // assistive tech nothing, so "pass dash dash force" is what gets read out.
    render(<Code>--force</Code>)
    expect(screen.getByText('--force').tagName).toBe('CODE')
  })

  it('merges a caller className with the base classes', () => {
    render(<Code className="custom-x">cn()</Code>)
    expect(screen.getByText('cn()')).toHaveClass('custom-x')
  })

  it('forwards arbitrary attributes to the element', () => {
    render(<Code title="the merge helper">cn()</Code>)
    expect(screen.getByText('cn()')).toHaveAttribute('title', 'the merge helper')
  })
})
