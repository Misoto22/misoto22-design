import type { HTMLAttributes, ReactNode } from 'react'
import { Heading, type HeadingLevel } from '../Heading/Heading'
import { cn } from '../../lib/cn'

/**
 * The parts, named. One place to read what a page opening is made of, and the
 * reason a caller never needs a class of their own to adjust one.
 */
const CLASS = {
  header: 'flex flex-col gap-1 border-b border-(--rule) pb-6',
  trail: 'mb-2',
  eyebrow: 'm-0 eyebrow text-(--ink-3-aa)',
  row: 'flex flex-wrap items-baseline justify-between gap-3',
  actions: 'flex shrink-0 items-center gap-2',
  description: 'm-0 max-w-(--measure-record) text-(--ink-2)',
} as const

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** What this page is. One line, and the only thing at this weight. */
  title: ReactNode
  /**
   * The kicker above the title.
   *
   * A wayfinding aid rather than decoration: in a console whose pages are
   * referred to by a numeral, this is that numeral, and elsewhere it is the
   * section the page belongs to.
   */
  eyebrow?: ReactNode
  /** One sentence saying what the page is for. Never a second finding. */
  description?: ReactNode
  /**
   * The trail above the opening, for a shell that does not already pin one.
   *
   * A page rendered inside an application frame usually leaves this off — two
   * trails on one screen are two answers to "where am I". Takes the rendered
   * `Breadcrumb` rather than its items, so the crumbs stay the caller's to
   * wire to a router.
   */
  breadcrumb?: ReactNode
  /**
   * Controls that qualify what the page IS, set inside the opening rather than
   * above the content.
   *
   * The distinction is worth holding: a range picker does not act on the
   * records, it says which slice of them the title refers to. Below the rule it
   * becomes a toolbar competing with whatever strip follows; beside the title
   * it reads as part of the heading, which is what it is.
   */
  actions?: ReactNode
  /**
   * The heading level `title` opens, in the document the opening lands in.
   *
   * Defaults to `1`, which is what a page opening IS: a page has one name, and
   * a shell that owns the document's heading has taken the page's own name away
   * from it. Move it only where the opening is not the document's — a preview
   * canvas, a template shown inside a documentation page, a composition
   * embedded under a host's own `h1`.
   *
   * The size does not follow the level. `title` renders at `--fs-heading` at
   * every level, because moving an opening down the outline is a fact about the
   * document and not a request for smaller type.
   */
  level?: HeadingLevel
  className?: string
}

/**
 * A page opening: what this page is, and what qualifies it.
 *
 * The system has `Heading` for a heading and `Breadcrumb` for a trail, and
 * nothing that said how a page STARTS — so every application invented the
 * arrangement, and the eyebrow landed above the title on one screen and below
 * it on the next. This fixes the order, the rule under it, and where the
 * controls sit.
 *
 * Distinct from `AppShell`, which is the frame around a page rather than the
 * top of one: a shell holds the rail and the bar for every route, and this is
 * the first thing inside the route's own column.
 *
 * The title renders as an `h1` unless `level` says otherwise, and it is worth
 * saying why the default is the whole answer nearly always: a page has one name,
 * and a shell that owns the document's heading has taken the page's own name
 * away from it. A second opening on one screen is two pages.
 *
 * The SIZE is not a prop at all. `Heading` at level 1 defaults to `--fs-title`,
 * which is the editorial step for a document whose subject IS its title; a page
 * opening stands over a working screen, where the title is the label for what
 * follows and the records under it are what the reader came for. `--fs-heading`
 * is that step at every level, and `Heading` is what draws it, so the ladder
 * stays one ladder and moving an opening down the outline never resizes it.
 *
 * @example
 * <PageHeader eyebrow="04" title="Money" description="Balances and flows." />
 * @example
 * <PageHeader
 *   title="Jobs"
 *   breadcrumb={<Breadcrumb items={crumbs} />}
 *   actions={<Button size="sm">Run now</Button>}
 * />
 * @example
 * // Inside a page that already has its own h1 — a preview, a template.
 * <PageHeader level={2} title="Money" />
 */
export function PageHeader({
  title,
  eyebrow,
  description,
  breadcrumb,
  actions,
  level = 1,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <header className={cn(CLASS.header, className)} {...rest}>
      {breadcrumb !== undefined && <div className={CLASS.trail}>{breadcrumb}</div>}
      {eyebrow !== undefined && <p className={CLASS.eyebrow}>{eyebrow}</p>}
      <div className={CLASS.row}>
        <Heading level={level} size="heading">
          {title}
        </Heading>
        {actions !== undefined && <div className={CLASS.actions}>{actions}</div>}
      </div>
      {description !== undefined && <p className={CLASS.description}>{description}</p>}
    </header>
  )
}

export default PageHeader
