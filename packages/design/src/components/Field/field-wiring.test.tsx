import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field } from './Field'
import { Select, SelectItem } from '../Select/Select'
import { Combobox } from '../Combobox/Combobox'
import { DatePicker } from '../DatePicker/DatePicker'
import { Slider } from '../Slider/Slider'
import { RadioGroup, RadioGroupItem } from '../RadioGroup/RadioGroup'
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup'

/**
 * The six controls whose widget lives deeper than the element `cloneElement`
 * can reach.
 *
 * Each one is asserted through the ROLE the reader lands on — the trigger, the
 * group, the thumb — because that is the element a screen reader reads the
 * description from. Asserting on the wrapper would pass while announcing
 * nothing, which is the failure these exist for.
 */
describe('Field wiring for composite controls', () => {
  it('announces the hint on a Select trigger', () => {
    render(
      <Field label="Region" hint="Where the invoice is issued.">
        <Select label="Region" defaultValue="au">
          <SelectItem value="au">Australia</SelectItem>
        </Select>
      </Field>,
    )
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription(
      'Where the invoice is issued.',
    )
  })

  it('marks a Select invalid when the field has an error', () => {
    render(
      <Field label="Region" error="Pick a region.">
        <Select label="Region">
          <SelectItem value="au">Australia</SelectItem>
        </Select>
      </Field>,
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger).toHaveAccessibleDescription('Pick a region.')
  })

  it('points the visible label at the Select trigger, so clicking it focuses the control', () => {
    const { container } = render(
      <Field label="Region">
        <Select label="Region">
          <SelectItem value="au">Australia</SelectItem>
        </Select>
      </Field>,
    )
    const label = container.querySelector('label')
    expect(label?.getAttribute('for')).toBe(screen.getByRole('combobox').id)
  })

  it('announces the hint on a Combobox trigger', () => {
    render(
      <Field label="Framework" hint="Only the ones we deploy.">
        <Combobox label="Framework" options={[{ value: 'next', label: 'Next.js' }]} />
      </Field>,
    )
    expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Only the ones we deploy.')
  })

  it('announces the hint on a DatePicker trigger', () => {
    render(
      <Field label="Publish on" hint="Anything after today.">
        <DatePicker label="Publish on" />
      </Field>,
    )
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Anything after today.')
  })

  it('names a RadioGroup with the field label and announces its hint', () => {
    render(
      <Field label="Appearance" hint="Applies to this browser only.">
        <RadioGroup defaultValue="light">
          <RadioGroupItem value="light">Light</RadioGroupItem>
          <RadioGroupItem value="dark">Dark</RadioGroupItem>
        </RadioGroup>
      </Field>,
    )
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAccessibleName('Appearance')
    expect(group).toHaveAccessibleDescription('Applies to this browser only.')
  })

  it('names a ToggleGroup with the field label', () => {
    render(
      <Field label="Layout" hint="Remembered per device.">
        <ToggleGroup type="single" defaultValue="grid">
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
        </ToggleGroup>
      </Field>,
    )
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAccessibleName('Layout')
    expect(group).toHaveAccessibleDescription('Remembered per device.')
  })

  it('announces the hint on the Slider thumb, which is what carries the role', () => {
    render(
      <Field label="Quality" hint="Higher is slower.">
        <Slider label="Quality" defaultValue={[80]} />
      </Field>,
    )
    expect(screen.getByRole('slider')).toHaveAccessibleDescription('Higher is slower.')
  })

  it('marks a required Slider aria-required on the thumb', () => {
    render(
      <Field label="Quality" required>
        <Slider label="Quality" defaultValue={[80]} />
      </Field>,
    )
    expect(screen.getByRole('slider')).toHaveAttribute('aria-required', 'true')
  })

  it('marks an invalid Slider on the thumb, where the role is', () => {
    // The one attribute of the four that was not destructured, so it fell
    // into the rest and landed on the roleless span the primitive renders as
    // its root. A field drew the error and announced nothing — which is the
    // failure this whole wiring exists to prevent, in the component that
    // prompted it.
    render(
      <Field label="Quality" error="Pick a quality.">
        <Slider label="Quality" defaultValue={[80]} />
      </Field>,
    )
    expect(screen.getByRole('slider')).toHaveAttribute('aria-invalid', 'true')
  })
})
