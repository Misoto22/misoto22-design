import type { ReactNode } from 'react'
import { EmptyState } from '../../components/EmptyState/EmptyState'

export interface ChartEmptyProps {
  /** What is missing. Says what happened, not "no data". */
  title?: ReactNode
  /** Why, or what to change — a filter to widen, a range to move. */
  description?: ReactNode
  /** The one thing to do next. */
  action?: ReactNode
}

/**
 * What a chart shows when it has nothing to draw.
 *
 * The state almost every chart library forgets, and the one a real dashboard
 * hits within a week: a filter that matches nothing, a new account, a range
 * before the data starts. Without it a chart hands the reader an empty pair of
 * axes, which is indistinguishable from a chart that failed to load — so the
 * reader reloads the page, and it is still empty.
 *
 * Distinct from the loading skeleton, which says "not yet". This says "there
 * is nothing here", which is a different sentence and usually has an action
 * attached to it.
 *
 * Reuses the system's own `EmptyState` rather than inventing a chart-shaped
 * one: an empty chart and an empty table are the same event, and a reader
 * should not have to learn two vocabularies for it.
 */
export function ChartEmpty({
  title = 'No data in this range',
  description = 'Nothing matched the current filters. Widen the range, or clear a filter.',
  action,
}: ChartEmptyProps) {
  return (
    // `my-auto` is what keeps this where the plot was. The box sizes itself
    // 16:9 up to 26rem, which is right for a card that grows to its content and
    // short of a figure given a fixed height by the page around it — a
    // dashboard tile, a panel in a grid. Without the auto margin the state pins
    // to the top of that figure while the plot it stands in for filled the
    // whole cell, so the same chart reads at two different heights depending on
    // whether it has data. The margin absorbs the free space when there is any
    // and does nothing when there is none, so the content-sized case is
    // untouched.
    <div className="my-auto flex aspect-video max-h-[26rem] min-h-[13rem] w-full items-center justify-center">
      <EmptyState title={title} description={description} action={action} className="py-0" />
    </div>
  )
}
