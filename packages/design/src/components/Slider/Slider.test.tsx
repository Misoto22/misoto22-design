import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
