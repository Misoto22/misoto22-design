import { clsx } from 'clsx'

export interface StatusDotProps {
  size?: 'sm' | 'md'
  pulse?: boolean
  className?: string
}

const SIZE_CLASS = { sm: 'w-[7px] h-[7px]', md: 'w-2 h-2' } as const

const PULSE_CLASS =
  'shadow-[0_0_0_4px_color-mix(in_oklab,var(--success)_22%,transparent)] motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]'

/**
 * Decorative success-colored dot with an optional soft pulsing halo. Purely
 * presentational (`aria-hidden`) — pair with text for meaning.
 *
 * @example
 * <StatusDot size="sm" pulse />
 */
export function StatusDot({ size = 'md', pulse = true, className }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={clsx(
        SIZE_CLASS[size],
        'rounded-full bg-(--success)',
        pulse && PULSE_CLASS,
        className,
      )}
    />
  )
}

export default StatusDot
