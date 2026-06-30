import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

/**
 * Quiet editorial surface — a rounded card with a hairline border and the
 * faintest lift. Compose with the named sub-parts (`CardHeader`, `CardTitle`,
 * `CardBody`, `CardFooter`) or drop children straight in.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Recent orders</CardTitle>
 *     <Badge>12</Badge>
 *   </CardHeader>
 *   <CardBody>…</CardBody>
 *   <CardFooter>Updated just now</CardFooter>
 * </Card>
 */
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-(--radius-lg) border border-(--border-subtle) bg-(--card-background) shadow-(--shadow-sm)',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

/** Card header row — title on the left, an action or marker on the right. */
export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-4 px-5 py-4 border-b border-(--border-subtle)',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

/** Display title for a card, set in the Cormorant heading face. Renders an `<h3>`. */
export function CardTitle({ className, children, ...rest }: CardTitleProps) {
  return (
    <h3 className={clsx('font-heading text-lg text-(--foreground)', className)} {...rest}>
      {children}
    </h3>
  )
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

/** The card's content well. */
export function CardBody({ className, children, ...rest }: CardBodyProps) {
  return (
    <div className={clsx('p-5', className)} {...rest}>
      {children}
    </div>
  )
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

/** Card footer — a washed strip for metadata or secondary actions. */
export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'px-5 py-4 border-t border-(--border-subtle) bg-(--accent-wash)',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Card
