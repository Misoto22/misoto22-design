import type { ReactNode } from 'react'
import type { EdgeBase, Side, Variant } from '../spec'
import type { Box } from './geometry'
import { edgeClasses, EdgeLabel, edgeMarker, edgeStroke } from './marks'
import { resolveSides, routeEdge, spreadPorts, type PortUse } from './route'

/** One line to draw, once its two boxes are known. */
export interface Wire {
  edge: EdgeBase & { variant?: Variant | 'return'; classification?: string; note?: string }
  from: Box
  to: Box
  /** Overrides the variant's own stroke weight — a main path drawn heavier. */
  weight?: number
  /** An open arrowhead rather than a filled one. */
  open?: boolean
  /**
   * Whether this line's `via` / `channelX` / `channelY` mean anything here.
   *
   * A waypoint is an ABSOLUTE coordinate in whatever space the author's nodes
   * were placed in. When a specification pins its nodes with `pos`, that space
   * is this renderer's space too and the waypoints land exactly where they were
   * meant to. When the nodes are placed from a lane and a column, this renderer
   * chose the coordinates — so the author's waypoints refer to a grid that does
   * not exist here, and following them drags lines across unrelated nodes.
   *
   * So the rule is per line and not per figure: honour the waypoints when both
   * of a line's endpoints were placed absolutely, and route automatically
   * otherwise. Defaults to false, which is the safe half.
   */
  keepWaypoints?: boolean
}

/**
 * Every line in a figure, routed together.
 *
 * Together rather than one at a time, because port spreading is a property of a
 * FACE and not of a line: how far off centre a given arrow sits depends on how
 * many others land on the same face, which no single line can know. Routing
 * them independently is what produces three arrowheads stacked on one point.
 *
 * Lines that pin their own geometry — `via`, a channel, an explicit side — opt
 * out of the spread. An author who placed a line has already answered the
 * question the spread exists to answer, and moving it afterwards makes the
 * control useless.
 *
 * Returns the paths and the labels separately because ORDER IS THE MASK: a
 * label's plate has to be painted over every line in the figure, not merely
 * over its own. Interleaving them puts the third line on top of the first
 * line's label.
 */
export function renderWires(
  wires: Wire[],
  uid: string,
): { paths: ReactNode; labels: ReactNode } {
  const uses: PortUse[] = []

  wires.forEach((wire, index) => {
    const { edge } = wire
    const pinned =
      wire.keepWaypoints === true &&
      Boolean(edge.via?.length || edge.channelX !== undefined || edge.channelY !== undefined)
    if (pinned) return
    // The face this line will REALLY use, not the word "auto". Keyed on the
    // word, every auto-routed line leaving one node counted as sharing a face
    // with every other — so a node with one line going right and one going down
    // had both nudged off centre to make room for each other on a face neither
    // of them was on, and every one of those lines then arrived at a few units
    // out of true and drew a dogleg to cover the difference.
    const [fromSide, toSide] = resolveSides(
      wire.from,
      wire.to,
      edge.fromSide as Side | undefined,
      edge.toSide as Side | undefined,
    )
    uses.push({ face: `${edge.from}:${fromSide}`, ref: `${index}:from` })
    uses.push({ face: `${edge.to}:${toSide}`, ref: `${index}:to` })
  })

  const offsets = spreadPorts(uses)

  const routed = wires.map((wire, index) => {
    const { edge } = wire
    const keep = wire.keepWaypoints === true
    return {
      wire,
      index,
      route: routeEdge({
        from: wire.from,
        to: wire.to,
        fromSide: edge.fromSide as Side | undefined,
        toSide: edge.toSide as Side | undefined,
        mode: edge.route,
        via: keep ? edge.via : undefined,
        channelX: keep ? edge.channelX : undefined,
        channelY: keep ? edge.channelY : undefined,
        fromOffset: offsets.get(`${index}:from`),
        toOffset: offsets.get(`${index}:to`),
      }),
    }
  })

  return {
    paths: (
      <g data-diagram-wires="">
        {routed.map(({ wire, index, route }) => (
          <path
            key={wire.edge.id ?? index}
            d={route.d}
            fill="none"
            data-edge={wire.edge.id}
            markerEnd={`url(#${uid}-${wire.open ? 'arrow-open' : edgeMarker(wire.edge.variant)})`}
            className={edgeClasses(wire.edge.variant)}
            {...edgeStroke(wire.edge.variant, wire.weight)}
          />
        ))}
      </g>
    ),
    labels: (
      <g data-diagram-wire-labels="">
        {routed.map(({ wire, index, route }) =>
          wire.edge.label ? (
            /* `labelDx` / `labelDy` / `labelAt` are deliberately NOT applied.
               They are collision repairs authored against archify's router,
               measured in the positions THAT router produced — and this one
               does not produce the same collisions, so honouring them moves
               labels off clear ground and onto the nodes they were nudged away
               from. Dropping the nudge and keeping the wording is the reading
               that preserves the meaning; the field stays in the type so a
               specification carrying it still typechecks. */
            <EdgeLabel
              key={wire.edge.id ?? index}
              x={route.label.x}
              y={route.label.y}
              axis={route.label.axis}
              text={wire.edge.label}
              chip={wire.edge.classification}
              note={wire.edge.note}
            />
          ) : null,
        )}
      </g>
    ),
  }
}

/** Resolves an edge's endpoints against a box index, dropping any that dangle. */
export function wiresFor<E extends EdgeBase>(
  edges: E[] | undefined,
  boxes: Map<string, Box>,
  decorate?: (edge: E) => Partial<Wire>,
): Wire[] {
  if (!edges) return []
  const out: Wire[] = []
  for (const edge of edges) {
    const from = boxes.get(edge.from)
    const to = boxes.get(edge.to)
    // A relationship naming a node that is not in the figure is a specification
    // error, and drawing it from nowhere to nowhere would hide that. The
    // figures filter the same edges through `liveEdges` before they get here,
    // so the drop is announced once in development and the summary list agrees
    // with the picture; this guard is what makes that agreement structural
    // rather than a convention every renderer has to remember.
    if (!from || !to) continue
    out.push({ edge, from, to, ...decorate?.(edge) })
  }
  return out
}
