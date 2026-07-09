import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field } from './Field'
import { Input } from '../Input/Input'

describe('Field accessible wiring', () => {
  it('links the error message to the control via aria-describedby + aria-invalid', () => {
    render(
      <Field label="Name" htmlFor="name" error="Name is required.">
        <Input id="name" />
      </Field>,
    )
    const input = screen.getByLabelText('Name')
    expect(screen.getByText('Name is required.')).toHaveAttribute('id', 'name-error')
    expect(input.getAttribute('aria-describedby')).toContain('name-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('links the hint and marks the control required', () => {
    render(
      <Field label="Email" htmlFor="email" required hint="We never share it.">
        <Input id="email" />
      </Field>,
    )
    const input = screen.getByLabelText(/Email/)
    expect(screen.getByText('We never share it.')).toHaveAttribute('id', 'email-hint')
    expect(input.getAttribute('aria-describedby')).toContain('email-hint')
    expect(input).toHaveAttribute('aria-required', 'true')
  })

  it('preserves an aria-describedby already set on the control', () => {
    render(
      <Field label="Bio" htmlFor="bio" error="Too long.">
        <Input id="bio" aria-describedby="counter" />
      </Field>,
    )
    const describedBy = screen.getByLabelText('Bio').getAttribute('aria-describedby') ?? ''
    expect(describedBy).toContain('counter')
    expect(describedBy).toContain('bio-error')
  })
})
