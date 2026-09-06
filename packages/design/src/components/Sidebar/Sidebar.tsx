'use client'

import { ChevronRight, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'
import { warnBlankName } from '../../lib/warn'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible/Collapsible'
import { NavItem, type NavItemProps } from '../NavItem/NavItem'
import { Tooltip, TooltipProvider } from '../Tooltip/Tooltip'

/** What happens to the rail when it is closed. See {@link SidebarProps.collapsible}. */
export type SidebarCollapsible = 'icon' | 'offcanvas' | 'none'

interface SidebarState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  collapsible: SidebarCollapsible
  /** True only in the state where labels are hidden and rows are icons. */
  iconOnly: boolean
}

const SidebarContext = createContext<SidebarState | null>(null)

/**
 * What the parts read when nobody wrapped them: open, and not collapsible.
 *
 * A rail without a provider used to THROW, which is defensible for a hook a
 * consumer called by hand and wrong for the component itself — `<Sidebar>` on
 * its own is the first thing anybody writes, and the documentation site's own
 * props panel renders exactly that. A component that cannot draw without a
 * wrapper is not strict, it is unusable; so the parts fall back to the state a
 * rail with no controls would be in, and the button that would toggle it does
 * nothing because there is nothing holding the answer.
 */
const UNWRAPPED: SidebarState = {
  open: true,
  setOpen: () => {},
  toggle: () => {},
  collapsible: 'none',
  iconOnly: false,
}

/** The state the parts read, wrapped or not. */
function useSidebarState(): SidebarState {
  return useContext(SidebarContext) ?? UNWRAPPED
}

/**
 * The rail's own state, for anything that has to answer to it.
 *
 * A page beside the rail needs it to reserve the right width; a control inside
 * needs to know whether its label is being drawn.
 *
 * This one THROWS outside a provider, and the parts above do not, and the
 * difference is who made the mistake. A part rendered on its own is somebody
 * writing `<Sidebar>` to see what it looks like; a call to this hook is code
 * asking for state that nothing is keeping, and returning a plausible default
 * there is a layout that is wrong in one state and right in the other with
 * nothing to say which.
 */
export function useSidebar(): SidebarState {
  const state = useContext(SidebarContext)
  if (!state) throw new Error('useSidebar must be used inside a <SidebarProvider>')
  return state
}

export interface SidebarProviderProps {
  /** Controlled open state. Leave off to let the provider own it. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** What closing does to the rail. See {@link SidebarProps.collapsible}. */
  collapsible?: SidebarCollapsible
  /**
   * The keyboard shortcut that toggles the rail, as a single letter.
   *
   * `b`, with the platform's own modifier, because that is what every editor
   * and every application shell already uses for the same thing. Pass `null`
   * to bind nothing — an app that already owns that chord should not have it
   * taken twice, and a rail that cannot be closed does not need a shortcut for
   * closing it.
   */
  shortcut?: string | null
  children: ReactNode
}

/**
 * Holds whether the rail is open, and binds the shortcut that changes it.
 *
 * Separate from `Sidebar` itself because the answer is needed on BOTH sides of
 * the layout: the rail draws itself from it, and the content beside the rail
 * reserves width from it. A state that lived inside the rail could only ever
 * be read downwards.
 */
export function SidebarProvider({
  open: controlled,
  defaultOpen = true,
  onOpenChange,
  collapsible = 'icon',
  shortcut = 'b',
  children,
}: SidebarProviderProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const open = controlled ?? uncontrolled

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  const toggle = useCallback(() => setOpen(!open), [open, setOpen])

  useEffect(() => {
    if (!shortcut || collapsible === 'none') return
    const onKey = (event: KeyboardEvent) => {
      // `metaKey` OR `ctrlKey`, not the platform's own: a Mac keyboard on a
      // Linux browser and a PC keyboard on a Mac both exist, and a shortcut
      // that works for one of them is a shortcut with a bug report attached.
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut, collapsible, toggle])

  const value = useMemo<SidebarState>(
    () => ({
      open,
      setOpen,
      toggle,
      collapsible,
      iconOnly: !open && collapsible === 'icon',
    }),
    [open, setOpen, toggle, collapsible],
  )

  // The tooltip provider is supplied here rather than demanded of the app. A
  // collapsed rail is rows of icons, every one of which names itself through a
  // tooltip — so without it the component does not degrade, it throws, and only
  // in the state a reader reaches by pressing the button on it. Radix scopes
  // nested providers, so an app that already has one keeps its own settings for
  // everything outside this subtree.
  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

export interface SidebarProps extends Omit<ComponentProps<'nav'>, 'children'> {
  /**
   * Names the landmark. Required: a page with two navigations in it announces
   * two things called "navigation" unless each of them says which it is.
   */
  label: string
  children: ReactNode
}

/**
 * A navigation rail down the side of an application.
 *
 * A `<nav>`, not an `<aside>`. The element decides the landmark, and a rail of
 * links announced as "complementary" is not the one a screen reader user jumps
 * to when they go looking for the navigation.
 *
 * Composed rather than configured: a rail is a header, a scrolling middle and a
 * footer, and every product wants different things in all three. What this owns
 * is the part that is the same everywhere — the width, the edge, the scroll
 * behaviour, and what happens when it closes.
 *
 * **Closing has three shapes**, and `collapsible` on the provider picks one.
 * `icon` keeps the rail and drops the labels, which is right when the rows are
 * a fixed set a reader learns the shape of. `offcanvas` takes the whole rail
 * away, which is right when the rows are a long index nobody memorises.
 * `none` is a rail that does not close.
 *
 * The trigger belongs INSIDE the rail — `SidebarHeader` places it — rather than
 * out in an application's masthead. A control that hides a thing should live on
 * the thing: in the masthead it is one more anonymous icon in a row of them,
 * and nothing connects it to the column it operates.
 *
 * @example
 * <SidebarProvider>
 *   <Sidebar label="Documentation">
 *     <SidebarHeader>Acme</SidebarHeader>
 *     <SidebarContent>
 *       <SidebarGroup label="Guide" count={2}>
 *         <SidebarItem href="/start" icon={Home}>Getting started</SidebarItem>
 *       </SidebarGroup>
 *     </SidebarContent>
 *   </Sidebar>
 * </SidebarProvider>
 */
export function Sidebar({ label, className, children, ...rest }: SidebarProps) {
  const { open, collapsible, iconOnly } = useSidebarState()
  warnBlankName('Sidebar', 'label', label, 'the rail is announced as an unnamed navigation')

  const gone = !open && collapsible === 'offcanvas'

  return (
    <nav
      aria-label={label}
      data-state={open ? 'open' : 'collapsed'}
      data-collapsible={collapsible}
      // `group`, so every descendant can answer the rail's state without being
      // handed a prop through four levels of composition.
      className={cn(
        'group/sidebar flex shrink-0 flex-col overflow-hidden border-e border-(--rule) bg-(--paper) transition-[width] duration-(--duration-base) ease-(--ease-out-expo) motion-reduce:transition-none',
        gone ? 'w-0 border-e-0' : iconOnly ? 'w-(--sidebar-w-icon)' : 'w-(--sidebar-w)',
        className,
      )}
      {...rest}
    >
      {/* The inner column is the full width at every state, so the rows inside
          do not reflow while the rail animates — they are clipped by the rail
          instead, which is what makes the motion read as a panel sliding rather
          than as a column of text reflowing under a wipe. */}
      <div className={cn('flex h-full flex-col', gone ? 'w-(--sidebar-w)' : 'w-full')}>
        {children}
      </div>
    </nav>
  )
}

/**
 * The block at the top of the rail: a brand, a workspace, a switcher.
 *
 * It is also where `SidebarTrigger` belongs, and the layout assumes one:
 * anything passed as `children` takes the space and the trigger sits at the
 * inline end of the row.
 */
export function SidebarHeader({ className, children, ...rest }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-h-14 shrink-0 items-center gap-2 border-b border-(--rule) px-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

/** The scrolling middle. Everything that is a list of places goes here. */
export function SidebarContent({ className, children, ...rest }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2 scroll-slim', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

/**
 * The block at the bottom: the utilities, the account, the thing a rail ends on.
 *
 * A separate landmark from the content above it because it is a separate kind
 * of thing — a reader scanning the index does not want Trash and Help in it.
 */
export function SidebarFooter({ className, children, ...rest }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex shrink-0 flex-col gap-1 border-t border-(--rule) p-2', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

/** A rule between blocks of rows, inset to the rail's own padding. */
export function SidebarSeparator({ className, ...rest }: ComponentProps<'hr'>) {
  return <hr className={cn('my-1 border-0 border-t border-(--rule)', className)} {...rest} />
}

export interface SidebarTriggerProps extends ComponentProps<'button'> {
  /** What the button announces. Both states, because it says both things. */
  labels?: { open: string; close: string }
}

/**
 * The control that opens and closes the rail.
 *
 * Its accessible name changes with what it will DO, and `aria-expanded` reports
 * what is true now — a button permanently called "Toggle sidebar" tells a
 * screen reader user nothing about which way it will go.
 */
export function SidebarTrigger({
  labels = { open: 'Open the sidebar', close: 'Close the sidebar' },
  className,
  onClick,
  ...rest
}: SidebarTriggerProps) {
  const { open, toggle } = useSidebarState()
  const Icon = open ? PanelLeftClose : PanelLeftOpen

  return (
    <button
      type="button"
      aria-label={open ? labels.close : labels.open}
      aria-expanded={open}
      onClick={(event) => {
        toggle()
        onClick?.(event)
      }}
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-(--radius) text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)',
        className,
      )}
      {...rest}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden />
    </button>
  )
}

export interface SidebarGroupProps {
  /** The heading over the rows. */
  label: string
  /** How many rows are inside, printed on the far side of the heading. */
  count?: number
  /**
   * A mark that belongs to the GROUP — "Beta", "3 new".
   *
   * Beside the label, not out at the end with the count: it qualifies the
   * words, and a qualifier that has drifted to the other side of the row reads
   * as a second, unrelated fact.
   */
  badge?: ReactNode
  /**
   * A control on the heading row — a menu, an "add" button.
   *
   * Sits between the label and the count, and is NOT rendered inside the
   * heading's own button: a control nested in a control is one the keyboard
   * reaches by pressing the thing it is inside.
   */
  action?: ReactNode
  /** Whether the group folds at all. A group of two rows usually should not. */
  collapsible?: boolean
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

/**
 * A labelled block of rows, optionally foldable.
 *
 * The heading is the same SIZE as the rows beneath it and outranks them by
 * weight and by ink. Both halves of that are corrections. Smaller, it inverted
 * the hierarchy it exists to express — a group read as a footnote over a list
 * rather than as a title over its own contents. In the MONO face, which is
 * where it went next, ten of them stacked in a column read as a terminal
 * listing: mono is this system's voice for code, metadata and figures, and a
 * navigation heading is none of those. Rank belongs to weight and to a step up
 * the ink ladder, which are the two signals that can outrank a row without
 * changing what kind of thing it is.
 *
 * An open group draws a hairline down its rows. Fifty rows under seven headings
 * have nothing in them saying which heading any given row belongs to — only the
 * distance to the last one, which is gone the moment the list is scrolled.
 *
 * The whole block hides when the rail is collapsed to icons: a heading with no
 * room for its own word is two or three letters and a number, and the rows are
 * still there underneath as icons.
 */
export function SidebarGroup({
  label,
  count,
  badge,
  action,
  collapsible = true,
  defaultOpen = true,
  children,
  className,
}: SidebarGroupProps) {
  const { iconOnly } = useSidebarState()
  const [open, setOpen] = useState(defaultOpen)
  const labelId = useId()

  const rows = <div className="group/rows flex flex-col gap-0.5">{children}</div>

  if (iconOnly) {
    // No heading, and no rule: both of them are words and an indent, and there
    // is room for neither. The rows keep their own group semantics from the
    // label, which is still announced even though it is not drawn.
    return (
      <div role="group" aria-label={label} className={cn('group/rows flex flex-col gap-0.5', className)}>
        {children}
      </div>
    )
  }

  const heading = (
    <>
      <span className="truncate text-sm font-medium text-(--ink)">{label}</span>
      {badge}
      {count !== undefined && (
        <span className="ms-auto text-xs tabular-nums text-(--ink-3-aa)">{count}</span>
      )}
    </>
  )

  if (!collapsible) {
    return (
      <div role="group" aria-labelledby={labelId} className={cn('flex flex-col gap-1', className)}>
        <div className="flex min-h-8 items-center gap-1.5 px-2 py-1" id={labelId}>
          {heading}
          {action}
        </div>
        <div className="ms-[0.9rem] flex flex-col gap-0.5 border-s border-(--rule) ps-2">{rows}</div>
      </div>
    )
  }

  return (
    // Radix rather than `{open && …}`: a conditional render cannot animate — the
    // rows are simply not there on the next frame — and Radix publishes the
    // measured height, so the panel opens to what it actually is rather than to
    // a guessed maximum.
    <Collapsible open={open} onOpenChange={setOpen} className={cn('flex flex-col gap-1', className)}>
      <div className="flex min-h-9 items-center gap-1.5">
        <CollapsibleTrigger className="group/heading flex min-h-8 flex-1 items-center gap-1.5 rounded-(--radius-sm) px-2 py-1 text-start transition-colors duration-(--duration-fast) hover:bg-(--stone)">
          <ChevronRight
            size={12}
            strokeWidth={2}
            aria-hidden
            className="shrink-0 text-(--ink-3-aa) transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-data-[state=open]/heading:rotate-90 motion-reduce:transition-none"
          />
          {heading}
        </CollapsibleTrigger>
        {action}
      </div>
      <CollapsibleContent>
        <div className="ms-[0.9rem] flex flex-col gap-0.5 border-s border-(--rule) ps-2">{rows}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * One filled row at a time, and it follows the pointer.
 *
 * A rail draws the current page filled and fills a row under the pointer, and
 * those are two different facts wearing the same paint — so a reader with the
 * mouse in the list sees two rows claiming to be where they are. The fill is
 * the POINTER'S while the pointer is in the list, and returns to the current
 * page when it leaves; `aria-current` never moves, so nothing about what is
 * true changes, only what is drawn.
 *
 * `not-hover` rather than an ordering trick: composed with `group-hover`, it
 * says "the list is hovered and this row is not" in one selector, which does
 * not depend on which of two equally specific rules Tailwind emitted last.
 */
const MOVING_HIGHLIGHT =
  'group-hover/rows:not-hover:bg-transparent group-hover/rows:not-hover:font-normal group-hover/rows:not-hover:text-(--ink-3-aa)'

export interface SidebarBranchProps {
  /** The row's own words, and the name of the group it opens. */
  label: string
  /** Drawn at the start of the row, and the whole of the row when collapsed. */
  icon?: LucideIcon
  /** A count or a state at the end of the row. */
  trailing?: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  className?: string
}

/**
 * A row that opens onto more rows.
 *
 * The thing a rail is for and the thing a flat list of groups cannot do: a
 * workspace with projects in it, a folder with documents in it, a service with
 * its environments. `SidebarGroup` is a HEADING over a set — it is not itself a
 * place, and it has no icon and no state. This is a place that contains places,
 * so it is a row like any other and it carries the same icon, trailing slot and
 * hover as its children.
 *
 * The children sit behind the same hairline a group draws, one indent further
 * in, so nesting reads as depth rather than as two unrelated lists. Two levels
 * is what the indent has room for at this width; a third is a tree, and a tree
 * in a 16rem column is a horizontal scrollbar with an outline in it.
 *
 * Collapsed to icons the row becomes its icon and the children are not drawn —
 * there is nowhere for an indent to go, and a nested icon under an unnested one
 * is two glyphs with no visible relationship.
 *
 * @example
 * <SidebarBranch label="Acme HQ" icon={Building} defaultOpen>
 *   <SidebarItem href="/hq" icon={Home}>Home</SidebarItem>
 *   <SidebarItem href="/hq/tasks" icon={CheckSquare}>My tasks</SidebarItem>
 * </SidebarBranch>
 */
export function SidebarBranch({
  label,
  icon: Icon,
  trailing,
  defaultOpen = false,
  open: controlled,
  onOpenChange,
  children,
  className,
}: SidebarBranchProps) {
  const { iconOnly } = useSidebarState()
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const open = controlled ?? uncontrolled

  const setOpen = (next: boolean) => {
    if (controlled === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }

  if (iconOnly && Icon) {
    // The row, and nothing under it. A branch collapsed to an icon is a place
    // you can still see; its contents are a level of structure the width no
    // longer has.
    return (
      <Tooltip content={label} side="right">
        <button
          type="button"
          aria-label={label}
          className={cn(
            'flex min-h-(--control-h-sm) items-center justify-center rounded-(--radius) text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)',
            className,
          )}
        >
          <Icon size={18} strokeWidth={1.5} aria-hidden />
        </button>
      </Tooltip>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('flex flex-col gap-0.5', className)}>
      <CollapsibleTrigger className="group/branch flex min-h-(--control-h-sm) items-center gap-3 rounded-(--radius) px-3 py-2 text-start text-sm text-(--ink-3-aa) transition-colors duration-(--duration-fast) hover:bg-(--stone) hover:text-(--ink)">
        {Icon && <Icon size={18} strokeWidth={1.5} aria-hidden className="shrink-0" />}
        <span className="truncate">{label}</span>
        {trailing !== undefined && <span className="ms-auto shrink-0">{trailing}</span>}
        {/* The chevron goes at the END and only when nothing else is there, so
            a row with a count does not put two marks in the same corner. */}
        {trailing === undefined && (
          <ChevronRight
            size={12}
            strokeWidth={2}
            aria-hidden
            className="ms-auto shrink-0 transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-data-[state=open]/branch:rotate-90 motion-reduce:transition-none"
          />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="group/rows ms-[1.35rem] flex flex-col gap-0.5 border-s border-(--rule) ps-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export interface SidebarItemProps extends NavItemProps {
  /** A count or a state on the far side of the row. Hidden with the label. */
  trailing?: ReactNode
}

/**
 * One row.
 *
 * `NavItem` with the two things a RAIL adds: a trailing slot, and an answer for
 * the state where there is no room for words. Collapsed to icons the label is
 * removed from the layout rather than hidden with CSS — a `sr-only` label still
 * occupies the flex row's gap — and moves into a tooltip, because an icon on
 * its own is a guess for everyone and unusable for a screen reader.
 *
 * A row with no `icon` keeps its label collapsed, since hiding it would leave a
 * blank row: the icon is what makes the collapsed state legible, and a rail
 * that collapses needs one on every row.
 */
export function SidebarItem({ trailing, children, className, ...rest }: SidebarItemProps) {
  const { iconOnly } = useSidebarState()

  if (iconOnly && rest.icon && !rest.asChild) {
    return (
      <Tooltip content={children} side="right">
        <NavItem {...rest} className={cn('justify-center px-0', className)}>
          <span className="sr-only">{children}</span>
        </NavItem>
      </Tooltip>
    )
  }

  // `asChild` hands the row to a router's own Link, and Radix's Slot takes
  // exactly ONE child — a second one, or even the `false` an unused conditional
  // leaves behind, throws rather than renders. So a slotted row passes its
  // children straight through and puts its own trailing content inside the
  // child it was handed. NavItem's `icon` has the same constraint for the same
  // reason, and says so.
  if (rest.asChild) {
    return (
      <NavItem {...rest} className={cn(MOVING_HIGHLIGHT, className)}>
        {children}
      </NavItem>
    )
  }

  return (
    <NavItem {...rest} className={cn(MOVING_HIGHLIGHT, className)}>
      {children}
      {trailing !== undefined && <span className="ms-auto shrink-0">{trailing}</span>}
    </NavItem>
  )
}
