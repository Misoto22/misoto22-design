import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Slider } from './Slider'

describe('Slider', () => {
  it('renders a thumb when given neither value nor defaultValue', () => {
    // The plainest possible usage. The thumbs come from this component's own
    // array, so an empty one is a track with nothing on it to drag.
    render(<Slider label="Volume" />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('starts that thumb at the minimum, as the primitive would', () => {
    render(<Slider label="Volume" min={10} max={50} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '10')
  })

  it('dims when disabled', () => {
    // The thumb is a <span>; a `disabled:` variant compiles to `&:disabled`
    // and never matches one, so the control was drawn exactly like a live one.
    const { container } = render(<Slider label="Volume" defaultValue={[40]} disabled />)
    expect(container.firstElementChild?.className).toContain('opacity-(--disabled-opacity)')
  })

  it('does not dim when it is live', () => {
    const { container } = render(<Slider label="Volume" defaultValue={[40]} />)
    expect(container.firstElementChild?.className).not.toContain('opacity-(--disabled-opacity)')
  })

  it('announces the formatted value, not the bare number', () => {
    render(<Slider label="Budget" defaultValue={[1200]} max={2000} format={(n) => `$${n}`} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '$1200')
  })

  it('leaves the value to the platform when nothing formats it', () => {
    render(<Slider label="Budget" defaultValue={[1200]} max={2000} />)
    expect(screen.getByRole('slider')).not.toHaveAttribute('aria-valuetext')
  })

  it('prints both names above a two-thumb range', () => {
    render(<Slider label={['Minimum', 'Maximum']} defaultValue={[10, 90]} showValue />)
    expect(screen.getByText('Minimum – Maximum')).toBeInTheDocument()
    expect(screen.getByText('10 – 90')).toBeInTheDocument()
  })

  it('prints the one name it was given over a one-thumb slider', () => {
    render(<Slider label="Quality" defaultValue={[80]} showValue />)
    expect(screen.getByText('Quality')).toBeInTheDocument()
  })
  it('shows the readout when only editable was asked for', () => {
    // The box IS the readout, so asking for one without the other is asking
    // for a control with nowhere to put the number.
    render(<Slider label="Quality" defaultValue={[80]} editable />)
    expect(screen.getByRole('textbox', { name: 'Quality, exact value' })).toHaveValue('80')
  })

  it('shows the formatted value at rest and the bare number on focus', async () => {
    const user = userEvent.setup()
    render(<Slider label="Budget" defaultValue={[1200]} max={5000} editable format={(n) => `$${n}`} />)

    const box = screen.getByRole('textbox', { name: 'Budget, exact value' })
    expect(box).toHaveValue('$1200')

    await user.click(box)
    expect(box).toHaveValue('1200')
  })

  it('names the box apart from the thumb it drives', () => {
    // Both carry the same value. Named identically, a screen reader user meets
    // the same control twice and cannot tell which one they are on.
    render(<Slider label="Quality" defaultValue={[80]} editable />)
    expect(screen.getByRole('slider', { name: 'Quality' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Quality, exact value' })).toBeInTheDocument()
  })

  it('snaps a typed number to the step and moves the thumb', async () => {
    const user = userEvent.setup()
    render(<Slider label="Quality" defaultValue={[80]} max={100} step={5} editable />)

    const box = screen.getByRole('textbox', { name: 'Quality, exact value' })
    await user.clear(box)
    await user.type(box, '37')
    await user.tab()

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '35')
  })

  it('holds a typed value inside the neighbouring thumb', async () => {
    // Radix keeps a dragged thumb on its own side; a typed one would otherwise
    // cross over and hand the primitive an unsorted array.
    const user = userEvent.setup()
    render(<Slider label={['Minimum', 'Maximum']} defaultValue={[20, 70]} max={100} editable />)

    const lower = screen.getByRole('textbox', { name: 'Minimum, exact value' })
    await user.clear(lower)
    await user.type(lower, '90')
    await user.tab()

    expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '70')
  })

  it('abandons the edit on Escape without committing it', async () => {
    const user = userEvent.setup()
    render(<Slider label="Quality" defaultValue={[80]} max={100} editable />)

    const box = screen.getByRole('textbox', { name: 'Quality, exact value' })
    await user.clear(box)
    await user.type(box, '10')
    await user.keyboard('{Escape}')

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '80')
    expect(box).toHaveValue('80')
  })

  it('keeps the box out of reach when the slider is disabled', () => {
    // The wrapper's `pointer-events-none` is nothing to a keyboard, so without
    // this the one editable part of a dead control stays live.
    render(<Slider label="Quality" defaultValue={[80]} editable disabled />)
    expect(screen.getByRole('textbox', { name: 'Quality, exact value' })).toBeDisabled()
  })
})
