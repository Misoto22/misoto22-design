'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
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

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
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

/**
 * A select you can type into.
 *
 * The line against `Select` is length, and it is not a matter of taste: a
 * native select is better up to roughly a dozen options — it gets the platform
 * picker on a phone, typeahead for free, and no JavaScript. Past that, scanning
 * a list nobody can filter is the worse experience, and this becomes the right
 * answer.
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
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'Nothing matches.',
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? '')
  const current = value ?? uncontrolled
  const selected = options.find((option) => option.value === current)

  const choose = (next: string) => {
    // Choosing the selected option again clears it, which is what a reader
    // expects from a control whose value is optional.
    const resolved = next === current ? '' : next
    if (value === undefined) setUncontrolled(resolved)
    onValueChange?.(resolved)
    setOpen(false)
  }

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
          'flex w-full items-center justify-between gap-2 rounded-(--radius) border border-(--rule-2) bg-(--paper) px-(--field-px) py-(--field-py) text-sm transition-colors duration-(--duration-fast) hover:border-(--rule-hard) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none',
          selected ? 'text-(--ink)' : 'text-(--ink-3-aa)',
          className,
        )}
      >
        {selected?.label ?? placeholder}
        <ChevronsUpDown size={14} strokeWidth={1.5} aria-hidden className="shrink-0 text-(--ink-3-aa)" />
      </PopoverTrigger>
      <PopoverContent
        label={label}
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command label={label} className="rounded-none border-0">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label, ...(option.keywords ?? [])]}
                  disabled={option.disabled}
                  onSelect={choose}
                >
                  <Check
                    size={14}
                    strokeWidth={2}
                    aria-hidden
                    className={cn(
                      'shrink-0 transition-opacity',
                      option.value === current ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default Combobox
