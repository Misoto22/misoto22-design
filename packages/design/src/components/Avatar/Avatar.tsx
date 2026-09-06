'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export interface AvatarProps extends Omit<ComponentProps<typeof AvatarPrimitive.Root>, 'children'> {
  src?: string
  /**
   * Describes the person, not the picture. It names the circle itself rather
   * than the image inside it, because the image is the optional half and most
   * rows of a real list render as initials.
   *
   * Empty string is correct and deliberate when the name is already printed
   * beside the avatar: the circle then leaves the accessibility tree entirely,
   * rather than repeating a name a screen reader has just read.
   */
  alt: string
  /** Shown while the image loads and if it never does. Usually initials. */
  fallback: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-[11px]',
  lg: 'size-12 text-[13px]',
} as const

/**
 * A person, as a circle.
 *
 * Wraps Radix so the fallback appears only after the image has actually failed
 * or is still loading — a hand-rolled `onError` swap flashes the initials on
 * every render before the cache answers.
 *
 * The ROOT carries the accessible name, not the image. `alt` on the image
 * reaches the DOM only when `src` does, and the initials are aria-hidden, so an
 * avatar with no photograph announced nothing at all however carefully `alt`
 * was written — and a user list where photographs are optional is full of them.
 *
 * @example
 * <Avatar src={user.photo} alt={user.name} fallback="HC" />
 */
export function Avatar({ src, alt, fallback, size = 'md', className, ...rest }: AvatarProps) {
  // An empty alt takes no role at all rather than an unnamed one: `role="img"`
  // with nothing to say is a violation, and the empty string exists precisely
  // to say there is nothing to add.
  const named = alt.trim() !== ''

  return (
    <AvatarPrimitive.Root
      role={named ? 'img' : undefined}
      aria-label={named ? alt : undefined}
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full border border-(--rule) bg-(--stone)',
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {src && (
        // Empty, deliberately: the root above is the one element that names
        // this person, and a second name here is the same person read twice.
        <AvatarPrimitive.Image src={src} alt="" className="size-full object-cover" />
      )}
      <AvatarPrimitive.Fallback
        // Nothing to announce: the root carries the identity whether or not the
        // photograph ever arrives. Initials read aloud are noise.
        aria-hidden="true"
        className="grid size-full place-items-center font-mono uppercase tracking-wider text-(--ink-3-aa)"
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export default Avatar
