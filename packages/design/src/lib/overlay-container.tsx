'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

const OverlayContainerContext = createContext<HTMLElement | null>(null)

export interface OverlayContainerProps {
  /** The element overlays should render into. `null` restores the default. */
  container: HTMLElement | null
  children: ReactNode
}

/**
 * Redirects every overlay in the subtree — popover, select, menu, tooltip — into
 * a given element instead of `document.body`.
 *
 * Two problems, one cause. An overlay portalled to the body is positioned
 * against the VIEWPORT, so inside a bounded frame (a documentation example, a
 * device preview, a canvas) it flips and shifts against edges the reader cannot
 * see, and lands outside the box it belongs to. It also leaves the subtree, so
 * `dir="rtl"` and `data-density` set on that frame stop reaching it.
 *
 * Naming the container fixes both: the panel renders inside the frame,
 * inherits what the frame declares, and collides with the frame's edges.
 *
 * The container must be positioned (`relative` is enough) for the panel to be
 * placed against it rather than against the nearest positioned ancestor.
 *
 * @example
 * const [frame, setFrame] = useState<HTMLElement | null>(null)
 * <div ref={setFrame} className="relative" data-density="compact">
 *   <OverlayContainer container={frame}>{children}</OverlayContainer>
 * </div>
 */
export function OverlayContainer({ container, children }: OverlayContainerProps) {
  return <OverlayContainerContext value={container}>{children}</OverlayContainerContext>
}

/**
 * The element overlays in this subtree should render into, or `null` for the
 * document body. Every portal in the library reads this.
 */
export function useOverlayContainer(): HTMLElement | null {
  return useContext(OverlayContainerContext)
}
