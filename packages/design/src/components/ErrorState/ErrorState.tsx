import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ErrorStateProps extends HTMLAttributes<HTMLElement> {
  /** The status, set large — "404", "500". Decorative; the heading carries the meaning. */
  code: ReactNode
  heading: ReactNode
  message: ReactNode
  /** The way back. Render it with {@link ERROR_ACTION_CLASS}. */
  action: ReactNode
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
 */
export function ErrorState({ code, heading, message, action, className, ...rest }: ErrorStateProps) {
  return (
    <section
      className={cn('flex min-h-svh flex-col justify-center bg-(--paper) pt-24', className)}
      {...rest}
    >
      <div className="mx-auto w-full max-w-(--w-page) px-(--page-pad)">
        <p
          aria-hidden="true"
          className="m-0 font-heading text-[length:var(--fs-title)] leading-none text-(--ink)"
        >
          {code}
        </p>
        <h1 className="mb-4 mt-6 font-heading text-[length:var(--fs-heading)] font-normal text-(--ink)">
          {heading}
        </h1>
        <p className="mb-10 max-w-(--measure-record) text-base leading-relaxed text-(--ink-3-aa)">
          {message}
        </p>
        {action}
      </div>
    </section>
  )
}

export default ErrorState
