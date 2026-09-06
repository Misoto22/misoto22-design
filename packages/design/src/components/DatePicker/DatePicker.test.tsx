import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker, DateRangePicker } from './DatePicker'

const startOfToday = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

describe('DatePicker', () => {
  it('announces the printed date as well as the name', () => {
    // `format` is the only place the chosen date is written. A name that
    // replaces the trigger's text hides the whole answer.
    render(<DatePicker label="Publish on" defaultValue={new Date(2026, 0, 9)} format={() => '9 Jan 2026'} />)
    expect(screen.getByRole('button')).toHaveAccessibleName('Publish on 9 Jan 2026')
  })

  it('refuses a preset the calendar itself would refuse', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DatePicker
        label="Publish on"
        presets
        disabledDates={{ before: new Date(3000, 0, 1) }}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Publish on/ }))
    const today = await screen.findByRole('button', { name: 'Today' })
    expect(today).toBeDisabled()

    await user.click(today)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('leaves a reachable preset alone', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DatePicker label="Publish on" presets onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: /Publish on/ }))
    await user.click(await screen.findByRole('button', { name: 'Today' }))
    expect(onValueChange).toHaveBeenCalledOnce()
    expect(onValueChange.mock.calls[0][0].getDate()).toBe(startOfToday().getDate())
  })
})

describe('DateRangePicker', () => {
  it('announces the printed range as well as the name', () => {
    render(
      <DateRangePicker
        label="Reporting period"
        defaultValue={{ from: new Date(2026, 0, 1), to: new Date(2026, 0, 31) }}
        format={(date) => (date.getDate() === 1 ? 'start' : 'end')}
      />,
    )
    expect(screen.getByRole('button', { name: /Reporting period/ })).toHaveAccessibleName(
      'Reporting period start – end',
    )
  })

  it('refuses a preset whose ends the calendar refuses', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        label="Reporting period"
        disabledDates={{ before: new Date(3000, 0, 1) }}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Reporting period/ }))
    expect(await screen.findByRole('button', { name: 'Last 7 days' })).toBeDisabled()
  })
})
