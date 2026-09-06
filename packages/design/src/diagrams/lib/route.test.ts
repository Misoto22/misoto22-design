import { describe, expect, it } from 'vitest'
import { roundedPath, routeEdge, spreadPorts } from './route'
import type { Box } from './geometry'

const box = (x: number, y: number, w = 100, h = 60): Box => ({ x, y, w, h })

/** Every point in a path's `d`, in order. */
function points(d: string): [number, number][] {
  return [...d.matchAll(/(-?[\d.]+)\s+(-?[\d.]+)/g)].map(
    (match) => [Number(match[1]), Number(match[2])] as [number, number],
  )
}

describe('choosing a face', () => {
  it('separates two boxes on the axis with the larger gap', () => {
    // Side by side with a small vertical offset: a reader expects right → left,
    // and comparing CENTRES rather than gaps would flip this to top/bottom as
    // soon as the offset passed half a box.
    const route = routeEdge({ from: box(0, 0), to: box(300, 40) })
    expect(route.points[0]).toEqual([100, 30])
    expect(route.points.at(-1)).toEqual([300, 70])
  })

  it('goes over the top when the vertical gap is the larger one', () => {
    const route = routeEdge({ from: box(0, 400), to: box(20, 0) })
    expect(route.points[0]![1]).toBe(400)
    expect(route.points.at(-1)![1]).toBe(60)
  })
})

describe('a side is a direction contract', () => {
  it('leaves perpendicular to the face it named', () => {
    // The first segment must run straight out of the box. A router that took
    // the shortest path would graze the box it just left, and a reader cannot
    // then tell which of two adjacent boxes an arrow belongs to.
    const route = routeEdge({ from: box(0, 0), to: box(240, 200), fromSide: 'right', toSide: 'top' })
    const [start, next] = route.points
    expect(start![1]).toBe(next![1])
    expect(next![0]).toBeGreaterThan(start![0])
  })

  it('arrives perpendicular to the face it named', () => {
    const route = routeEdge({ from: box(0, 0), to: box(240, 200), fromSide: 'right', toSide: 'top' })
    const end = route.points.at(-1)!
    const before = route.points.at(-2)!
    expect(before[0]).toBe(end[0])
    expect(before[1]).toBeLessThan(end[1])
  })

  it('does not bend a straight route', () => {
    // `straight` is the one mode whose whole promise is that it does not turn,
    // so it gets no stub at all.
    const route = routeEdge({ from: box(0, 0), to: box(300, 0), mode: 'straight' })
    expect(route.points).toHaveLength(2)
  })
})

describe('routing behind and around', () => {
  it('runs outside both boxes when the target is behind the source', () => {
    // Right → left with the target to the LEFT: there is no room BETWEEN them
    // to dogleg through, so the channel has to sit outside the source's right
    // edge and the line doubles back from there.
    const route = routeEdge({
      from: box(400, 0),
      to: box(0, 200),
      fromSide: 'right',
      toSide: 'left',
    })
    const xs = route.points.map((point) => point[0])
    expect(Math.max(...xs)).toBeGreaterThan(500)
    // And it never cuts back through the box it came out of.
    const crossings = route.points.filter((point) => point[0] > 400 && point[0] < 500)
    expect(crossings.every((point) => point[1] === 30)).toBe(true)
  })

  it('honours a pinned channel over the midpoint it would have chosen', () => {
    const route = routeEdge({ from: box(0, 0), to: box(400, 200), channelX: 130 })
    expect(route.points.some((point) => point[0] === 130)).toBe(true)
  })

  it('drags the line through every waypoint it was given', () => {
    const route = routeEdge({ from: box(0, 0), to: box(400, 400), via: [[250, 40]] })
    expect(route.points).toContainEqual([250, 40])
  })
})

describe('the label goes on the longest segment', () => {
  it('avoids the corner, which is the part that carries the information', () => {
    const route = routeEdge({ from: box(0, 0), to: box(600, 300) })
    // The horizontal run through the mid-channel is the longest leg here, so
    // the label sits along it rather than on either turn.
    expect(route.label.axis).toBe('y')
    const corners = route.points.slice(1, -1)
    for (const corner of corners) {
      expect(Math.hypot(route.label.x - corner[0], route.label.y - corner[1])).toBeGreaterThan(8)
    }
  })
})

describe('spreading crowded faces', () => {
  it('leaves a face with one line on its midpoint', () => {
    const offsets = spreadPorts([{ face: 'a:right', ref: '0:from' }])
    expect(offsets.size).toBe(0)
  })

  it('divides a shared face evenly, in order', () => {
    const offsets = spreadPorts([
      { face: 'a:right', ref: '0:from' },
      { face: 'a:right', ref: '1:from' },
      { face: 'a:right', ref: '2:from' },
    ])
    expect([...offsets.values()]).toEqual([0.25, 0.5, 0.75])
  })

  it('keys the two ends of one line separately', () => {
    // A line's ends land on two different faces with two different amounts of
    // company. Keying by line gave both the same offset, which visibly skewed
    // every arrow touching an empty face.
    const offsets = spreadPorts([
      { face: 'a:right', ref: '0:from' },
      { face: 'a:right', ref: '1:from' },
      { face: 'b:left', ref: '0:to' },
    ])
    expect(offsets.get('0:from')).toBe(1 / 3)
    expect(offsets.get('0:to')).toBeUndefined()
  })
})

describe('turning corners', () => {
  it('rounds a corner rather than mitring it', () => {
    const d = roundedPath([
      [0, 0],
      [100, 0],
      [100, 100],
    ])
    expect(d).toContain('Q')
  })

  it('never overshoots a leg shorter than the radius', () => {
    // A corner between two three-unit legs cannot take an eight-unit radius:
    // pulled back naively, the curve's endpoints run past the segment's own
    // ends and the corner renders as a hook. The radius is clamped to a third
    // of the shorter leg, so every point stays inside the polyline's own box.
    const d = roundedPath(
      [
        [0, 0],
        [3, 0],
        [3, 3],
      ],
      8,
    )
    for (const [x, y] of points(d)) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(3)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(3)
    }
  })

  it('drops a point that repeats and a point on a straight run', () => {
    const route = routeEdge({ from: box(0, 0), to: box(300, 0) })
    // Two boxes on one row: stubs and channel all sit on the same y, so the
    // whole thing collapses to a single straight segment.
    expect(route.points).toHaveLength(2)
  })
})

describe('a nearly straight line', () => {
  it('is drawn straight when the two faces are a few units out of true', () => {
    // Two boxes on the same row are rarely on exactly the same centre, and the
    // dogleg that answers a four-unit difference is two corners and an S.
    const route = routeEdge({
      from: { x: 0, y: 0, w: 100, h: 60 },
      to: { x: 200, y: 4, w: 100, h: 60 },
    })
    expect(route.points).toHaveLength(2)
    expect(route.points[0]![1]).toBe(route.points[1]![1])
  })

  it('keeps the dogleg once the difference is a turn rather than a wobble', () => {
    const route = routeEdge({
      from: { x: 0, y: 0, w: 100, h: 60 },
      to: { x: 200, y: 120, w: 100, h: 60 },
    })
    expect(route.points.length).toBeGreaterThan(2)
  })

  it('does not slide the arrowhead off the box it points at', () => {
    // A tall target whose usable span does not reach the source's line.
    const route = routeEdge({
      from: { x: 0, y: 0, w: 100, h: 8 },
      to: { x: 200, y: 10, w: 100, h: 12 },
    })
    const end = route.points[route.points.length - 1]!
    expect(end[1]).toBeGreaterThanOrEqual(10)
    expect(end[1]).toBeLessThanOrEqual(22)
  })

  it('leaves a spread face alone, because spreading is what keeps arrowheads apart', () => {
    const straightened = routeEdge({
      from: { x: 0, y: 0, w: 100, h: 60 },
      to: { x: 200, y: 4, w: 100, h: 60 },
      toOffset: 0.3,
    })
    expect(straightened.points.length).toBeGreaterThan(2)
  })

  it('keeps the elbow on a corner turn, which is a real turn', () => {
    const route = routeEdge({
      from: { x: 0, y: 0, w: 100, h: 60 },
      to: { x: 200, y: 4, w: 100, h: 60 },
      fromSide: 'right',
      toSide: 'top',
    })
    expect(route.points.length).toBeGreaterThan(2)
  })
})
