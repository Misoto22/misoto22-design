'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useOverlayContainer } from '../../lib/overlay-container'
import { CONTROL_BASE, CONTROL_BORDER, isInvalid } from '../../lib/control'

/** Radix Select root, group and label, as typed passthroughs. */
export const SelectRoot = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group

export interface SelectProps extends ComponentProps<typeof SelectPrimitive.Root> {
  /** Names the control. Required — the trigger shows a value, and a value is not a name. */
  label: string
  placeholder?: string
  /** Paints the resting border with `--danger` and reflects `aria-invalid`. */
  invalid?: boolean
  disabled?: boolean
  className?: string
  /** `SelectItem`s, optionally wrapped in `SelectGroup` with a `SelectLabel`. */
  children: ReactNode
}

/**
 * A choice from a list, styled the whole way down.
 *
 * The option list is ours — drawn from the same tokens as everything else, so
 * it does not change typeface, spacing and selection colour the moment it
 * opens. That is the whole reason this replaced the native control as the
 * default: a design system whose most common form control stops being part of
 * the system on click is not a design system, it is a stylesheet for closed
 * states.
 *
 * The keyboard contract is Radix's, which means it is the platform's: typeahead
 * works, the arrows move, Home and End reach the ends, and Escape closes
 * without choosing. That was the one genuine argument for staying native, and
 * it is answered.
 *
 * Past roughly a dozen options, reach for `Combobox` — a list nobody can filter
 * is worse than one they can type into. Where the platform picker is genuinely
 * better — a phone, or a form that must survive without JavaScript — reach for
 * `NativeSelect`.
 *
 * @example
 * <Field label="Region">
 *   <Select label="Region" defaultValue="au">
 *     <SelectItem value="au">Australia</SelectItem>
 *     <SelectItem value="nz">New Zealand</SelectItem>
 *   </Select>
 * </Field>
 */
export function Select({
  label,
  placeholder = 'Select…',
  invalid,
  disabled,
  className,
  children,
  ...props
}: SelectProps) {
  const bad = isInvalid(invalid)
  const container = useOverlayContainer()

  return (
    <SelectPrimitive.Root disabled={disabled} {...props}>
      <SelectPrimitive.Trigger
        aria-label={label}
        aria-invalid={bad || undefined}
        className={cn(
          CONTROL_BASE,
          'group flex cursor-pointer items-center justify-between gap-2 text-start data-[placeholder]:text-(--ink-3-aa)',
          bad ? CONTROL_BORDER.invalid : CONTROL_BORDER.resting,
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            aria-hidden
            className="shrink-0 text-(--ink-3-aa) transition-transform duration-(--duration-fast) group-data-[state=open]:rotate-180"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal container={container ?? undefined}>
        <SelectPrimitive.Content
        collisionBoundary={container ?? undefined}
        collisionPadding={8}
          position="popper"
          sideOffset={6}
          data-m22-animated
          className={cn(
            'z-(--z-dropdown) max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-(--radius) border border-(--rule-2) bg-(--paper)',
            'data-[state=open]:animate-[m22-panel-in_var(--duration-fast)_var(--ease)]',
          )}
        >
          <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-(--ink-3-aa)">
            <ChevronUp size={14} strokeWidth={1.5} aria-hidden />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-(--ink-3-aa)">
            <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>

/** One option. The tick marks the chosen one; the fill marks the highlighted one. */
export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-(--radius-sm) px-2.5 py-2 text-sm text-(--ink-2) outline-none transition-colors duration-(--duration-fast) data-[highlighted]:bg-(--stone) data-[highlighted]:text-(--ink) data-[disabled]:pointer-events-none data-[disabled]:opacity-(--disabled-opacity)',
        className,
      )}
      {...props}
    >
      {/* The box is always there and only the tick inside it appears, so
          choosing an option does not shunt every label sideways. */}
      <span className="grid size-3.5 shrink-0 place-items-center">
        <SelectPrimitive.ItemIndicator asChild>
          <Check size={14} strokeWidth={2} aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/**
 * Mono eyebrow heading for a group of options.
 *
 * Must sit inside a `SelectGroup` — Radix throws otherwise, because a heading
 * with no group is a heading for nothing, and assistive tech would announce it
 * as an option.
 */
export function SelectLabel({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-2.5 py-1.5 eyebrow text-(--ink-3-aa)', className)}
      {...props}
    />
  )
}

/** Hairline divider between groups. */
export function SelectSeparator({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator className={cn('my-1 h-px bg-(--rule)', className)} {...props} />
  )
}

export default Select
