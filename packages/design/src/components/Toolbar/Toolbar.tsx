import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Which edge the bar sticks to, or neither.
 *
 * `bottom` is the form footer — the actions stay in reach while a long form
 * scrolls under them. `top` is the filter bar over a list. `static` is the same
 * bar with no stickiness, for a short page or a bar inside a dialog that is
 * already the height of its content.
 */
export type ToolbarPosition = 'bottom' | 'top' | 'static'

export type ToolbarAlign = 'start' | 'center' | 'end' | 'between'

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Names the bar for a screen reader — "Form actions", "List filters".
   * Required, because a group with no name is announced as "group" and a page
   * with two of them is a page with two identical announcements.
   */
  label: string
  /** Which edge the bar sticks to. See {@link ToolbarPosition}. */
  position?: ToolbarPosition
  /** Where the contents sit along the inline axis. */
  align?: ToolbarAlign
  children: ReactNode
}

const POSITION: Record<ToolbarPosition, string> = {
  bottom: 'sticky bottom-0 z-(--z-sticky) border-t border-(--rule-2)',
  top: 'sticky top-0 z-(--z-sticky) border-b border-(--rule-2)',
  static: 'border-t border-(--rule-2)',
}

const ALIGN: Record<ToolbarAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

/**
 * The bar of actions at the edge of a working surface.
 *
 * Two page templates built the same thing independently — a sticky strip on
 * `--paper` with a rule along the edge it sticks to — which is the signal that
 * it belongs here rather than in each of them.
 *
 * The ground is opaque `--paper` and not a blur. Content scrolls UNDER this
 * bar, so anything translucent puts the last row of a table behind the submit
 * button and makes both unreadable; `FloatingIconButton` blurs because it
 * floats over a gap, which is a different problem.
 *
 * It is not `role="toolbar"`. That role's contract is a single tab stop with
 * arrow keys moving between the controls inside it, and this implements no such
 * thing — declaring the role without the behaviour tells a screen-reader user
 * to press arrow keys that do nothing. It is a named `group`, so the controls
 * keep their own places in the tab order and the bar is still announced.
 *
 * @example
 * <Toolbar label="Form actions">
 *   <Button variant="secondary">Cancel</Button>
 *   <Button type="submit">Save changes</Button>
 * </Toolbar>
 * @example
 * <Toolbar label="List filters" position="top" align="between">…</Toolbar>
 */
export function Toolbar({
  label,
  position = 'bottom',
  align = 'end',
  className,
  children,
  ...rest
}: ToolbarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex flex-wrap items-center gap-3 bg-(--paper) px-4 py-3',
        POSITION[position],
        ALIGN[align],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Toolbar
