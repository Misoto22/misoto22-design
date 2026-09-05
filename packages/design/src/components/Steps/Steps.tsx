import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface Step {
  /** Stable key; also what a caller keys its own data by. */
  id?: string
  /** The step's name — a noun, not a sentence. */
  title: string
  /** The quiet line under it: what it is made of, what it costs, what it uses. */
  note?: ReactNode
  /**
   * The step being described, filled rather than outlined.
   *
   * At most one. It marks where the sequence has GOT to, which is a fact about
   * the process rather than a highlight — two filled markers say the reader is
   * in two places at once.
   */
  current?: boolean
}

export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  steps: Step[]
  /** Names the sequence for assistive tech when no heading does. */
  label?: string
  /**
   * How the marker is drawn.
   *
   * `number` counts from one and is right for a pipeline, a recipe, a
   * migration. `rule` drops the digit for a plain hairline node, which is what
   * a sequence of states wants — "queued, running, done" is an order, not a
   * numbered list.
   */
  marker?: 'number' | 'rule'
}

/**
 * A numbered sequence, as a rail.
 *
 * The shape a pipeline actually has: one thing after another, each with a name
 * and a line of detail, and a rule running through them so the eye reads them
 * as one process rather than as five unrelated rows. It is the figure a
 * technical post reaches for most often after a diagram, and it is NOT a
 * diagram — nothing branches, nothing points at anything, and drawing it with
 * boxes and arrows says otherwise.
 *
 * The connector is drawn on the ITEM rather than as a full-height line behind
 * the markers, so it starts under one and stops above the next instead of
 * running through both — and so the last step has no tail hanging off it. That
 * is the detail that separates a rail from a list with a border on it.
 *
 * An `<ol>`, because the order is the content. `aria-current="step"` marks the
 * filled one, which is the only thing here a screen reader could not otherwise
 * infer from the order it is read in.
 *
 * @example
 * <Steps
 *   label="How an answer is built"
 *   steps={[
 *     { title: 'Corpus', note: 'Blog MDX · project database' },
 *     { title: 'Chunking', note: 'By heading · 300–800 tokens' },
 *     { title: 'Answer', note: 'Live citation panel', current: true },
 *   ]}
 * />
 */
export function Steps({ steps, label, marker = 'number', className, ...rest }: StepsProps) {
  if (steps.length === 0) return null

  return (
    <ol
      aria-label={label}
      // One number for the marker, because three rules depend on it: the
      // marker's own box, where the connector starts, and where it is centred.
      // Written as a property rather than repeated as a literal so a caller can
      // move all three at once.
      className={cn('m-0 flex list-none flex-col p-0 [--step-size:2rem]', className)}
      {...rest}
    >
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        return (
          <li
            key={step.id ?? `${step.title}-${index}`}
            aria-current={step.current ? 'step' : undefined}
            className="relative flex gap-4 pb-7 last:pb-0"
          >
            {/* The connector. Absolute, so it spans the gap between this marker
                and the next without taking part in the row's own layout — and
                it is simply absent on the last row rather than drawn and then
                hidden. */}
            {!last && (
              <span
                aria-hidden
                className="absolute start-[calc(var(--step-size)/2)] top-(--step-size) bottom-0 w-px -translate-x-1/2 bg-(--rule-2) rtl:translate-x-1/2"
              />
            )}
            <span
              aria-hidden
              className={cn(
                'relative z-1 grid size-(--step-size) shrink-0 place-items-center rounded-full border text-[12px] tabular-nums',
                step.current
                  ? 'border-(--accent) bg-(--accent) text-(--accent-foreground)'
                  : 'border-(--rule-2) bg-(--paper) text-(--ink-3-aa)',
                marker === 'rule' && 'text-[0px]',
              )}
            >
              {marker === 'number' ? index + 1 : ''}
            </span>
            <div className="flex min-w-0 flex-col gap-1 pt-1">
              <span className="font-sans text-[15px] leading-tight text-(--ink)">{step.title}</span>
              {step.note !== undefined && step.note !== null && (
                <span className="mono-meta leading-[1.6] text-(--ink-3-aa)">{step.note}</span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default Steps
