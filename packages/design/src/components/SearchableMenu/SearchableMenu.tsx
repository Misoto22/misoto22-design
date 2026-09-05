'use client'

import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../Command/Command'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover'

export interface MenuAction {
  /** Stable id, and what the filter matches on. */
  id: string
  label: ReactNode
  /** Plain text the filter should match beyond the label. */
  keywords?: string[]
  /** Printed at the end of the row. */
  shortcut?: string
  /** Optional group heading. Rows with the same value are shown together. */
  group?: string
  disabled?: boolean
  destructive?: boolean
  onSelect: () => void
}

export interface SearchableMenuProps {
  actions: MenuAction[]
  /** The trigger's text. */
  children: ReactNode
  /** Names the menu for assistive tech. */
  label: string
  searchPlaceholder?: string
  emptyMessage?: string
  align?: 'start' | 'center' | 'end'
  className?: string
}

/**
 * A menu of actions you can type into.
 *
 * The fourth corner of a square the system otherwise had three of, and the
 * distinction is worth stating because reaching for the wrong one is easy:
 *
 * | | few options | many options |
 * |---|---|---|
 * | **sets a value** | `Select` | `Combobox` |
 * | **runs an action** | `DropdownMenu` | `SearchableMenu` |
 *
 * A `DropdownMenu` past about a dozen rows stops being scannable, and the
 * usual response — nesting submenus — makes it worse. This is the same list
 * with a filter over it.
 *
 * Not the same thing as `Command`: that is a page-level palette, usually modal
 * and usually bound to ⌘K. This is anchored to a control, like the menu it
 * replaces.
 *
 * The rows are `option`s inside a listbox rather than `menuitem`s, because that
 * is what the filtering pattern requires — the highlight moves through
 * `aria-activedescendant` while focus stays in the input, and a menu cannot do
 * that. The trade is deliberate: a menu that cannot be filtered is worse for
 * the reader than a listbox that runs actions.
 *
 * @example
 * <SearchableMenu label="Actions" actions={ACTIONS}>Actions</SearchableMenu>
 */
export function SearchableMenu({
  actions,
  children,
  label,
  searchPlaceholder = 'Filter…',
  emptyMessage = 'Nothing matches.',
  align = 'start',
  className,
}: SearchableMenuProps) {
  const [open, setOpen] = useState(false)

  // Grouped in declaration order, so a caller controls the arrangement by the
  // order they list actions rather than by an extra prop.
  const groups: { name: string | undefined; items: MenuAction[] }[] = []
  for (const action of actions) {
    const last = groups.at(-1)
    if (last && last.name === action.group) last.items.push(action)
    else groups.push({ name: action.group, items: [action] })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          'inline-flex min-h-(--control-h-sm) items-center gap-2 rounded-(--radius-pill) border border-(--rule-2) px-4 text-sm text-(--ink) transition-colors duration-(--duration-fast) hover:border-(--ink)',
          className,
        )}
      >
        {children}
        <ChevronDown size={14} strokeWidth={1.5} aria-hidden className="shrink-0 text-(--ink-3-aa)" />
      </PopoverTrigger>
      <PopoverContent label={label} align={align} className="w-64 overflow-hidden p-0">
        <Command label={`${label}: ${searchPlaceholder}`} className="rounded-none border-0">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {groups.map((group, index) => (
              <div key={group.name ?? index}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={group.name}>
                  {group.items.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      keywords={action.keywords}
                      disabled={action.disabled}
                      shortcut={action.shortcut}
                      onSelect={() => {
                        setOpen(false)
                        action.onSelect()
                      }}
                      className={action.destructive ? 'text-(--danger)' : undefined}
                    >
                      {action.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default SearchableMenu
