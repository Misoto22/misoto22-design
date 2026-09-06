import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '../Field/Field'
import { ColorPicker } from './ColorPicker'

const open = async (name = /brand colour/i) => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name }))
  return user
}

describe('ColorPicker', () => {
  it('announces the name and the value, not one or the other', () => {
    // Named only by the label, a reader is told the noun and never the answer;
    // named only by the value, they are told an answer to no question.
    render(<ColorPicker label="Brand colour" defaultValue="#a78bfa" />)
    expect(screen.getByRole('button', { name: 'Brand colour #a78bfa' })).toBeInTheDocument()
  })

  it('takes its name from a Field, which a button label binds to', () => {
    render(
      <Field label="Brand colour">
        <ColorPicker label="Brand colour" defaultValue="#a78bfa" />
      </Field>,
    )
    expect(screen.getByRole('button', { name: /brand colour/i })).toBeInTheDocument()
  })

  it('gives the plane two real sliders rather than a canvas with key handlers', async () => {
    // This is the part a 2D picker usually leaves out, and leaving it out makes
    // the control unusable rather than merely awkward.
    render(<ColorPicker label="Brand colour" defaultValue="#a78bfa" />)
    await open()

    expect(screen.getByRole('slider', { name: 'Chroma' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Lightness' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Hue' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Opacity' })).toBeInTheDocument()
  })

  it('says what each axis reading means', async () => {
    // "212" on a hue slider is not a reading anybody can act on.
    render(<ColorPicker label="Brand colour" defaultValue="#a78bfa" />)
    await open()

    expect(screen.getByRole('slider', { name: 'Hue' })).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('degrees'),
    )
    expect(screen.getByRole('slider', { name: 'Lightness' })).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('percent lightness'),
    )
  })

  it('accepts a colour typed as CSS', async () => {
    const seen = vi.fn()
    render(<ColorPicker label="Brand colour" defaultValue="#a78bfa" onValueChange={seen} />)
    const user = await open()

    const box = screen.getByRole('textbox', { name: 'Brand colour as CSS' })
    await user.clear(box)
    await user.type(box, '#ff0000')

    expect(seen).toHaveBeenLastCalledWith('#ff0000')
  })

  it('marks the box invalid rather than swallowing a string that is not a colour', async () => {
    render(<ColorPicker label="Brand colour" defaultValue="#a78bfa" />)
    const user = await open()

    const box = screen.getByRole('textbox', { name: 'Brand colour as CSS' })
    await user.clear(box)
    await user.type(box, 'rebeccapurple')

    expect(box).toHaveAttribute('aria-invalid', 'true')
  })

  it('emits in the notation the strip is set to', async () => {
    const seen = vi.fn()
    render(<ColorPicker label="Brand colour" defaultValue="#a78bfa" onValueChange={seen} />)
    const user = await open()

    await user.click(screen.getByRole('radio', { name: 'OKLCH' }))

    expect(seen).toHaveBeenCalledWith(expect.stringMatching(/^oklch\(/))
  })

  it('keeps writing in the notation it was given', async () => {
    const seen = vi.fn()
    render(<ColorPicker label="Brand colour" defaultValue="#a78bfa" onValueChange={seen} />)
    await open()

    // fireEvent rather than userEvent: a native range has no keyboard
    // behaviour in jsdom, so an arrow key there moves nothing to observe.
    fireEvent.change(screen.getByRole('slider', { name: 'Hue' }), { target: { value: '120' } })

    expect(seen).toHaveBeenCalledWith(expect.stringMatching(/^#/))
  })

  it('does not lose the hue when the colour goes grey', async () => {
    // A grey has no hue, only the angle of its rounding error. Read back from
    // the value, the strip would spin as the handle crossed the neutral column.
    render(<ColorPicker label="Brand colour" defaultValue="oklch(0.7 0.15 240)" />)
    await open()

    fireEvent.change(screen.getByRole('slider', { name: 'Chroma' }), { target: { value: '0' } })

    expect(screen.getByRole('slider', { name: 'Hue' })).toHaveValue('240')
  })
})
