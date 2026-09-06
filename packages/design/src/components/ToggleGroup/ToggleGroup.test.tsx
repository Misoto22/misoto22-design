import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup'
import { Field } from '../Field/Field'

describe('ToggleGroup inside a required Field', () => {
  it('marks a single-value strip, which is a radiogroup', () => {
    render(
      <Field label="Layout" required>
        <ToggleGroup type="single" defaultValue="grid">
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
        </ToggleGroup>
      </Field>,
    )
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true')
  })

  it('leaves a multiple-value strip unmarked, because a toolbar takes no aria-required', () => {
    // A multiple-value group is role="toolbar", which allows aria-orientation,
    // aria-activedescendant and aria-expanded and nothing else — so the same
    // Field prop that marks the radiogroup above is an invalid attribute here,
    // which axe's aria-allowed-attr fails on.
    render(
      <Field label="Filters" required>
        <ToggleGroup type="multiple">
          <ToggleGroupItem value="open">Open</ToggleGroupItem>
          <ToggleGroupItem value="mine">Mine</ToggleGroupItem>
        </ToggleGroup>
      </Field>,
    )
    expect(screen.getByRole('toolbar')).not.toHaveAttribute('aria-required')
  })
})
