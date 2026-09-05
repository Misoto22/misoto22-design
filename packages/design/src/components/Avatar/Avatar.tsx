'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export interface AvatarProps extends Omit<ComponentProps<typeof AvatarPrimitive.Root>, 'children'> {
  src?: string
  /**
   * Describes the person, not the picture. Empty string is correct and
   * deliberate when the name is already printed beside the avatar — repeating
   * it makes a screen reader say it twice.
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
 * @example
 * <Avatar src={user.photo} alt={user.name} fallback="HC" />
 */
export function Avatar({ src, alt, fallback, size = 'md', className, ...rest }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full border border-(--rule) bg-(--stone)',
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {src && (
        <AvatarPrimitive.Image src={src} alt={alt} className="size-full object-cover" />
      )}
      <AvatarPrimitive.Fallback
        // Nothing to announce: either the image's alt carries the identity, or
        // the name is printed beside it. Initials read aloud are noise.
        aria-hidden="true"
        className="grid size-full place-items-center font-mono uppercase tracking-wider text-(--ink-3-aa)"
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export default Avatar
