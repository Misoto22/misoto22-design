'use client'

import { useCallback, useState } from 'react'

/**
 * A chart's selected series, sector, bar or node — controlled or not.
 *
 * Nine charts each grew a `defaultSelected*` prop and a `useState` seeded from
 * it, and none of them grew the other half. A default seeds the state ONCE:
 * pass a new one and nothing happens, because the state was already
 * initialised. So a call site that wanted a chart's selection to follow a
 * filter, a route or a sibling chart had no way to say so — the prop that looks
 * like the way to do it silently is not.
 *
 * The pair is the React convention and it is the whole fix: pass `selected` to
 * drive it from outside, or leave it undefined and the chart keeps its own.
 *
 * @param selected The controlled value. `undefined` leaves the chart in charge.
 * @param fallback What an uncontrolled chart starts on.
 * @param onChange Fires on every change, controlled or not.
 */
export function useChartSelection(
  selected: string | null | undefined,
  fallback: string | null,
  onChange: ((selected: string | null) => void) | undefined,
): [string | null, (next: string | null) => void] {
  const [own, setOwn] = useState<string | null>(fallback)
  const isControlled = selected !== undefined

  const select = useCallback(
    (next: string | null) => {
      // The controlled chart still updates its own copy. It is never read while
      // `selected` is given, and it means an unmount of the controlling prop
      // does not throw the selection away.
      setOwn(next)
      onChange?.(next)
    },
    [onChange],
  )

  return [isControlled ? selected : own, select]
}
