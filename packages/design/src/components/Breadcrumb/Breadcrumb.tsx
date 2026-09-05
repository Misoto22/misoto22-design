import { Fragment } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface Crumb {
  label: ReactNode
  /** Omit on the last crumb — the page you are already on is not a link. */
  href?: string
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: Crumb[]
  /** Names this trail when a page has more than one. */
  label?: string
  /** Rendered between crumbs. A slash by default; it is decorative either way. */
  separator?: ReactNode
}

/**
 * Where you are, as a path.
 *
 * The last crumb is plain text with `aria-current="page"` rather than a link to
 * itself — a self-link is the most common breadcrumb bug, and it makes a screen
 * reader offer a navigation that goes nowhere.
 *
 * Separators live in `<li aria-hidden>` so the trail is read as its items and
 * not as "home slash work slash".
 *
 * @example
 * <Breadcrumb items={[{ label: 'Components', href: '/components' }, { label: 'Button' }]} />
 */
export function Breadcrumb({
  items,
  label = 'Breadcrumb',
  separator = '/',
  className,
  ...rest
}: BreadcrumbProps) {
  return (
    <nav aria-label={label} className={cn('mono-meta text-(--ink-3-aa)', className)} {...rest}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <Fragment key={index}>
              <li className="min-w-0">
                {item.href && !last ? (
                  <a
                    href={item.href}
                    className="text-(--ink-3-aa) underline decoration-transparent underline-offset-4 transition-colors duration-(--duration-fast) hover:text-(--ink) hover:decoration-(--rule-2)"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={last ? 'text-(--ink)' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="select-none text-(--rule-2)">
                  {separator}
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
