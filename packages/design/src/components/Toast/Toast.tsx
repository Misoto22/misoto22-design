'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'
import type { ToasterProps } from 'sonner'
import type { CSSProperties } from 'react'

/**
 * Sonner's own custom properties, pointed at this system's tokens.
 *
 * Set as inline style on the Toaster rather than in a stylesheet: sonner
 * renders its list into a portal at the end of `<body>`, outside whatever
 * element a consumer's CSS is scoped to, and the inline style is the one place
 * guaranteed to reach it.
 *
 * Cast because this `@types/react` `CSSProperties` has no custom-property index
 * signature.
 */
const TOKEN_STYLE = {
  '--normal-bg': 'var(--paper)',
  '--normal-text': 'var(--ink)',
  '--normal-border': 'var(--rule-2)',
  '--success-bg': 'var(--paper)',
  '--success-text': 'var(--ok)',
  '--success-border': 'var(--rule-2)',
  '--error-bg': 'var(--paper)',
  '--error-text': 'var(--danger)',
  '--error-border': 'var(--rule-2)',
  '--border-radius': 'var(--radius)',
  fontFamily: 'var(--sans)',
} as CSSProperties

/**
 * Transient confirmations, mounted once near the app root.
 *
 * A toast is for something that succeeded and needs no response. Anything the
 * reader must act on belongs in the page — a toast is dismissed by time, and
 * time is not an acknowledgement.
 *
 * `richColors` stays off by default: sonner's rich palette is not this system's
 * status scale, and turning it on reintroduces chroma the White Reset spends
 * only on state.
 *
 * @example
 * // app root
 * <Toaster />
 * // anywhere
 * toast.success('Saved')
 */
export function Toaster({
  position = 'bottom-right',
  closeButton = true,
  richColors = false,
  style,
  ...rest
}: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      closeButton={closeButton}
      richColors={richColors}
      style={{ ...TOKEN_STYLE, ...style }}
      {...rest}
    />
  )
}

export { toast }
export default Toaster
