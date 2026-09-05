'use client'

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export type ToggleGroupProps = ComponentProps<typeof ToggleGroupPrimitive.Root>

/**
 * A segmented control: several options, one strip.
 *
 * `type="single"` is a choice — Radix gives it radio semantics, and it is the
 * right shape for a view switcher or a density setting. `type="multiple"` is a
 * set of independent toggles, which is a different thing announced differently;
 * choosing the wrong one is how a "filter by tag" control ends up telling a
 * screen reader that picking one tag unpicks the others.
 *
 * Distinct from `Tabs`, which switches PANELS and owns a tabpanel relationship.
 * A toggle group changes a value.
 *
 * @example
 * <ToggleGroup type="single" defaultValue="grid" aria-label="Layout">
 *   <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
 *   <ToggleGroupItem value="list">List</ToggleGroupItem>
 * </ToggleGroup>
 */
export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        'inline-flex items-center gap-1 rounded-(--radius-pill) border border-(--rule-2) p-1',
        className,
      )}
      {...props}
    />
  )
}

export type ToggleGroupItemProps = ComponentProps<typeof ToggleGroupPrimitive.Item>

/** One segment. Fills with ink when on, which is the system's only "selected". */
export function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        'inline-flex min-h-(--control-h-sm) items-center justify-center gap-2 rounded-(--radius-pill) px-3.5 text-sm text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:text-(--ink) data-[state=on]:bg-(--ink) data-[state=on]:text-(--paper) disabled:opacity-(--disabled-opacity) disabled:pointer-events-none',
        className,
      )}
      {...props}
    />
  )
}

export default ToggleGroup
