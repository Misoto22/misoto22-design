import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Combobox } from './Combobox'

const TAGS = [
  { value: 'a', label: 'Accessibility' },
  { value: 'b', label: 'Build' },
  { value: 'c', label: 'Cache' },
]

describe('Combobox', () => {
  it('announces the summary as well as the name', () => {
    render(<Combobox multiple label="Tags" options={TAGS} defaultValue={['a', 'b', 'c']} />)
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Tags 3 selected')
  })

  it('keeps the clear control out of the trigger name', () => {
    // The clear control is inside the trigger and carries its own name. A
    // trigger named from its whole subtree announces "Clear Tags" as part of
    // the value.
    render(<Combobox multiple label="Tags" options={TAGS} defaultValue={['a', 'b', 'c']} />)
    expect(screen.getByRole('combobox').textContent).toContain('3 selected')
    expect(screen.getByRole('combobox')).not.toHaveAccessibleName(/Clear/)
  })
})
