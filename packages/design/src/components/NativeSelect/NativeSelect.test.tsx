import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { NativeSelect } from './NativeSelect'

describe('NativeSelect', () => {
  it('sizes the wrapper, so the chevron stays against the field', () => {
    // The chevron is pinned to the wrapper. A width on the <select> alone left
    // the arrow floating at the far edge of a full-width box.
    const { container } = render(
      <NativeSelect className="w-48" aria-label="Region">
        <option value="au">Australia</option>
      </NativeSelect>,
    )
    expect(container.firstElementChild).toHaveClass('w-48')
  })

  it('keeps the control box on the select itself', () => {
    const { container } = render(
      <NativeSelect aria-label="Region">
        <option value="au">Australia</option>
      </NativeSelect>,
    )
    expect(container.querySelector('select')?.className).toContain('border-(--rule-2)')
  })
})
