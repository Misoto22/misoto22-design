'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type DayPickerProps, type DropdownProps } from 'react-day-picker'
import { cn } from '../../lib/cn'
import { Select, SelectItem } from '../Select/Select'

export type CalendarProps = DayPickerProps

/**
 * Month and year, as the system's own `Select`.
 *
 * The library renders a native `<select>` here. Two problems with that: the
 * option list is drawn by the operating system, so it carries none of these
 * tokens and looks like a different product the moment it opens; and with a
 * wide year range it becomes a hundred-row list the platform renders as one
 * enormous column.
 *
 * The adapter is the small awkward part — the library hands back a native
 * change event, so a value from our Select is wrapped to look like one. That is
 * contained here rather than leaking into every call site.
 */
function CalendarDropdown({ options, value, onChange, 'aria-label': label }: DropdownProps) {
  return (
    <Select
      label={label ?? 'Select'}
      value={value === undefined ? undefined : String(value)}
      onValueChange={(next) =>
        onChange?.({ target: { value: next } } as React.ChangeEvent<HTMLSelectElement>)
      }
      // A third of the calendar's height. The default list is as tall as the
      // month grid, so opening the year picker blotted out the thing the reader
      // opened it in order to change.
      contentClassName="max-h-[10rem]"
      className="h-8 w-auto min-w-24 gap-1.5 border-transparent px-2 py-1 font-heading text-[length:var(--fs-item)] hover:border-(--rule-2)"
    >
      {(options ?? []).map((option) => (
        <SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  )
}

/** Ten years either side of now — see the note on `startMonth` below. */
const DEFAULT_SPAN = 10

/**
 * A month, as a grid of days.
 *
 * Wraps react-day-picker rather than building a calendar, and the reason is the
 * long tail: a month grid is easy, and everything around it is not — the
 * keyboard contract (arrows move a day, Page moves a month, Home and End reach
 * the week's ends), the `aria-live` announcement when the month changes, week
 * numbering, the first day of the week varying by locale, and the fact that
 * "today" and "selected" are different states a screen reader must hear apart.
 *
 * Every class is replaced rather than layered over the library's stylesheet, so
 * nothing here depends on a CSS file this package does not control — but the
 * library's OWN class is kept on each slot, because passing a class REPLACES it
 * and every `.rdp-*` selector downstream depends on those.
 *
 * @example
 * <Calendar mode="single" selected={date} onSelect={setDate} />
 * @example
 * // A birth date: widen the years, since the default span is deliberately short.
 * <Calendar mode="single" startMonth={new Date(1920, 0)} endMonth={new Date()} />
 */
export function Calendar({ className, classNames, captionLayout, components, ...props }: CalendarProps) {
  const now = new Date()

  /**
   * A one-day range is marked start AND end AND middle, all three.
   *
   * That is what made the earlier arrangement collapse: `range_middle` cleared
   * the button's fill so a middle day would not look chosen, and on a one-day
   * range that same rule cleared the fill of the only day there was. Deciding
   * by mode instead of fighting it with `!important` means the two never
   * describe the same button — in a range the fill belongs to the ends, and in
   * single mode it belongs to `selected`.
   */
  const isRange = props.mode === 'range'
  const FILL =
    '[&>button]:bg-(--accent) [&>button]:text-(--accent-foreground) [&>button:hover]:bg-(--accent) [&>button:hover]:text-(--accent-foreground)'

  return (
    <DayPicker
      showOutsideDays
      // Month and year as dropdowns, not two arrows. Stepping a month at a time
      // is fine for "next Tuesday" and useless for a date two years back.
      captionLayout={captionLayout ?? 'dropdown'}
      // Ten years either side, NOT a century. A hundred-and-eleven-row year
      // list is a scroll, not a choice — and the case that needs one (a birth
      // date) is rare enough to ask for it explicitly. Both ends are props, so
      // widening is one line at the call site.
      startMonth={props.startMonth ?? new Date(now.getFullYear() - DEFAULT_SPAN, 0)}
      endMonth={props.endMonth ?? new Date(now.getFullYear() + DEFAULT_SPAN, 11)}
      className={cn('w-fit p-3', className)}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === 'left' ? (
            <ChevronLeft size={16} strokeWidth={1.5} aria-hidden {...rest} />
          ) : (
            <ChevronRight size={16} strokeWidth={1.5} aria-hidden {...rest} />
          ),
        Dropdown: CalendarDropdown,
        ...components,
      }}
      classNames={{
        // `rdp-root` is kept deliberately. Passing a class for a slot REPLACES
        // the library's own, so overriding `root` silently removed the hook
        // that every `.rdp-*` selector — ours and a consumer's — depends on.
        root: 'rdp-root relative',
        // The nav renders BEFORE the months in the DOM, so left in the flow it
        // stacks its two arrows above the grid. Taking it out of the flow puts
        // them where they belong — one at each end of the caption.
        nav: 'absolute inset-x-3 top-3 z-1 flex items-center justify-between',
        months: 'flex flex-col gap-4 sm:flex-row',
        month: 'flex flex-col gap-3',
        month_caption: 'flex h-9 items-center justify-center',
        dropdowns: 'flex items-center gap-1',
        dropdown_root: 'relative inline-flex items-center',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 mono-meta font-normal text-(--ink-3-aa)',
        week: 'mt-1 flex w-full',
        // The band lives on the CELL and the mark lives on the BUTTON. Keeping
        // them apart is what lets a range be one continuous wash while both of
        // its ends stay round — the previous arrangement flattened the corners
        // of whichever day was an end, and a one-day range is BOTH ends, so it
        // came out as a square.
        day: 'relative p-0 text-center',
        day_button:
          'relative z-1 inline-flex size-9 items-center justify-center rounded-(--radius-pill) text-sm text-(--ink-2) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)',
        selected: isRange ? '' : FILL,
        // Today is an outline, not a fill — it is a fact about the calendar,
        // not a choice the reader made, and the two must not look alike.
        today: '[&>button]:ring-1 [&>button]:ring-(--rule-hard) [&>button]:ring-inset',
        outside: '[&>button]:text-(--ink-3-aa)',
        disabled: '[&>button]:opacity-(--disabled-opacity) [&>button]:pointer-events-none',
        // The wash lives on the CELL and the mark on the BUTTON, which is what
        // lets a range read as one continuous band while both of its ends stay
        // round. A middle day gets the wash and no fill; the ends get both.
        range_middle: 'bg-(--accent-muted) [&>button]:text-(--ink) [&>button:hover]:bg-(--stone)',
        range_start: cn('bg-(--accent-muted) rounded-s-(--radius-pill)', FILL),
        range_end: cn('bg-(--accent-muted) rounded-e-(--radius-pill)', FILL),
        hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  )
}

export default Calendar
