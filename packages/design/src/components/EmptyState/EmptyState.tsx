import type { LucideIcon } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional lucide icon, shown muted inside a quiet circle. */
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  /** The one thing to do next. An empty state without an action is a dead end. */
  action?: ReactNode
}

/**
 * A collection with nothing in it — yet.
 *
 * Distinct from `ErrorState`: nothing went wrong here, so the copy says what to
 * do rather than what failed. The two are different components because the
 * shared temptation — one component with a `variant` — produces error pages
 * that read like empty folders.
 *
 * @example
 * <EmptyState
 *   icon={Inbox}
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   action={<Button>New project</Button>}
 * />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center px-(--page-pad) py-20 text-center', className)}
      {...rest}
    >
      {Icon && (
        <span className="mb-6 flex size-14 items-center justify-center rounded-(--radius-pill) bg-(--stone) text-(--ink-3-aa)">
          <Icon size={24} strokeWidth={1.5} aria-hidden />
        </span>
      )}
      <h3 className="m-0 font-heading text-[length:var(--fs-sub)] font-normal text-(--ink)">
        {title}
      </h3>
      {description && (
        <p className="m-0 mt-2 max-w-sm text-sm leading-relaxed text-(--ink-3-aa)">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}

export default EmptyState
