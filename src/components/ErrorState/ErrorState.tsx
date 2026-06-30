import type { ReactNode } from 'react'

export interface ErrorStateProps {
  code: ReactNode
  heading: ReactNode
  message: ReactNode
  action: ReactNode
}

/**
 * Shared underline-link class for the `action` slot, so error pages keep one
 * consistent recovery affordance.
 */
export const ERROR_ACTION_CLASS =
  'text-sm text-(--foreground) underline underline-offset-4 decoration-(--border-color) hover:decoration-(--foreground) transition-colors duration-300'

/**
 * Full-page error / not-found layout with a giant display code, heading, message
 * and a recovery action. Render the action with {@link ERROR_ACTION_CLASS}.
 *
 * @example
 * <ErrorState
 *   code="404"
 *   heading="Page not found"
 *   message="The page you're looking for has moved or never existed."
 *   action={<a href="/" className={ERROR_ACTION_CLASS}>Back home</a>}
 * />
 */
export function ErrorState({ code, heading, message, action }: ErrorStateProps) {
  return (
    <section className="pt-24 min-h-svh bg-(--background) flex flex-col justify-center">
      <div className="max-w-(--w-page) mx-auto px-(--page-pad)">
        <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl text-(--foreground) mb-4">
          {code}
        </h1>
        <h2 className="font-heading text-2xl md:text-3xl text-(--foreground) mb-4">{heading}</h2>
        <p className="text-(--secondary-text) text-lg mb-10 leading-relaxed">{message}</p>
        {action}
      </div>
    </section>
  )
}

export default ErrorState
