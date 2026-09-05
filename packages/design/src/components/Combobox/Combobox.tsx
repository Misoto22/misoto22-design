'use client'

import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../Command/Command'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover'

export interface ComboboxOption {
  value: string
  label: string
  /** Extra text matched by the filter but not shown as the label. */
  keywords?: string[]
  disabled?: boolean
}

interface CommonProps {
  options: ComboboxOption[]
  /** Names the control. Required — the trigger's text is a value, not a label. */
  label: string
  /** Shown on the trigger when nothing is chosen. */
  placeholder?: string
  /** Placeholder inside the filter field. */
  searchPlaceholder?: string
  /** Shown when the filter matches nothing. Say what WOULD match. */
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

interface SingleProps extends CommonProps {
  multiple?: false
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

interface MultipleProps extends CommonProps {
  /**
   * Several at once. The trigger then summarises the choice rather than naming
   * it — "3 selected" past a threshold, because a trigger that grows with its
   * value reflows the form every time someone picks another one.
   */
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ComboboxProps = SingleProps | MultipleProps

/** How many labels the trigger prints before it starts counting instead. */
const SUMMARISE_AFTER = 2

/**
 * A select you can type into, choosing one or several.
 *
 * The line against `Select` is length, and it is not a matter of taste: a
 * styled select is better up to roughly a dozen options, because a list nobody
 * can filter is faster to scan than one they have to think about. Past that,
 * this is the right answer.
 *
 * Filtering, the highlighted row and the arrow keys come from cmdk, which
 * implements the ARIA combobox pattern properly: the highlight moves through
 * `aria-activedescendant` while focus stays in the input. Hand-rolled comboboxes
 * move focus into the list instead, and the typed text stops being editable.
 *
 * Controlled or uncontrolled, like every other form control here.
 *
 * @example
 * <Combobox label="Framework" options={FRAMEWORKS} placeholder="Pick one" />
 * @example
 * <Combobox multiple label="Tags" options={TAGS} />
 */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    label,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyMessage = 'Nothing matches.',
    disabled = false,
    className,
  } = props
  const multiple = props.multiple === true

  const [open, setOpen] = useState(false)
  const [uncontrolled, setUncontrolled] = useState<string[]>(() => {
    if (props.multiple === true) return props.defaultValue ?? []
    return props.defaultValue ? [props.defaultValue] : []
  })

  const controlled =
    props.multiple === true
      ? props.value
      : props.value === undefined
        ? undefined
        : props.value === ''
          ? []
          : [props.value]
  const current = controlled ?? uncontrolled

  const commit = (next: string[]) => {
    if (controlled === undefined) setUncontrolled(next)
    if (props.multiple === true) props.onValueChange?.(next)
    else props.onValueChange?.(next[0] ?? '')
  }

  const choose = (option: string) => {
    if (multiple) {
      // Toggling, and the panel stays open — picking three things should not
      // cost three round trips through the trigger.
      commit(current.includes(option) ? current.filter((v) => v !== option) : [...current, option])
      return
    }
    // Choosing the selected option again clears it, which is what a reader
    // expects from a control whose value is optional.
    commit(current.includes(option) ? [] : [option])
    setOpen(false)
  }

  const chosen = options.filter((option) => current.includes(option.value))
  const summary =
    chosen.length === 0
      ? placeholder
      : chosen.length <= SUMMARISE_AFTER
        ? chosen.map((option) => option.label).join(', ')
        : `${chosen.length} selected`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        // A combobox trigger is a button that OPENS a listbox; the roles for
        // the list itself belong to cmdk inside the panel.
        role="combobox"
        aria-expanded={open}
        aria-label={label}
        disabled={disabled}
        className={cn(
          'group flex w-full items-center justify-between gap-2 rounded-(--radius) border border-(--rule-2) bg-(--paper) px-(--field-px) py-(--field-py) text-start text-sm transition-colors duration-(--duration-fast) hover:border-(--rule-hard) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none',
          chosen.length > 0 ? 'text-(--ink)' : 'text-(--ink-3-aa)',
          className,
        )}
      >
        <span className="truncate">{summary}</span>
        <span className="flex shrink-0 items-center gap-1">
          {multiple && chosen.length > 0 && (
            // A `<span role="button">` rather than a nested `<button>`, which
            // is invalid inside the trigger and which browsers reparent — the
            // clear control then falls outside the field entirely.
            <span
              role="button"
              tabIndex={0}
              aria-label={`Clear ${label}`}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                commit([])
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                event.stopPropagation()
                commit([])
              }}
              className="grid size-5 cursor-pointer place-items-center rounded-full text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)"
            >
              <X size={12} strokeWidth={2} aria-hidden />
            </span>
          )}
          <ChevronsUpDown size={14} strokeWidth={1.5} aria-hidden className="text-(--ink-3-aa)" />
        </span>
      </PopoverTrigger>
      <PopoverContent
        label={label}
        // `overflow-hidden` so the panel's own corners clip the square-cornered
        // command list inside it; without it the list's edges poked through the
        // radius and the two bottom corners looked chipped.
        className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
        align="start"
      >
        <Command label={`${label}: ${searchPlaceholder}`} className="rounded-none border-0">
          {/* The panel's own name is "<label>: <placeholder>", set on Command
              above. cmdk points the input's aria-labelledby at it, and
              aria-labelledby beats aria-label — so naming the input directly
              did nothing, and a screen reader met two comboboxes called "Tags",
              one inside the other. */}
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const selected = current.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, ...(option.keywords ?? [])]}
                    disabled={option.disabled}
                    onSelect={choose}
                    aria-selected={selected}
                  >
                    <span
                      className={cn(
                        'grid size-4 shrink-0 place-items-center transition-opacity duration-(--duration-fast)',
                        multiple &&
                          'rounded-(--radius-sm) border border-(--rule-2) text-(--accent-foreground) data-[on=true]:border-(--accent) data-[on=true]:bg-(--accent)',
                      )}
                      data-on={selected}
                    >
                      <Check
                        size={12}
                        strokeWidth={2.5}
                        aria-hidden
                        className={selected ? 'opacity-100' : 'opacity-0'}
                      />
                    </span>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default Combobox
