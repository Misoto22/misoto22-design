'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export interface ProgressProps
  extends Omit<ComponentProps<typeof ProgressPrimitive.Root>, 'value'> {
  /**
   * 0–100. Omit (or pass `null`) when the duration is genuinely unknown — the
   * bar then sweeps instead of filling, and Radix drops `aria-valuenow` so a
   * screen reader is told "indeterminate" rather than a number that is a guess.
   */
  value?: number | null
  /** Names what is progressing. Required: a bare bar announces nothing. */
  label: string
  /** Prints the percentage above the bar. Only meaningful when `value` is set. */
  showValue?: boolean
}

/**
 * A bar that fills, or sweeps when the end is unknown.
 *
 * Flat: a track in `--stone`, a fill in `--ink`. The White Reset has no
 * gradient and no glow, so the only thing carrying the reading is the boundary
 * between the two.
 *
 * @example
 * <Progress value={62} label="Uploading photos" showValue />
 * @example
 * <Progress label="Indexing" />
 */
export function Progress({ value = null, label, showValue = false, className, ...rest }: ProgressProps) {
  const indeterminate = value === null || value === undefined
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {showValue && !indeterminate && (
        <div className="flex items-baseline justify-between mono-meta text-(--ink-3-aa)">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(clamped)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        value={indeterminate ? null : clamped}
        aria-label={label}
        className="relative h-1 w-full overflow-hidden rounded-(--radius-pill) bg-(--stone)"
        {...rest}
      >
        {indeterminate ? (
          <span
            data-m22-animated
            // A quarter-width bar travelling the track. `transform` only, so it
            // runs on the compositor and never triggers layout.
            className="absolute inset-y-0 left-0 w-1/4 rounded-(--radius-pill) bg-(--ink) motion-safe:animate-[m22-sweep_1.4s_var(--ease)_infinite] motion-reduce:w-full motion-reduce:opacity-40"
          />
        ) : (
          <ProgressPrimitive.Indicator
            className="h-full rounded-(--radius-pill) bg-(--ink) transition-transform duration-(--duration-slow) ease-(--ease-out-expo)"
            style={{ transform: `translateX(-${100 - clamped}%)` }}
          />
        )}
      </ProgressPrimitive.Root>
    </div>
  )
}

export default Progress
