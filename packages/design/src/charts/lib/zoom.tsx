'use client'

import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { cn } from '../../lib/cn'
import type { ChartBrushRange } from './brush'

/**
 * How far a single zoom step closes the window. Half is the step every map and
 * every chart toolbar has trained readers to expect from a `+`.
 */
const ZOOM_STEP = 0.5

/** The fewest rows a zoom will leave on screen — the brush's floor, so the two agree. */
const MIN_SPAN = 2

/**
 * How far the pointer has to travel before a press counts as a region
 * selection. Below this it is a click on the plot, which belongs to the tooltip
 * and to a series' own `isClickable`.
 */
const DRAG_THRESHOLD = 8

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(value, high))
}

/**
 * A range pulled back inside the data, with the minimum span enforced.
 *
 * Every other function here ends by calling this, so an inverted range, an
 * index past the end and a window narrower than `minSpan` all have exactly one
 * definition of what they become.
 */
export function clampWindow(
  range: ChartBrushRange,
  total: number,
  minSpan: number = MIN_SPAN,
): ChartBrushRange {
  const maxIndex = Math.max(0, total - 1)
  if (maxIndex === 0) return { startIndex: 0, endIndex: 0 }

  const limit = Math.min(minSpan, maxIndex)
  let startIndex = clamp(Math.round(range.startIndex), 0, maxIndex)
  let endIndex = clamp(Math.round(range.endIndex), 0, maxIndex)
  if (endIndex < startIndex) [startIndex, endIndex] = [endIndex, startIndex]

  if (endIndex - startIndex < limit) {
    endIndex = Math.min(startIndex + limit, maxIndex)
    startIndex = Math.max(0, endIndex - limit)
  }

  return { startIndex, endIndex }
}

/**
 * The window after one zoom step.
 *
 * `factor` below 1 closes the window and above 1 opens it. `anchor` is the row
 * index that must stay where it is on screen — the pointer's row for a wheel
 * zoom, the window's own centre for a button — because a zoom that re-centres
 * is a zoom that loses the point the reader was looking at.
 *
 * The span is floored when closing and ceiled when opening rather than rounded
 * in both directions, so a step always moves: rounding leaves a three-row
 * window stuck at three when the step is a half.
 */
export function zoomWindow(
  range: ChartBrushRange,
  total: number,
  factor: number,
  minSpan: number = MIN_SPAN,
  anchor?: number,
): ChartBrushRange {
  const maxIndex = Math.max(0, total - 1)
  if (maxIndex === 0) return { startIndex: 0, endIndex: 0 }

  const current = clampWindow(range, total, minSpan)
  const span = current.endIndex - current.startIndex
  const limit = Math.min(minSpan, maxIndex)
  const raw = span * factor
  const nextSpan = clamp(factor < 1 ? Math.floor(raw) : Math.ceil(raw), limit, maxIndex)

  const pivot = clamp(anchor ?? (current.startIndex + current.endIndex) / 2, 0, maxIndex)
  // Where the pivot sits across the window, 0 at the start and 1 at the end.
  // Holding that fraction is what keeps the anchored row under the pointer.
  const ratio = span > 0 ? (pivot - current.startIndex) / span : 0.5
  const startIndex = clamp(Math.round(pivot - ratio * nextSpan), 0, maxIndex - nextSpan)

  return { startIndex, endIndex: startIndex + nextSpan }
}

/**
 * The window slid along by `delta` rows, keeping its span.
 *
 * At either end it stops rather than shrinking. A pan that narrowed itself
 * against the edge would change the scale under the reader, which is a
 * different gesture from the one they made.
 */
export function panWindow(range: ChartBrushRange, total: number, delta: number): ChartBrushRange {
  const maxIndex = Math.max(0, total - 1)
  if (maxIndex === 0) return { startIndex: 0, endIndex: 0 }

  const current = clampWindow(range, total, 0)
  const span = current.endIndex - current.startIndex
  const startIndex = clamp(current.startIndex + Math.round(delta), 0, maxIndex - span)

  return { startIndex, endIndex: startIndex + span }
}

export interface ChartZoomOptions<TData extends Record<string, unknown>> {
  /** The whole dataset. The window is expressed as indexes into it. */
  data: TData[]
  /** The row field behind a row's name, used by the spoken window description. */
  xDataKey?: keyof TData & string
  /** The fewest rows a zoom will leave on screen. */
  minSpan?: number
  /** The fraction of the window one zoom step keeps. */
  step?: number
  /** Fires whenever the window changes, from any of the four inputs. */
  onZoomChange?: (range: ChartBrushRange) => void
}

export interface ChartZoom<TData extends Record<string, unknown> = Record<string, unknown>> {
  /** The rows on screen, as indexes into the whole dataset. */
  range: ChartBrushRange
  /** The rows the plot should draw. */
  visibleData: TData[]
  /** Whether anything is hidden — what "reset zoom" is enabled by. */
  isZoomed: boolean
  canZoomIn: boolean
  canZoomOut: boolean
  /** Closes the window one step around `anchor`, or around its own centre. */
  zoomIn: (anchor?: number) => void
  /** Opens the window one step around `anchor`, or around its own centre. */
  zoomOut: (anchor?: number) => void
  /** Back to the whole dataset. */
  reset: () => void
  /** Slides the window by a number of rows, keeping its span. */
  panBy: (delta: number) => void
  /** Jumps straight to a window — what a drag across the plot commits. */
  zoomTo: (range: ChartBrushRange) => void
  /** How many rows there are in total. */
  total: number
  /** A row's name, for an announcement or a label. */
  labelAt: (index: number) => string
  /** Spread onto `<ChartBrush>` to make it a controlled view of this window. */
  brushProps: {
    startIndex: number
    endIndex: number
    onChange: (range: ChartBrushRange) => void
  }
}

/**
 * A windowed view of a chart's rows, driven by the toolbar, the wheel, a drag
 * across the plot, and the keyboard.
 *
 * ## How this composes with `<Chart.Brush>`
 *
 * They are two views of ONE window, not two windows. This hook owns
 * `{ startIndex, endIndex }`; the brush is rendered controlled from it through
 * `brushProps` and reports back through the same commit path the toolbar
 * buttons use. So dragging a brush handle moves the toolbar's idea of the
 * window, "reset zoom" snaps the handles back to the full range, and neither
 * part has to know the other exists.
 *
 * The alternative — a zoom window layered on top of a brushed slice — was
 * rejected because it needs a composition rule ("zoom is relative to the
 * brush") that nobody can predict from the call site, and because it makes
 * reset ambiguous: reset the zoom, the brush, or both.
 *
 * This is a superset of `useChartBrush`, so a chart that can carry a toolbar
 * uses it in place of that hook rather than running the two side by side.
 *
 * @example
 * const zoom = useChartZoom({ data, xDataKey: 'month' })
 * <ChartBrush data={data} config={config} {...zoom.brushProps} />
 */
export function useChartZoom<TData extends Record<string, unknown>>({
  data,
  xDataKey,
  minSpan = MIN_SPAN,
  step = ZOOM_STEP,
  onZoomChange,
}: ChartZoomOptions<TData>): ChartZoom<TData> {
  const total = data.length
  const maxIndex = Math.max(0, total - 1)

  const [range, setRange] = useState<ChartBrushRange>({ startIndex: 0, endIndex: maxIndex })

  // The committed window, mirrored in a ref so the commands below can stay
  // stable across renders. The wheel listener is attached natively and would
  // otherwise be torn down and re-attached on every step.
  const committed = useRef(range)

  useEffect(() => {
    const whole = { startIndex: 0, endIndex: Math.max(0, data.length - 1) }
    committed.current = whole
    setRange(whole)
  }, [data.length])

  const commit = useCallback(
    (next: ChartBrushRange) => {
      const clamped = clampWindow(next, total, minSpan)
      const last = committed.current
      if (last.startIndex === clamped.startIndex && last.endIndex === clamped.endIndex) return

      committed.current = clamped
      setRange(clamped)
      // The control that moved has to keep up with the pointer; the plot does
      // not. Deferring lets React drop intermediate windows during a drag.
      startTransition(() => onZoomChange?.(clamped))
    },
    [minSpan, onZoomChange, total],
  )

  const zoomIn = useCallback(
    (anchor?: number) => commit(zoomWindow(committed.current, total, step, minSpan, anchor)),
    [commit, minSpan, step, total],
  )

  const zoomOut = useCallback(
    (anchor?: number) => commit(zoomWindow(committed.current, total, 1 / step, minSpan, anchor)),
    [commit, minSpan, step, total],
  )

  const reset = useCallback(
    () => commit({ startIndex: 0, endIndex: Math.max(0, total - 1) }),
    [commit, total],
  )

  const panBy = useCallback(
    (delta: number) => commit(panWindow(committed.current, total, delta)),
    [commit, total],
  )

  const zoomTo = useCallback((next: ChartBrushRange) => commit(next), [commit])

  const labelAt = useCallback(
    (index: number) => {
      if (!xDataKey) return String(index + 1)
      const value = data[index]?.[xDataKey]
      return value === null || value === undefined ? String(index + 1) : String(value)
    },
    [data, xDataKey],
  )

  // The slice runs on a deferred copy of the window, so the control that moved
  // re-renders at pointer cadence and the plot at whatever it can manage.
  const deferred = useDeferredValue(range)
  const visibleData = useMemo(
    () => data.slice(deferred.startIndex, deferred.endIndex + 1),
    [data, deferred.endIndex, deferred.startIndex],
  )

  const brushProps = useMemo(
    () => ({ startIndex: range.startIndex, endIndex: range.endIndex, onChange: commit }),
    [commit, range.endIndex, range.startIndex],
  )

  const isZoomed = range.startIndex > 0 || range.endIndex < maxIndex

  return useMemo(
    () => ({
      range,
      visibleData,
      isZoomed,
      canZoomIn: range.endIndex - range.startIndex > Math.min(minSpan, maxIndex),
      canZoomOut: isZoomed,
      zoomIn,
      zoomOut,
      reset,
      panBy,
      zoomTo,
      total,
      labelAt,
      brushProps,
    }),
    [
      brushProps,
      isZoomed,
      labelAt,
      maxIndex,
      minSpan,
      panBy,
      range,
      reset,
      total,
      visibleData,
      zoomIn,
      zoomOut,
      zoomTo,
    ],
  )
}

export interface ChartZoomSurfaceProps {
  /** The window this surface drives. */
  zoom: ChartZoom
  /** Names the region for a screen reader — pass the figure's title. */
  label: string
  /**
   * Off leaves the plot inert while the toolbar buttons keep working. Use it
   * for a chart whose only control is export.
   */
  enabled?: boolean
  /** The plot's box, handed out because the PNG export needs the measured one. */
  ref?: RefObject<HTMLDivElement | null>
  children: ReactNode
}

/**
 * The plot, made zoomable and pannable by pointer AND by keyboard.
 *
 * The keyboard half is not a nicety. A chart whose only zoom is a drag gesture
 * is a chart a keyboard user can watch and cannot operate, which is the exact
 * failure the brush was rewritten to fix — so the surface is focusable, carries
 * its instructions in an `aria-describedby` note, and announces the window it
 * moved to through a polite live region.
 *
 * Arrow keys pan by a row, `PageUp`/`PageDown` by a screenful, `Home`/`End`
 * jump to the ends, `+`/`-` zoom and `0` resets. `ArrowLeft` means EARLIER in
 * every writing direction, matching the brush: the rendering engine lays a
 * cartesian plot out left-to-right whatever `dir` says, so mirroring the keys
 * would put "earlier" on the side the data does not run to.
 *
 * The wheel is deliberately gated behind Ctrl or Cmd. A chart that swallowed a
 * plain wheel event traps the page's scroll under the pointer, which is the
 * single most complained-about behaviour in an embedded map.
 */
export function ChartZoomSurface({
  zoom,
  label,
  enabled = true,
  ref,
  children,
}: ChartZoomSurfaceProps) {
  const fallbackRef = useRef<HTMLDivElement>(null)
  const surfaceRef = ref ?? fallbackRef
  const hintId = `chart-zoom-hint-${useId().replace(/:/g, '')}`

  const drag = useRef<{ pointerId: number; originX: number } | null>(null)
  const [selection, setSelection] = useState<{ start: number; width: number } | null>(null)

  /** The row index under a client x, read from the plot's own measured box. */
  const indexAt = useCallback(
    (clientX: number): number | undefined => {
      const node = surfaceRef.current
      const box = node ? plotBox(node) : null
      if (!box) return undefined
      const fraction = clamp((clientX - box.left) / box.width, 0, 1)
      return zoom.range.startIndex + fraction * (zoom.range.endIndex - zoom.range.startIndex)
    },
    [surfaceRef, zoom.range.endIndex, zoom.range.startIndex],
  )

  useEffect(() => {
    const node = surfaceRef.current
    if (!node || !enabled) return

    // Attached natively rather than through `onWheel`, because React registers
    // its wheel listener passively — `preventDefault` from a React handler is a
    // console warning and a page that zooms anyway.
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const anchor = indexAt(event.clientX)
      if (event.deltaY < 0) zoom.zoomIn(anchor)
      else zoom.zoomOut(anchor)
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [enabled, indexAt, surfaceRef, zoom])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || event.button !== 0) return
    // No `preventDefault` here on purpose: it would cancel the compatibility
    // mouse events the tooltip and a mark's own click handler run on.
    drag.current = { pointerId: event.pointerId, originX: event.clientX }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return

    const travelled = Math.abs(event.clientX - state.originX)
    if (travelled < DRAG_THRESHOLD) return

    const node = surfaceRef.current
    const box = node ? plotBox(node) : null
    if (!node || !box) return

    if (!node.hasPointerCapture(event.pointerId)) node.setPointerCapture(event.pointerId)

    const from = Math.min(state.originX, event.clientX)
    setSelection({ start: from - box.left, width: travelled })
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    drag.current = null
    setSelection(null)

    const node = surfaceRef.current
    if (node?.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId)
    if (!state || Math.abs(event.clientX - state.originX) < DRAG_THRESHOLD) return

    const from = indexAt(Math.min(state.originX, event.clientX))
    const to = indexAt(Math.max(state.originX, event.clientX))
    if (from === undefined || to === undefined) return

    zoom.zoomTo({ startIndex: Math.floor(from), endIndex: Math.ceil(to) })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!enabled) return
    const span = zoom.range.endIndex - zoom.range.startIndex

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        zoom.panBy(-1)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        zoom.panBy(1)
        break
      case 'PageDown':
        zoom.panBy(-Math.max(1, span))
        break
      case 'PageUp':
        zoom.panBy(Math.max(1, span))
        break
      case 'Home':
        zoom.panBy(-zoom.total)
        break
      case 'End':
        zoom.panBy(zoom.total)
        break
      case '+':
      case '=':
        zoom.zoomIn()
        break
      case '-':
      case '_':
        zoom.zoomOut()
        break
      case '0':
        zoom.reset()
        break
      default:
        return
    }

    event.preventDefault()
  }

  const shown = zoom.range.endIndex - zoom.range.startIndex + 1

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div
        ref={surfaceRef}
        role="group"
        aria-label={`${label} — plot`}
        aria-describedby={enabled ? hintId : undefined}
        tabIndex={enabled ? 0 : undefined}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          'relative flex min-h-0 w-full flex-1 flex-col rounded-(--radius-sm)',
          // Vertical scrolling still belongs to the page; horizontal movement
          // is the pan gesture, so the browser must not claim it first.
          enabled && 'touch-pan-y',
          selection && 'select-none',
        )}
      >
        {children}

        {selection && (
          // Positioned with inline style rather than `start-`/`end-` classes,
          // for the same reason the brush is: the axis being selected along is
          // the DATA's, and a cartesian plot runs left-to-right under
          // `dir="rtl"` too.
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 z-(--z-rule) border-x border-(--rule-2) bg-(--ink)/8"
            style={{ left: selection.start, width: selection.width }}
          />
        )}
      </div>

      {enabled && (
        <>
          <p id={hintId} className="sr-only">
            Arrow keys pan by one point, Page Up and Page Down by a screenful, Home and End jump to
            the ends. Plus and minus zoom, zero resets. Ctrl and the wheel zoom around the pointer,
            and dragging across the plot zooms to that span.
          </p>
          <p aria-live="polite" className="sr-only">
            {`Showing ${zoom.labelAt(zoom.range.startIndex)} to ${zoom.labelAt(
              zoom.range.endIndex,
            )}, ${shown} of ${zoom.total} points`}
          </p>
        </>
      )}
    </div>
  )
}

/**
 * The measured box of the PLOT, not of the wrapper around it.
 *
 * The wrapper carries the toolbar row and the brush footer, and the plot's own
 * `<svg>` carries the axis gutter, so mapping a pointer through either is off
 * by enough to feel wrong at the ends of a drag. The grid is the one element
 * whose box IS the plot area, so it is tried first; the surface is the fallback
 * for a chart composed without `<Chart.Grid>`.
 */
function plotBox(surface: HTMLElement): DOMRect | null {
  const grid = surface.querySelector('.recharts-cartesian-grid')
  const gridBox = grid?.getBoundingClientRect()
  if (gridBox && gridBox.width > 0) return gridBox

  const svg = surface.querySelector('svg.recharts-surface')
  const svgBox = svg?.getBoundingClientRect()
  return svgBox && svgBox.width > 0 ? svgBox : null
}
