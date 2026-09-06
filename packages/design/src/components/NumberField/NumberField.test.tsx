import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Field } from '../Field/Field'
import { NumberField } from './NumberField'

describe('NumberField', () => {
  it('is a spinbutton, announced against its own range', async () => {
    render(<NumberField aria-label="Count" defaultValue={20} min={10} max={100} />)
    const box = screen.getByRole('spinbutton', { name: 'Count' })
    expect(box).toHaveAttribute('min', '10')
    expect(box).toHaveAttribute('max', '100')
  })

  it('takes its label from a Field, through the input inside it', async () => {
    // The root is a div, so the id has to reach the control rather than stop
    // at the wrapper — which is the failure this arrangement exists to avoid.
    render(
      <Field label="Line height">
        <NumberField defaultValue={1.5} min={1} max={3} step={0.1} />
      </Field>,
    )
    expect(screen.getByRole('spinbutton', { name: 'Line height' })).toBeInTheDocument()
  })

  it('reports what was typed while it is being typed, out of range and all', async () => {
    // A minimum of 10 would otherwise make 50 unreachable: the 5 is clamped up
    // before the 0 arrives.
    const user = userEvent.setup()
    const seen = vi.fn()
    render(<NumberField aria-label="Count" defaultValue={20} min={10} max={100} onValueChange={seen} />)

    const box = screen.getByRole('spinbutton', { name: 'Count' })
    await user.clear(box)
    await user.type(box, '5')

    expect(seen).toHaveBeenCalledWith(5)
  })

  it('reconciles it with the range and the step once the field is left', async () => {
    const user = userEvent.setup()
    render(<NumberField aria-label="Count" defaultValue={20} min={10} max={100} step={5} />)

    const box = screen.getByRole('spinbutton', { name: 'Count' })
    await user.clear(box)
    await user.type(box, '37')
    await user.tab()

    expect(box).toHaveValue(35)
  })

  it('clamps to the maximum the same way', async () => {
    const user = userEvent.setup()
    render(<NumberField aria-label="Count" defaultValue={20} min={10} max={100} />)

    const box = screen.getByRole('spinbutton', { name: 'Count' })
    await user.clear(box)
    await user.type(box, '400')
    await user.tab()

    expect(box).toHaveValue(100)
  })

  it('puts back the value the box was entered with when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<NumberField aria-label="Count" defaultValue={20} min={0} max={100} />)

    const box = screen.getByRole('spinbutton', { name: 'Count' })
    await user.click(box)
    await user.clear(box)
    await user.type(box, '99')
    await user.keyboard('{Escape}')

    expect(box).toHaveValue(20)
  })

  it('announces the unit as well as drawing it', async () => {
    // "300" with no dimension is a number, not a duration.
    render(<NumberField aria-label="Timeout" defaultValue={30} unit="s" />)
    expect(screen.getByRole('spinbutton', { name: 'Timeout' })).toHaveAccessibleDescription('s')
  })

  it('keeps the grip out of the accessibility tree', async () => {
    // It commits nothing a keyboard cannot already reach with the arrows, so
    // announcing it offers a reader a control that does nothing when pressed.
    const { container } = render(<NumberField aria-label="Count" defaultValue={1} />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('draws no grip when the scrub is turned off', async () => {
    const { container } = render(<NumberField aria-label="Count" defaultValue={1} scrub={false} />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('reflects an invalid state from either spelling', async () => {
    const { rerender } = render(<NumberField aria-label="Count" defaultValue={1} invalid />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true')

    rerender(<NumberField aria-label="Count" defaultValue={1} aria-invalid="true" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true')
  })
})
