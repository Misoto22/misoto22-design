'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Where a canvas wants an example's own demo controls drawn.
 *
 * Null when there is no canvas — a preview rendered somewhere else, or a test
 * that renders the example directly — and the controls then stay where they
 * were written.
 */
export const ExampleControlsSlot = createContext<HTMLElement | null>(null)

/**
 * An example's own knobs, drawn in the canvas toolbar rather than on the
 * specimen.
 *
 * A chart example that lets a reader switch the tooltip's ground has two
 * different things on screen: the chart, which is what the page is about, and
 * two pill groups, which are the demo's scaffolding. Drawn together they read
 * as one composition, and the scaffolding wins — it sits at the top, it is the
 * only thing with a filled ground, and it took half the card's width at the
 * system's smallest control size. A reader looking for what `BarChart` renders
 * found a settings panel.
 *
 * So they move up one band, beside LTR/RTL and the density switch, which is
 * where every other control that changes how the preview renders already
 * lives. Same row, same chrome scale. Nothing about the example's own code
 * changes — the controls are still wired in the example file, which is the
 * lesson — only where the canvas draws them.
 *
 * `generate.mjs` unwraps this element out of the printed snippet, the way it
 * already drops `export function Example` and the relative imports: it is this
 * site's furniture, not part of what a reader would paste.
 */
export function ExampleControls({ children }: { children: ReactNode }) {
  const slot = useContext(ExampleControlsSlot)
  if (!slot) return <>{children}</>
  return createPortal(children, slot)
}
