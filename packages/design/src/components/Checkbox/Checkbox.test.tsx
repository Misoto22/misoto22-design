import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Checkbox } from './Checkbox'

const glyph = (container: HTMLElement) =>
  container.querySelector('svg')?.getAttribute('class') ?? ''

describe('Checkbox', () => {
  it('draws the dash for an uncontrolled indeterminate box', () => {
    // The tick here is the "all of them" picture on a partly selected list —
    // the one thing the indeterminate state exists to avoid saying.
    const { container } = render(<Checkbox aria-label="Select all" defaultChecked="indeterminate" />)
    expect(glyph(container)).toMatch(/minus/)
  })

  it('draws the dash for a controlled indeterminate box', () => {
    const { container } = render(
      <Checkbox aria-label="Select all" checked="indeterminate" onCheckedChange={() => {}} />,
    )
    expect(glyph(container)).toMatch(/minus/)
  })

  it('draws the tick when it is simply checked', () => {
    const { container } = render(<Checkbox aria-label="Ship on merge" defaultChecked />)
    expect(glyph(container)).toMatch(/check/)
  })
})
