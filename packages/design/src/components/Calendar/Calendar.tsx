'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { cn } from '../../lib/cn'

export type CalendarProps = DayPickerProps

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
 * nothing here depends on a CSS file this package does not control.
 *
 * @example
 * <Calendar mode="single" selected={date} onSelect={setDate} />
 */
export function Calendar({ className, classNames, captionLayout, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      // Month and year as dropdowns, not two arrows. Stepping a month at a time
      // is fine for "next Tuesday" and useless for a birth date — twenty-four
      // clicks to reach two years ago is not a navigation model, it is a
      // penalty. The arrows stay for the common short hop.
      captionLayout={captionLayout ?? 'dropdown'}
      startMonth={props.startMonth ?? new Date(new Date().getFullYear() - 100, 0)}
      endMonth={props.endMonth ?? new Date(new Date().getFullYear() + 10, 11)}
      className={cn('w-fit p-3', className)}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === 'left' ? (
            <ChevronLeft size={16} strokeWidth={1.5} aria-hidden {...rest} />
          ) : (
            <ChevronRight size={16} strokeWidth={1.5} aria-hidden {...rest} />
          ),
      }}
      classNames={{
        // The nav renders BEFORE the months in the DOM, so left in the flow it
        // stacks its two arrows above the grid. Taking it out of the flow puts
        // them where they belong — one at each end of the caption — without
        // reordering anything a screen reader walks.
        // `rdp-root` is kept deliberately. Passing a class for a slot REPLACES
        // the library's own, so overriding `root` silently removed the hook
        // that every `.rdp-*` selector — ours and a consumer's — depends on.
        root: 'rdp-root relative',
        nav: 'absolute inset-x-3 top-3 z-1 flex items-center justify-between',
        months: 'flex flex-col gap-4 sm:flex-row',
        month: 'flex flex-col gap-3',
        month_caption: 'flex h-9 items-center justify-center',
        // The dropdown layout renders a real <select> under a label; the select
        // is transparent and stretched over the label so the platform picker
        // opens where the words are.
        // The real <select> is stretched invisibly over its own label, so the
        // platform picker opens exactly where the words are and the words stay
        // ours. `z-2` clears the nav above.
        dropdowns: 'flex items-center gap-1.5',
        dropdown_root:
          'relative inline-flex items-center rounded-(--radius-sm) px-1.5 transition-colors duration-(--duration-fast) hover:bg-(--stone)',
        dropdown: 'absolute inset-0 z-2 cursor-pointer opacity-0 [&::-ms-expand]:hidden',
        caption_label:
          'inline-flex items-center gap-0.5 font-heading text-[length:var(--fs-item)] font-normal text-(--ink) [&>svg]:size-4 [&>svg]:text-(--ink-3-aa)',
        button_previous:
          'inline-flex size-9 items-center justify-center rounded-(--radius-pill) text-(--ink-2) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink) disabled:opacity-(--disabled-opacity)',
        button_next:
          'inline-flex size-9 items-center justify-center rounded-(--radius-pill) text-(--ink-2) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink) disabled:opacity-(--disabled-opacity)',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 mono-meta font-normal text-(--ink-3-aa)',
        week: 'mt-1 flex w-full',
        day: 'p-0 text-center',
        day_button:
          'inline-flex size-9 items-center justify-center rounded-(--radius-pill) text-sm text-(--ink-2) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)',
        // Filled ink, matching every other "selected" in the system.
        selected: '[&>button]:bg-(--accent) [&>button]:text-(--accent-foreground) [&>button:hover]:bg-(--accent)',
        // Today is an outline, not a fill — it is a fact about the calendar,
        // not a choice the reader made, and the two must not look alike.
        today: '[&>button]:ring-1 [&>button]:ring-(--rule-hard) [&>button]:ring-inset',
        // The AA floor, not the rule colour: a day from the neighbouring month
        // is still a date someone has to read, and --rule-2 on paper is 1.38:1.
        // The distinction from an in-month day survives at one step lighter.
        outside: '[&>button]:text-(--ink-3-aa)',
        disabled: '[&>button]:opacity-(--disabled-opacity) [&>button]:pointer-events-none',
        range_middle: '[&>button]:rounded-none [&>button]:bg-(--stone) [&>button]:text-(--ink)',
        range_start: '[&>button]:rounded-e-none',
        range_end: '[&>button]:rounded-s-none',
        hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  )
}

export default Calendar
