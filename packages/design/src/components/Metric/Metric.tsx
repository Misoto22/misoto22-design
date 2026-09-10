import { Slot, Slottable } from '@radix-ui/react-slot'
import type { HTMLAttributes, ReactNode } from 'react'
import { StatusDot, type StatusTone } from '../StatusDot/StatusDot'
import { cn } from '../../lib/cn'

/**
 * The parts, named. A caller adjusts the tile's placement with `className` and
 * never has to reach for one of these.
 */
const CLASS = {
  card: 'flex flex-col gap-1 rounded-(--radius) border border-(--rule) p-3',
  /* The link affordance, and only under `asChild`: a plate that lifts under the
     pointer when nothing happens on a click is a plate that has promised
     something. */
  link: 'no-underline transition-colors duration-(--duration-fast) hover:border-(--rule-2) hover:bg-(--stone)',
  head: 'flex items-start justify-between gap-2',
  label: 'eyebrow text-(--ink-3-aa)',
  /* Mono and tabular: the figures line up between tiles and stay comparable
     down a column, which is the whole reason four of these sit in a row. */
  value: 'font-mono text-[length:var(--fs-item)] leading-none tabular-nums text-(--ink)',
  detail: 'text-xs text-(--ink-2)',
} as const

export interface MetricProps extends HTMLAttributes<HTMLElement> {
  /** What the figure counts. */
  label: ReactNode
  /** The figure, already formatted — this does not guess a unit or a locale. */
  value: ReactNode
  /** One line of context. A figure without it is a number, not a reading. */
  detail?: ReactNode
  /**
   * How the reading stands. Drawn as a dot beside the label, and only ever a
   * SECOND carrier: the dot is `aria-hidden`, so whatever the tone means has to
   * be in `detail` as well or it reaches nobody who cannot see it.
   */
  tone?: StatusTone
  /** A sparkline, a denominator, a caveat. Sits under the figure. */
  aside?: ReactNode
  /**
   * Render `children` as the tile instead of the `<article>`, keeping these
   * styles — how a linkable tile gets a router's own `Link` without this
   * package importing one.
   *
   * The slotted element must take no children of its own: the label, the figure
   * and everything under them are injected INTO it, which is the point. A whole
   * tile inside one link also means the link's accessible name is every word in
   * it, read in order — "Rows, 63,851, newest yesterday" — so keep `detail`
   * short enough to be heard as part of a link.
   */
  asChild?: boolean
  /** The element the tile becomes under `asChild`. Ignored without it. */
  children?: ReactNode
  className?: string
}

/**
 * One reading, on a plate: a label, a figure, and what qualifies it.
 *
 * Distinct from `BigNumber`, which is the same idea at headline scale for the
 * ONE figure a view is about, and which needs the charts entry. This is the
 * tile that appears four across on a console: smaller, monospaced rather than
 * editorial, and carrying two things `BigNumber` has nowhere for — a status
 * tone, and a free slot under the number that is not a delta. Those two are the
 * whole reason it exists; a dashboard whose tiles have to be a `<div>` because
 * the delta does not apply is a dashboard with two tile designs in it.
 *
 * The figure is monospace and tabular by construction, because four of these in
 * a row are read down the column as much as along it, and proportional digits
 * put the same magnitude at two different widths.
 *
 * @example
 * <Metric label="Rows" value="63,851" detail="newest yesterday" tone="success" />
 * @example
 * // A tile that is also a link, with the router's own component.
 * <Metric asChild label="Jobs" value="12" detail="3 waiting">
 *   <Link href="/jobs" />
 * </Metric>
 */
export function Metric({
  label,
  value,
  detail,
  tone,
  aside,
  asChild = false,
  children,
  className,
  ...rest
}: MetricProps) {
  const body = (
    <>
      <div className={CLASS.head}>
        <span className={CLASS.label}>{label}</span>
        {tone !== undefined && <StatusDot tone={tone} pulse={false} />}
      </div>
      <p className={CLASS.value}>{value}</p>
      {detail !== undefined && <p className={CLASS.detail}>{detail}</p>}
      {aside}
    </>
  )

  if (asChild) {
    // `Slottable` rather than a bare `Slot`: a bare one hands the child the
    // PROPS and leaves it holding its own content, and this component's content
    // is the whole tile. Marking the child slottable makes it the element and
    // the siblings its children, which is the only arrangement where a caller
    // writes `<Link href="…" />` and gets a tile rather than an empty box.
    return (
      <Slot className={cn(CLASS.card, CLASS.link, className)} {...rest}>
        <Slottable>{children}</Slottable>
        {body}
      </Slot>
    )
  }

  return (
    <article className={cn(CLASS.card, className)} {...rest}>
      {body}
    </article>
  )
}

export default Metric
