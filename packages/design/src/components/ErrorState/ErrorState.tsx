import type { HTMLAttributes, ReactNode } from 'react'
import { Heading, type HeadingLevel } from '../Heading/Heading'
import { cn } from '../../lib/cn'

export interface ErrorStateProps extends HTMLAttributes<HTMLElement> {
  /** The status, set large — "404", "500". Decorative; the heading carries the meaning. */
  code: ReactNode
  heading: ReactNode
  message: ReactNode
  /** The way back. Render it with {@link ERROR_ACTION_CLASS}. */
  action: ReactNode
  /**
   * The heading level `heading` opens, in the document the error state lands in.
   *
   * Defaults to `1`, and that is not a compromise: this component replaces the
   * page rather than sitting inside one — its own ground, its own viewport, its
   * own top clearance — so the page's single `h1` is the one it renders. Kept
   * as the default, existing call sites render exactly the markup they did.
   *
   * The prop exists because the level was previously fixed, and the one piece
   * of advice this component's documentation gives about headings — do not put
   * it inside a shell that already has an `h1` — was advice a caller had no way
   * to take. Now they do: inside a shell that owns the page heading, pass `2`.
   *
   * The size does not follow the level. `heading` renders at `--fs-heading` at
   * every level; a failure demoted in the outline is the same failure.
   */
  level?: HeadingLevel
}

/**
 * The recovery affordance's look, exported so every error page offers the same
 * one rather than each inventing a link style.
 */
export const ERROR_ACTION_CLASS =
  'text-sm text-(--ink) underline decoration-(--rule-2) underline-offset-4 transition-colors duration-(--duration-fast) hover:decoration-(--ink)'

/**
 * A page that could not be shown.
 *
 * The code is set at the top of the type ladder and marked `aria-hidden` — read
 * aloud, "404" before the sentence explaining it is noise, and the heading
 * immediately after says the same thing in words.
 *
 * @example
 * <ErrorState
 *   code="404"
 *   heading="Page not found"
 *   message="The page you're looking for has moved, or never existed."
 *   action={<a href="/" className={ERROR_ACTION_CLASS}>Back home</a>}
 * />
 * @example
 * // Inside a shell that already owns the page's h1.
 * <ErrorState level={2} code="503" heading="Invoices could not be loaded" … />
 */
export function ErrorState({
  code,
  heading,
  message,
  action,
  level = 1,
  className,
  ...rest
}: ErrorStateProps) {
  return (
    <section
      className={cn('flex min-h-svh flex-col justify-center bg-(--paper) pt-24', className)}
      {...rest}
    >
      <div className="mx-auto w-full max-w-(--w-page) px-(--page-pad)">
        {/* `leading-tight`, not `leading-none`. At the title step this face
            draws about 62px of ink, and a line box of exactly the font size is
            47 — so the figures overflowed their own box by seven pixels at the
            top and seven at the bottom, pressing up against the eyebrow above
            and eating half the gap to the heading below. The box that says
            nothing is spaced from is the box the ink is actually in. */}
        <p
          aria-hidden="true"
          className="m-0 font-heading text-[length:var(--fs-title)] leading-tight text-(--ink)"
        >
          {code}
        </p>
        <Heading level={level} size="heading" className="mb-4 mt-6">
          {heading}
        </Heading>
        <p className="mb-10 max-w-(--measure-record) text-base leading-relaxed text-(--ink-3-aa)">
          {message}
        </p>
        {action}
      </div>
    </section>
  )
}

export default ErrorState
