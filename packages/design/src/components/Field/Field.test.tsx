import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field } from './Field'
import { Input } from '../Input/Input'

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
})
