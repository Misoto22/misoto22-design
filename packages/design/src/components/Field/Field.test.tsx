import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field } from './Field'
import { Input } from '../Input/Input'
import { Switch } from '../Switch/Switch'

describe('Field', () => {
  it('labels the control even when no htmlFor is supplied', () => {
    // The generated id has to reach BOTH the label and the control; an earlier
    // version put it on neither, so the label pointed at nothing.
    render(
      <Field label="Email">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('announces the hint through aria-describedby without an explicit htmlFor', () => {
    render(
      <Field label="Email" hint="We never share it.">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('We never share it.')
  })

  it('prefers the error over the hint and marks the control invalid', () => {
    render(
      <Field label="Name" hint="Your full name" error="Name is required.">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAccessibleDescription('Name is required.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('Your full name')).not.toBeInTheDocument()
  })

  it('honours an explicit htmlFor and the control id it belongs to', () => {
    render(
      <Field label="Email" htmlFor="email" hint="Work address">
        <Input id="email" />
      </Field>,
    )
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'email')
    expect(input).toHaveAccessibleDescription('Work address')
  })

  it('marks a required control aria-required', () => {
    render(
      <Field label="Email" required>
        <Input />
      </Field>,
    )
    // Queried by role, not by label: the asterisk is aria-hidden for a screen
    // reader but still sits in the label's text content, so the accessible name
    // here is "Email *".
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
  })
  it('labels a settings row through the accessible name, not the DOM shape', () => {
    // The row puts the label on one side and the control on the other, so
    // nothing about the markup implies the association. What matters is that a
    // screen reader gets "Email notifications" when it lands on the switch.
    render(
      <Field layout="row" label="Email notifications" description="A digest every Monday.">
        <Switch defaultChecked />
      </Field>,
    )
    const control = screen.getByRole('switch', { name: 'Email notifications' })
    expect(control).toHaveAccessibleDescription('A digest every Monday.')
  })

  it('announces the description in the stacked layout too', () => {
    render(
      <Field label="Email notifications" description="A digest every Monday.">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Email notifications')).toHaveAccessibleDescription(
      'A digest every Monday.',
    )
  })

  it('announces the description and the error together', () => {
    // Two different things: the description explains the setting, the error
    // explains what is wrong with the value. A row that has both has to say
    // both, in that order.
    render(
      <Field
        layout="row"
        label="Retention"
        description="How long logs are kept."
        error="Must be at least one day."
      >
        <Input />
      </Field>,
    )
    const control = screen.getByRole('textbox')
    expect(control).toHaveAccessibleDescription('How long logs are kept. Must be at least one day.')
    expect(control).toHaveAttribute('aria-invalid', 'true')
  })

  it('keeps the row layout working with no description at all', () => {
    render(
      <Field layout="row" label="Two-factor authentication">
        <Switch />
      </Field>,
    )
    expect(screen.getByRole('switch', { name: 'Two-factor authentication' })).toBeInTheDocument()
  })

  it('renders the control alone when the row has neither label nor description', () => {
    const { container } = render(
      <Field layout="row">
        <Input aria-label="Search" />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
    expect(container.querySelector('label')).toBeNull()
  })
})
