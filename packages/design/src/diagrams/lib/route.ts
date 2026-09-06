/**
 * Getting a line from one box to another.
 *
 * The routing rule this module keeps, and the reason it is worth having at all:
 * A SIDE IS A DIRECTION CONTRACT. A line that says it leaves a box's right face
 * must leave it going right, and a line that says it arrives at a top face must
 * arrive going down. A router that takes the shortest path between two anchor
 * points breaks that contract constantly — it produces a segment that grazes
 * the box it just left, and a reader cannot tell which of two adjacent boxes an
 * arrow belongs to. Every path below therefore begins and ends with a stub
 * perpendicular to its face, and the interesting geometry happens between the
 * two stubs.
 *
 * The second rule is about crowding. When several lines share one face they are
 * spread across it rather than stacked on its midpoint, because two arrowheads
 * landing on the same coordinate is one arrowhead as far as a reader is
 * concerned. Explicit routing controls opt out of the spread: an author who
 * pinned a channel has already decided where the line goes.
 */

import type { Point, RouteMode, Side } from '../spec'
import { round, type Box } from './geometry'

/** How far a line runs straight out of a face before it is allowed to turn. */
const STUB = 18

/** The turn radius on an orthogonal corner. */
const CORNER = 8

export interface RouteRequest {
  from: Box
  to: Box
  fromSide?: Side
  toSide?: Side
  mode?: RouteMode | string
  via?: Point[]
  channelX?: number
  channelY?: number
  /** 0–1 along the face, where this line's port sits. 0.5 is the midpoint. */
  fromOffset?: number
  toOffset?: number
}

export interface RoutedEdge {
  /** The `d` attribute, corners already rounded. */
  d: string
  /** The polyline before rounding — what the label placer reads. */
  points: [number, number][]
  /** Where a label wants to sit, and how the segment under it runs. */
  label: { x: number; y: number; axis: 'x' | 'y' }
  /** The last segment's direction, for the arrowhead. */
  angle: number
}

/**
 * The face a line should use when the author did not say.
 *
 * Whichever axis separates the two boxes by more wins, and the choice is made
 * on the GAP rather than on centre distance. Two boxes side by side with a
 * small vertical offset separate horizontally, which is what a reader expects;
 * comparing centres would flip that pair to top/bottom as soon as the offset
 * exceeded half a box.
 */
function autoSides(from: Box, to: Box): [Side, Side] {
  const gapX = Math.max(to.x - (from.x + from.w), from.x - (to.x + to.w))
  const gapY = Math.max(to.y - (from.y + from.h), from.y - (to.y + to.h))

  if (gapX >= gapY) {
    return to.x >= from.x ? ['right', 'left'] : ['left', 'right']
  }
  return to.y >= from.y ? ['bottom', 'top'] : ['top', 'bottom']
}

/** The point on a face where a line attaches, given its share of that face. */
function port(box: Box, side: Side, offset = 0.5): [number, number] {
  const t = Math.min(0.88, Math.max(0.12, offset))
  switch (side) {
    case 'left':
      return [box.x, box.y + box.h * t]
    case 'right':
      return [box.x + box.w, box.y + box.h * t]
    case 'top':
      return [box.x + box.w * t, box.y]
    case 'bottom':
    default:
      return [box.x + box.w * t, box.y + box.h]
  }
}

/** One step out of a face, perpendicular to it. */
function stubFrom(anchor: [number, number], side: Side, length = STUB): [number, number] {
  switch (side) {
    case 'left':
      return [anchor[0] - length, anchor[1]]
    case 'right':
      return [anchor[0] + length, anchor[1]]
    case 'top':
      return [anchor[0], anchor[1] - length]
    case 'bottom':
    default:
      return [anchor[0], anchor[1] + length]
  }
}

const isHorizontal = (side: Side) => side === 'left' || side === 'right'

/**
 * The polyline between two stub ends, kept orthogonal.
 *
 * Three cases, and they are the only three an axis-aligned router has:
 *
 * - **Facing across the same axis** (right→left, bottom→top). One dogleg
 *   through a channel halfway between them, which is the shape everybody draws
 *   by hand.
 * - **Turning a corner** (right→top). A single elbow, and WHICH elbow is
 *   decided by the outgoing axis: leaving a vertical face means running
 *   vertically first, or the line re-enters the box it just left.
 * - **Same-side or back-tracking** (right→right, or right→left with the target
 *   behind). The channel goes OUTSIDE both boxes rather than between them,
 *   because there is no room between them to go through.
 */
function connect(
  a: [number, number],
  b: [number, number],
  fromSide: Side,
  toSide: Side,
  from: Box,
  to: Box,
  channelX?: number,
  channelY?: number,
): [number, number][] {
  const fromH = isHorizontal(fromSide)
  const toH = isHorizontal(toSide)

  if (fromH && toH) {
    const forward =
      (fromSide === 'right' && b[0] >= a[0]) || (fromSide === 'left' && b[0] <= a[0])
    const x =
      channelX ??
      (forward
        ? (a[0] + b[0]) / 2
        : // Behind: run out past the far edge of both boxes and come back.
          fromSide === 'right'
          ? Math.max(a[0], to.x + to.w + STUB, from.x + from.w + STUB)
          : Math.min(a[0], to.x - STUB, from.x - STUB))
    if (Math.abs(a[1] - b[1]) < 0.5) return [a, b]
    return [a, [x, a[1]], [x, b[1]], b]
  }

  if (!fromH && !toH) {
    const forward =
      (fromSide === 'bottom' && b[1] >= a[1]) || (fromSide === 'top' && b[1] <= a[1])
    const y =
      channelY ??
      (forward
        ? (a[1] + b[1]) / 2
        : fromSide === 'bottom'
          ? Math.max(a[1], to.y + to.h + STUB, from.y + from.h + STUB)
          : Math.min(a[1], to.y - STUB, from.y - STUB))
    if (Math.abs(a[0] - b[0]) < 0.5) return [a, b]
    return [a, [a[0], y], [b[0], y], b]
  }

  // One elbow. The axis of the OUTGOING face decides which corner it is.
  return fromH ? [a, [b[0], a[1]], b] : [a, [a[0], b[1]], b]
}

/** Drops points that repeat, and collapses three points on one straight run into two. */
function simplify(points: [number, number][]): [number, number][] {
  const out: [number, number][] = []
  for (const point of points) {
    const last = out[out.length - 1]
    if (last && Math.abs(last[0] - point[0]) < 0.5 && Math.abs(last[1] - point[1]) < 0.5) continue
    out.push(point)
  }
  for (let index = 1; index < out.length - 1; ) {
    const [ax, ay] = out[index - 1]!
    const [bx, by] = out[index]!
    const [cx, cy] = out[index + 1]!
    const collinear =
      (Math.abs(ax - bx) < 0.5 && Math.abs(bx - cx) < 0.5) ||
      (Math.abs(ay - by) < 0.5 && Math.abs(by - cy) < 0.5)
    if (collinear) out.splice(index, 1)
    else index += 1
  }
  return out
}

/**
 * The polyline as a path, with the corners turned rather than mitred.
 *
 * A quadratic through the corner point, pulled back along both legs by the
 * radius. The pull-back is clamped to a third of each leg so a short segment
 * between two turns cannot produce a curve that overshoots its own endpoint —
 * which renders as a hook and is the classic artefact of rounding a polyline
 * without checking the leg lengths.
 */
export function roundedPath(points: [number, number][], radius = CORNER): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${round(points[0]![0])} ${round(points[0]![1])}`

  let d = `M ${round(points[0]![0])} ${round(points[0]![1])}`

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1]!
    const corner = points[index]!
    const next = points[index + 1]!

    const inLength = Math.hypot(corner[0] - previous[0], corner[1] - previous[1])
    const outLength = Math.hypot(next[0] - corner[0], next[1] - corner[1])
    const r = Math.min(radius, inLength / 3, outLength / 3)

    if (r < 1) {
      d += ` L ${round(corner[0])} ${round(corner[1])}`
      continue
    }

    const enter: [number, number] = [
      corner[0] + ((previous[0] - corner[0]) / inLength) * r,
      corner[1] + ((previous[1] - corner[1]) / inLength) * r,
    ]
    const leave: [number, number] = [
      corner[0] + ((next[0] - corner[0]) / outLength) * r,
      corner[1] + ((next[1] - corner[1]) / outLength) * r,
    ]

    d += ` L ${round(enter[0])} ${round(enter[1])}`
    d += ` Q ${round(corner[0])} ${round(corner[1])} ${round(leave[0])} ${round(leave[1])}`
  }

  const end = points[points.length - 1]!
  return `${d} L ${round(end[0])} ${round(end[1])}`
}

/**
 * Where the line's wording goes: the middle of its longest segment.
 *
 * The longest segment is chosen rather than the path's own midpoint because the
 * midpoint of a dogleg often lands on a corner, and a label on a corner sits
 * across both legs and masks the turn — which is the one part of the line that
 * carries information about where it went.
 */
function labelSpot(points: [number, number][]): { x: number; y: number; axis: 'x' | 'y' } {
  let best = { x: points[0]![0], y: points[0]![1], axis: 'x' as 'x' | 'y', length: -1 }

  for (let index = 0; index < points.length - 1; index += 1) {
    const a = points[index]!
    const b = points[index + 1]!
    const length = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (length > best.length) {
      best = {
        x: (a[0] + b[0]) / 2,
        y: (a[1] + b[1]) / 2,
        axis: Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]) ? 'x' : 'y',
        length,
      }
    }
  }

  return { x: best.x, y: best.y, axis: best.axis }
}

/** Routes one relationship. */
export function routeEdge(request: RouteRequest): RoutedEdge {
  const { from, to, via, channelX, channelY, mode = 'auto' } = request

  const [autoFrom, autoTo] = autoSides(from, to)
  const fromSide = request.fromSide ?? autoFrom
  const toSide = request.toSide ?? autoTo

  const start = port(from, fromSide, request.fromOffset)
  const end = port(to, toSide, request.toOffset)

  let points: [number, number][]

  if (mode === 'straight') {
    // Straight means straight: centre to centre, clipped to both faces. No
    // stubs, because a stub would bend the one route whose whole promise is
    // that it does not bend.
    points = [start, end]
  } else {
    const outward = stubFrom(start, fromSide)
    const inward = stubFrom(end, toSide)

    if (via && via.length > 0) {
      // Waypoints are honoured literally and joined orthogonally. An author who
      // reached for `via` is overruling the router, and a router that then
      // "improved" the result would make the control useless.
      points = [start, outward]
      let cursor: [number, number] = outward
      for (const waypoint of via) {
        const next: [number, number] = [waypoint[0], waypoint[1]]
        points.push([next[0], cursor[1]], next)
        cursor = next
      }
      points.push([inward[0], cursor[1]], inward, end)
    } else {
      const forced =
        mode === 'orthogonal-h' ? ('h' as const) : mode === 'orthogonal-v' ? ('v' as const) : null

      const middle =
        forced === 'h'
          ? ([outward, [inward[0], outward[1]], inward] as [number, number][])
          : forced === 'v'
            ? ([outward, [outward[0], inward[1]], inward] as [number, number][])
            : connect(outward, inward, fromSide, toSide, from, to, channelX, channelY)

      points = [start, ...middle, end]
    }
  }

  points = simplify(points)

  const last = points[points.length - 1]!
  const previous = points[points.length - 2] ?? last
  const angle = (Math.atan2(last[1] - previous[1], last[0] - previous[0]) * 180) / Math.PI

  return { d: roundedPath(points), points, label: labelSpot(points), angle }
}

/** One line's use of one face: which face, and which end of which line it is. */
export interface PortUse {
  /** The face, as `nodeId:side`. Two lines sharing this string share a face. */
  face: string
  /** This endpoint, as `edgeIndex:from` or `edgeIndex:to`. */
  ref: string
}

/**
 * Which share of its face each line gets, when several use the same one.
 *
 * A single line keeps the midpoint — spreading one line only moves it off
 * centre for no reason. Lines that carry an explicit routing control are
 * excluded by the caller before they get here, so a pinned channel is never
 * nudged out from under its pin.
 *
 * Endpoints are keyed separately rather than by line, because a line's two ends
 * land on two different faces with two different amounts of company. Keying by
 * line gave both ends the same offset, which on a figure with one crowded face
 * and one empty one visibly skewed every arrow that touched the empty side.
 */
export function spreadPorts(uses: PortUse[]): Map<string, number> {
  const byFace = new Map<string, string[]>()
  for (const use of uses) {
    const list = byFace.get(use.face)
    if (list) list.push(use.ref)
    else byFace.set(use.face, [use.ref])
  }

  const offsets = new Map<string, number>()
  for (const list of byFace.values()) {
    if (list.length < 2) continue
    list.forEach((ref, position) => {
      offsets.set(ref, (position + 1) / (list.length + 1))
    })
  }
  return offsets
}
