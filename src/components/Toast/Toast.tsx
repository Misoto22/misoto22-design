'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'
import type { ToasterProps } from 'sonner'
import type { CSSProperties } from 'react'

/**
 * Map sonner's CSS variables onto the misoto22 tokens so toasts inherit the look.
 * Cast because this `@types/react` CSSProperties has no custom-property index.
 */
const TOKEN_STYLE = {
  '--normal-bg': 'var(--card-background)',
  '--normal-text': 'var(--foreground)',
  '--normal-border': 'var(--border-color)',
  '--border-radius': 'var(--radius)',
  fontFamily: 'var(--font-sans)',
} as CSSProperties

/**
 * sonner `Toaster` preconfigured to the design tokens. Mount once near the app
 * root; trigger toasts anywhere via the re-exported {@link toast}. Any
 * `ToasterProps` override is forwarded; `style` is merged over the token defaults.
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
