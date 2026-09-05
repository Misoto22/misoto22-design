'use client'

import { CalendarDays } from 'lucide-react'
import { useRef, useState, type ComponentProps } from 'react'
import type { DateRange } from 'react-day-picker'
import { cn } from '../../lib/cn'
import { Calendar } from '../Calendar/Calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover'

export type { DateRange }

const TRIGGER =
  'flex w-full items-center justify-between gap-2 rounded-(--radius) border border-(--rule-2) bg-(--paper) px-(--field-px) py-(--field-py) text-start text-sm transition-colors duration-(--duration-fast) hover:border-(--rule-hard) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none'

/**
 * The visitor's own locale, not a fixed `dd/mm/yyyy`.
 *
 * `03/04` is March the fourth in one country and the third of April in the
 * next, and there is no format that is unambiguous to everyone. `Intl` already
 * knows which one this reader expects.
 */
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)

export interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onValueChange?: (value: Date | undefined) => void
  /** Names the control. Required — the trigger's text is a value, not a label. */
  label: string
  placeholder?: string
  disabled?: boolean
  /** Days the reader may not choose. Passed straight to the calendar. */
  disabledDates?: ComponentProps<typeof Calendar>['disabled']
  /** How the chosen date is printed on the trigger. */
  format?: (date: Date) => string
  className?: string
}

/**
 * A date, chosen from a calendar.
 *
 * A trigger and a `Calendar` in a `Popover` — not a new component so much as
 * the composition people otherwise assemble slightly differently on every
 * screen.
 *
 * It is deliberately NOT a text input with a calendar attached. A typed date
 * needs parsing, and parsing needs a format, and a format is a locale argument
 * nobody wins. When typing genuinely matters — a birth date, a long way back —
 * the calendar's month and year are dropdowns, which is the same journey
 * without the ambiguity.
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
  format = formatDate,
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
        className={cn(TRIGGER, current ? 'text-(--ink)' : 'text-(--ink-3-aa)', className)}
      >
        {current ? format(current) : placeholder}
        <CalendarDays size={14} strokeWidth={1.5} aria-hidden className="shrink-0 text-(--ink-3-aa)" />
      </PopoverTrigger>
      <PopoverContent label={label} align="start" className="w-auto overflow-hidden p-0">
        <Calendar mode="single" selected={current} onSelect={choose} disabled={disabledDates} autoFocus />
      </PopoverContent>
    </Popover>
  )
}

export interface DateRangePickerProps {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange | undefined) => void
  label: string
  placeholder?: string
  disabled?: boolean
  disabledDates?: ComponentProps<typeof Calendar>['disabled']
  /** How many months are shown side by side. Falls back to one under `sm`. */
  months?: number
  format?: (date: Date) => string
  className?: string
}

/**
 * A span of dates — a stay, a reporting period, a filter.
 *
 * Two months side by side, because a range that crosses a month boundary is the
 * common case, and paging back and forth to see both ends is what makes a range
 * picker tiring. They stack under `sm`, where two would not fit — the calendar's
 * own `months` class already carries that, so there is nothing to override.
 *
 * The panel stays open until both ends are chosen: a range is not a value until
 * it has a second date, and closing on the first one would mean re-opening to
 * finish.
 *
 * @example
 * <DateRangePicker label="Reporting period" />
 */
export function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder = 'Pick a range',
  disabled = false,
  disabledDates,
  months = 2,
  format = formatDate,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [uncontrolled, setUncontrolled] = useState<DateRange | undefined>(defaultValue)
  const current = value ?? uncontrolled

  /**
   * How many days have been clicked since the panel opened.
   *
   * Counted, rather than inferred from the range being "complete", because the
   * first click returns `{ from: day, to: day }` — a complete range by any
   * reading of the value. Closing on that meant every attempt at a range
   * produced a one-day one and shut the panel, which is the opposite of what a
   * range picker is for.
   */
  const clicks = useRef(0)

  const choose = (next: DateRange | undefined) => {
    clicks.current += 1
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
    if (clicks.current >= 2 && next?.from && next.to) setOpen(false)
  }

  const setPanel = (next: boolean) => {
    if (next) clicks.current = 0
    setOpen(next)
  }

  const complete = current?.from && current.to && current.from.getTime() !== current.to.getTime()
  const printed = current?.from
    ? complete
      ? `${format(current.from)} – ${format(current.to!)}`
      : `${format(current.from)} – …`
    : placeholder

  return (
    <Popover open={open} onOpenChange={setPanel}>
      <PopoverTrigger
        aria-label={label}
        disabled={disabled}
        className={cn(TRIGGER, current?.from ? 'text-(--ink)' : 'text-(--ink-3-aa)', className)}
      >
        <span className="truncate">{printed}</span>
        <CalendarDays size={14} strokeWidth={1.5} aria-hidden className="shrink-0 text-(--ink-3-aa)" />
      </PopoverTrigger>
      <PopoverContent label={label} align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          mode="range"
          selected={current}
          onSelect={choose}
          disabled={disabledDates}
          numberOfMonths={months}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
