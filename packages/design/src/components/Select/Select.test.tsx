import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select, SelectItem } from './Select'

describe('Select', () => {
  it('announces the chosen value as well as the name', () => {
    // The trigger's text IS the value. A name that replaces it leaves a reader
    // who cannot see the control with the noun and never the answer.
    render(
      <Select label="Region" defaultValue="au">
        <SelectItem value="au">Australia</SelectItem>
        <SelectItem value="nz">New Zealand</SelectItem>
      </Select>,
    )
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Region Australia')
  })

  it('reads the invalid state from aria-invalid, the spelling a form library sets', () => {
    render(
      <Select label="Region" aria-invalid>
        <SelectItem value="au">Australia</SelectItem>
      </Select>,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger.className).toContain('border-(--danger)')
  })

  it('truncates a long value rather than growing the field', () => {
    const { container } = render(
      <Select label="Region" defaultValue="au">
        <SelectItem value="au">
          Australia, New Zealand and the external territories of both
        </SelectItem>
      </Select>,
    )
    const value = container.querySelector('.truncate')
    expect(value).not.toBeNull()
    expect(value).toHaveTextContent('Australia, New Zealand')
  })
})
