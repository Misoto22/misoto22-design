'use client'

import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import { Calendar } from '../Calendar/Calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover'

export interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onValueChange?: (value: Date | undefined) => void
  /** Names the control. Required — the trigger's text is a value, not a label. */
  label: string
  placeholder?: string
  disabled?: boolean
  /** Days the reader may not choose. Passed straight to the calendar. */
  disabledDates?: React.ComponentProps<typeof Calendar>['disabled']
  /**
   * How the chosen date is printed on the trigger. Defaults to the visitor's
   * own locale — a fixed `dd/mm/yyyy` is ambiguous to half the world and wrong
   * for the other half.
   */
  format?: (date: Date) => string
  className?: string
}

const defaultFormat = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)

/**
 * A date, chosen from a calendar.
 *
 * A trigger and a `Calendar` in a `Popover` — not a new component so much as
 * the composition people otherwise assemble slightly differently on every
 * screen.
 *
 * It is deliberately NOT a text input with a calendar attached. A typed date
 * needs parsing, and parsing needs a format, and a format is a locale argument
 * nobody wins: `03/04` is March the fourth in one country and the third of
 * April in the next. When typing genuinely matters — a birth date, a long way
 * back — pair a plain `Input` with this rather than making this pretend.
 *
 * @example
 * <Field label="Publish on"><DatePicker label="Publish on" /></Field>
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder = 'Pick a date',
  disabled = false,
  disabledDates,
  format = defaultFormat,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [uncontrolled, setUncontrolled] = useState<Date | undefined>(defaultValue)
  const current = value ?? uncontrolled

  const choose = (next: Date | undefined) => {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
    if (next) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-(--radius) border border-(--rule-2) bg-(--paper) px-(--field-px) py-(--field-py) text-sm transition-colors duration-(--duration-fast) hover:border-(--rule-hard) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none',
          current ? 'text-(--ink)' : 'text-(--ink-3-aa)',
          className,
        )}
      >
        {current ? format(current) : placeholder}
        <CalendarDays size={14} strokeWidth={1.5} aria-hidden className="shrink-0 text-(--ink-3-aa)" />
      </PopoverTrigger>
      <PopoverContent label={label} align="start" className="w-auto p-0">
        <Calendar mode="single" selected={current} onSelect={choose} disabled={disabledDates} autoFocus />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
