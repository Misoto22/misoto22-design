import { clsx } from 'clsx'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Accessible label announced to screen readers. */
  label?: string
}

const SIZE_CLASS = {
  sm: 'w-3.5 h-3.5 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-7 h-7 border-[3px]',
} as const

/**
 * Accent ring spinner — an accent-colored circle with a transparent top that
 * spins (motion-safe). Carries `role="status"` and a visually-hidden label for
 * screen readers.
 *
 * @example
 * <Spinner size="lg" label="Loading projects" />
 */
export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      className={clsx(
        SIZE_CLASS[size],
        'inline-block rounded-full border-(--accent) border-t-transparent motion-safe:animate-spin',
        className,
      )}
    >
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {label}
      </span>
    </span>
  )
}

export default Spinner
