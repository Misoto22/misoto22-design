'use client'

import { useSyncExternalStore } from 'react'
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
 * These four are the ones sonner reads unconditionally. The status pairs are
 * separate, below, because sonner does not.
 *
 * Cast because this `@types/react` `CSSProperties` has no custom-property index
 * signature.
 */
const TOKEN_STYLE = {
  '--normal-bg': 'var(--paper)',
  '--normal-text': 'var(--ink)',
  '--normal-border': 'var(--rule-2)',
  '--border-radius': 'var(--radius)',
  fontFamily: 'var(--sans)',
} as CSSProperties

/**
 * The status pairs, emitted only when something will read them.
 *
 * sonner scopes `--success-*` and `--error-*` to `[data-rich-colors=true]`, so
 * at this package's default they are four declarations that do nothing while
 * sitting in the element's style attribute looking like the source of a success
 * toast's colour. Conditional rather than deleted: a consumer who turns
 * `richColors` on should still get this system's status scale rather than
 * sonner's.
 */
const RICH_STYLE = {
  '--success-bg': 'var(--paper)',
  '--success-text': 'var(--ok)',
  '--success-border': 'var(--rule-2)',
  '--error-bg': 'var(--paper)',
  '--error-text': 'var(--danger)',
  '--error-border': 'var(--rule-2)',
} as CSSProperties

/**
 * The mode the APP is in, which is not the mode the operating system is in.
 *
 * `data-mode` on `<html>` is this system's switch: a pre-paint script resolves
 * it from storage, falling back to `prefers-color-scheme`, and a reader can
 * override the OS from the page. sonner's own `theme="system"` reads
 * `prefers-color-scheme` directly, so a reader on a dark machine reading a
 * light page would get a dark toast over a white page — the same defect as the
 * one this exists to fix, pointing the other way.
 */
type Mode = 'light' | 'dark'

function readMode(): Mode {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light'
}

/** Light on a server, which is what the pre-paint script also assumes. */
function readModeOnServer(): Mode {
  return 'light'
}

function subscribeToMode(onChange: () => void): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => {}
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] })
  return () => observer.disconnect()
}

/**
 * Observed rather than read once: the Toaster is mounted at the app root and
 * outlives every theme switch a reader makes under it.
 */
function useMode(): Mode {
  return useSyncExternalStore(subscribeToMode, readMode, readModeOnServer)
}

/**
 * Transient confirmations, mounted once near the app root.
 *
 * A toast is for something that succeeded and needs no response. Anything the
 * reader must act on belongs in the page — a toast is dismissed by time, and
 * time is not an acknowledgement.
 *
 * `theme` follows `data-mode`. sonner defaults to `light` and hard-codes the
 * description's colour per theme — `#3f3f3f`, overridden only under
 * `[data-sonner-theme=dark]` — so a Toaster that never passed `theme` put dark
 * grey text on this system's `--paper: #0d0d0d` and every
 * `toast(title, { description })` lost its second half. Pass `theme` yourself
 * and that wins; sonner's own `system` is the one value not to reach for, since
 * it reads the OS rather than the attribute the page is actually painted from.
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
  theme,
  style,
  ...rest
}: ToasterProps) {
  const mode = useMode()

  return (
    <SonnerToaster
      position={position}
      closeButton={closeButton}
      richColors={richColors}
      theme={theme ?? mode}
      style={{ ...TOKEN_STYLE, ...(richColors ? RICH_STYLE : null), ...style }}
      {...rest}
    />
  )
}

export { toast }
export default Toaster
