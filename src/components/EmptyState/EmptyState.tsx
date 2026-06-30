import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  /** Optional lucide icon, shown muted inside a soft accent-wash circle. */
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

/**
 * Quiet, centered placeholder for empty admin lists and collections. Warm and
 * restrained — a muted icon, a display title, a soft description, and an
 * optional action.
 *
 * @example
 * <EmptyState
 *   icon={Inbox}
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   action={<Button>New project</Button>}
 * />
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center text-center py-20 px-(--page-pad)',
        className,
      )}
    >
      {Icon && (
        <span className="flex items-center justify-center w-14 h-14 mb-6 rounded-(--radius-pill) bg-(--accent-wash) text-(--foreground-muted)">
          <Icon className="w-6 h-6" aria-hidden />
        </span>
      )}
      <h3 className="font-heading text-2xl text-(--foreground) mb-2">{title}</h3>
      {description && (
        <p className="text-(--secondary-text) text-sm leading-relaxed max-w-sm">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}

export default EmptyState
