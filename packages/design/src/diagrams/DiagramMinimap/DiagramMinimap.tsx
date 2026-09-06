'use client'

import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { CanvasView } from '../DiagramCanvas/DiagramCanvas'

export interface DiagramMinimapProps {
  /** The whole artwork, at its natural size in CSS pixels. */
  content: { width: number; height: number }
  /** The frame the artwork is being looked at through, in CSS pixels. */
  frame: { width: number; height: number }
  /** Where that frame currently sits — a `DiagramCanvas`'s `onViewChange`. */
  view: CanvasView
  /** A miniature of the artwork. Usually the same figure, rendered again. */
  children?: ReactNode
  /** Called with a point in CONTENT coordinates when the reader picks one. */
  onSeek?: (x: number, y: number) => void
  /** How wide the map is, in CSS pixels. Height follows the aspect ratio. */
  width?: number
  className?: string
  label?: string
}

/**
 * Where you are in something bigger than the window.
 *
 * Two things at once, and both are needed: a miniature of the whole artwork,
 * and a rectangle showing which part of it the frame is currently over. The
 * miniature alone answers "what is there"; the rectangle answers "and where am
 * I", which is the question a reader who has just panned twice actually has.
 *
 * THE RECTANGLE IS DERIVED, never stored. Its position comes out of the
 * canvas's own view — the same three numbers the canvas is already transforming
 * by — divided by the map's scale. Keeping a second copy of "where the viewport
 * is" is how a minimap comes to disagree with the thing it is a map of, and a
 * map that disagrees is worse than none.
 *
 * CLICKING RECENTRES rather than jumping. `onSeek` reports a point in CONTENT
 * coordinates, which is what a canvas's `centerOn` takes. The minimap does not
 * move anything itself: it has no authority over the view, it only says where
 * the reader pointed.
 *
 * @example
 * const canvas = useRef<DiagramCanvasHandle>(null)
 * const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
 * // …
 * <DiagramMinimap
 *   content={{ width: 1400, height: 620 }}
 *   frame={{ width: 720, height: 400 }}
 *   view={view}
 *   onSeek={(x, y) => canvas.current?.centerOn(x, y)}
 * >
 *   <ArchitectureFigure spec={spec} heading={false} legend="hidden" cards={false} />
 * </DiagramMinimap>
 */
export function DiagramMinimap({
  content,
  frame,
  view,
  children,
  onSeek,
  width = 200,
  className,
  label = 'Diagram overview',
}: DiagramMinimapProps) {
  const scale = content.width > 0 ? width / content.width : 1
  const height = Math.max(1, content.height * scale)

  // The frame's rectangle in content space, then in map space. `view.x` is how
  // far the stage has been pushed, so the content coordinate at the frame's
  // top-left corner is its negation over the zoom.
  const rect = {
    x: (-view.x / view.scale) * scale,
    y: (-view.y / view.scale) * scale,
    w: (frame.width / view.scale) * scale,
    h: (frame.height / view.scale) * scale,
  }

  function seek(event: ReactPointerEvent<HTMLDivElement>) {
    if (!onSeek) return
    const box = event.currentTarget.getBoundingClientRect()
    onSeek((event.clientX - box.left) / scale, (event.clientY - box.top) / scale)
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-(--radius) border border-(--rule-2) bg-(--panel-bg)',
        className,
      )}
      style={{ width, height }}
      role="group"
      aria-label={label}
    >
      {/* The miniature is decorative: the figure it mirrors already publishes
          its own accessible summary, and a second copy would read the whole
          diagram out twice. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-0 top-0 origin-top-left"
        style={{ width: content.width, transform: `scale(${scale})` }}
      >
        {children}
      </div>

      <div
        className={cn('absolute inset-0', onSeek && 'cursor-crosshair')}
        onPointerDown={seek}
        onPointerMove={(event) => {
          if (event.buttons === 1) seek(event)
        }}
      >
        <div
          aria-hidden="true"
          className="absolute rounded-[2px] border border-(--accent) bg-(--accent-wash)"
          style={{
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${Math.max(4, rect.w)}px`,
            height: `${Math.max(4, rect.h)}px`,
          }}
        />
      </div>
    </div>
  )
}

export default DiagramMinimap
