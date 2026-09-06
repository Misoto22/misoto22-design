'use client'

import { useId, useMemo } from 'react'
import { liveEdges, useSpecIdentity, warnCollision } from '../lib/dev'
import { DiagramFrame, type FigureChrome, type FigureModel } from '../lib/frame'
import { inflate, round, TYPE, union, wrapText, type Box } from '../lib/geometry'
import { kindLegend, resolveLegend } from '../lib/legend'
import { BandFrame, NodePlate, PLATE, plateHeight } from '../lib/marks'
import { renderWires, wiresFor } from '../lib/wires'
import type { ArchitectureComponent, ArchitectureSpec, NodeKind } from '../spec'

const KINDS: NodeKind[] = [
  'frontend',
  'backend',
  'database',
  'cloud',
  'security',
  'messagebus',
  'external',
]

/** What a cell is, when the specification does not say. */
const GRID = { origin: [40, 48] as [number, number], cols: 4, cellW: 184, cellH: 72, gapX: 64, gapY: 76 }

export interface ArchitectureFigureProps extends FigureChrome {
  spec: ArchitectureSpec
}

/**
 * A component map: services, datastores, boundaries, and what talks to what.
 *
 * Takes the same JSON an archify `architecture` specification carries —
 * `components`, `boundaries`, `connections` — and draws it in this system's own
 * terms: paper plates on a hairline, one reversed plate for the component the
 * diagram is about, and seven drawn sigils where archify uses seven hues.
 *
 * IT RENDERS ON A SERVER because every position is already in the
 * specification. A component gives a `row` and a `col` into a grid whose cell
 * size is either declared or defaulted, or it gives an absolute `pos` — nothing
 * here is solved for, relaxed, or measured. So the markup is a pure function of
 * the input, it is identical on the server and in the browser, and there is no
 * layout shift on hydration because there is no layout to do.
 *
 * A component that declares NEITHER flows: it takes the next free cell in
 * declaration order, wrapping at `layout.cols`. That is still arithmetic on
 * numbers the specification carries rather than a solver — and the alternative
 * was every unplaced component defaulting to row 0, column 0 and stacking into
 * one plate.
 *
 * BOUNDARIES ARE DRAWN FIRST, AND DRAWN DIFFERENTLY. A `region` is where
 * something RUNS — a VPC, a zone, a cluster — and is a solid frame. A
 * `security-group` is what may REACH it, and is dashed. That is not decoration:
 * an infrastructure diagram is very often read for exactly one of those two
 * questions, and a reader should be able to tell which line answers which
 * without reading either label.
 *
 * @example
 * <ArchitectureFigure
 *   spec={{
 *     meta: { title: 'Request path' },
 *     components: [
 *       { id: 'cdn', type: 'cloud', label: 'CloudFront', row: 0, col: 0 },
 *       { id: 'api', type: 'backend', label: 'FastAPI', sublabel: 'ECS', row: 0, col: 1 },
 *       { id: 'db', type: 'database', label: 'Postgres', row: 0, col: 2 },
 *     ],
 *     connections: [
 *       { from: 'cdn', to: 'api', label: 'HTTPS' },
 *       { from: 'api', to: 'db', label: 'SQL' },
 *     ],
 *   }}
 * />
 */
export function ArchitectureFigure({
  spec,
  className,
  legend = 'auto',
  cards = true,
  heading = true,
  activeIds,
  onSelectNode,
}: ArchitectureFigureProps) {
  const uid = useId().replace(/:/g, '')
  useSpecIdentity(spec, 'ArchitectureFigure')
  const model = useMemo(() => buildModel(spec, uid, activeIds, onSelectNode), [spec, uid, activeIds, onSelectNode])

  return (
    <DiagramFrame
      meta={spec.meta}
      model={model}
      cards={spec.cards}
      showCards={cards}
      heading={heading}
      legend={legend}
      className={className}
      activeIds={activeIds}
      onSelectNode={onSelectNode}
    />
  )
}

/**
 * Where a component sits, for a specification that did not say.
 *
 * `row` and `col` are both optional and both defaulted to 0, which meant every
 * component that declared no placement was drawn in the same cell — a figure of
 * seven services rendering as one plate with six underneath it. Reading them as
 * "put it in the next free cell" is what `layout.cols` was always for.
 *
 * Cells an explicit `row`/`col` claims are reserved before the flow starts, so
 * an author who placed three of ten components keeps those three exactly where
 * they put them.
 */
function flow(
  components: ArchitectureComponent[],
  cols: number,
): (component: ArchitectureComponent) => [row: number, col: number] {
  const claimed = new Set<string>()
  for (const component of components) {
    if (!component.pos && (component.row !== undefined || component.col !== undefined)) {
      claimed.add(`${component.row ?? 0}:${component.col ?? 0}`)
    }
  }

  let cursor = 0
  return (component) => {
    if (component.row !== undefined || component.col !== undefined) {
      return [component.row ?? 0, component.col ?? 0]
    }
    while (claimed.has(`${Math.floor(cursor / cols)}:${cursor % cols}`)) cursor += 1
    const cell: [number, number] = [Math.floor(cursor / cols), cursor % cols]
    claimed.add(`${cell[0]}:${cell[1]}`)
    cursor += 1
    return cell
  }
}

function buildModel(
  spec: ArchitectureSpec,
  uid: string,
  activeIds: string[] | undefined,
  onSelectNode: ((id: string) => void) | undefined,
): FigureModel {
  const layout = { ...GRID, ...spec.layout }
  const [originX, originY] = layout.origin
  const nextCell = flow(spec.components, Math.max(1, Math.round(layout.cols)))

  const boxes = new Map<string, Box>()
  const cells = new Map<string, string[]>()
  const named = new Map(spec.components.map((component) => [component.id, component.label]))
  const placed = spec.components.map((component) => {
    // `layout.cellW` sets the PITCH and the plate's own width. Reading the
    // module default here instead spaced the plates further apart at the width
    // they already had, which is a grid with gaps rather than wider boxes.
    const labelWidth = component.size?.[0] ?? component.width ?? layout.cellW
    const lines = wrapText(component.label, TYPE.label, labelWidth - PLATE.padX * 2, 2)
    const height = plateHeight(
      lines.length,
      Boolean(component.sublabel),
      Boolean(component.type || component.tag),
      component.size?.[1] ?? component.height ?? 0,
    )

    const [row, col] = nextCell(component)
    const x = component.pos ? component.pos[0] : originX + col * (layout.cellW + layout.gapX)
    const y = component.pos ? component.pos[1] : originY + row * (layout.cellH + layout.gapY)

    const box: Box = { x, y, w: labelWidth, h: height }
    boxes.set(component.id, box)
    cells.set(`${round(x)}:${round(y)}`, [...(cells.get(`${round(x)}:${round(y)}`) ?? []), component.id])
    return { component, box }
  })

  // Nothing else notices: two plates at one coordinate draw one on top of the
  // other, and both are still in the summary — so the mistake exists in the
  // picture and nowhere the author is looking. `warnCollision` is dev-only.
  for (const ids of cells.values()) {
    if (ids.length > 1) warnCollision('ArchitectureFigure', ids)
  }

  const boundaries = (spec.boundaries ?? []).map((boundary) => {
    const inside = boundary.wraps.filter((id) => boxes.has(id))
    const wrapped = inside.map((id) => boxes.get(id)).filter((box): box is Box => Boolean(box))
    const extent = union(wrapped)
    return { boundary, inside, box: extent ? inflate(extent, boundary.pad ?? 28) : null }
  })

  // A waypoint is only meaningful when both ends were placed absolutely — see
  // `Wire.keepWaypoints`. In this diagram type that is common, which is why an
  // archify architecture specification's hand-tuned routes survive the move.
  const absolute = new Set(
    spec.components.filter((component) => component.pos).map((component) => component.id),
  )
  const connections = liveEdges('ArchitectureFigure', spec.connections, (id) => boxes.has(id))
  const wires = wiresFor(connections, boxes, (connection) => ({
    keepWaypoints: absolute.has(connection.from) && absolute.has(connection.to),
  }))
  const { paths, labels } = renderWires(wires, uid)

  const drawn = [...boxes.values(), ...boundaries.map((entry) => entry.box).filter((box): box is Box => Boolean(box))]
  const extent = inflate(union(drawn) ?? { x: 0, y: 0, w: 400, h: 200 }, 22)

  const active = activeIds && activeIds.length > 0 ? new Set(activeIds) : null

  const artwork = (
    <>
      {boundaries.map(({ boundary, box }, index) =>
        box ? (
          <BandFrame
            key={`${boundary.label}-${index}`}
            box={box}
            label={boundary.label}
            dashed={boundary.kind === 'security-group'}
          />
        ) : null,
      )}
      {paths}
      {placed.map(({ component, box }) => (
        <NodePlate
          key={component.id}
          nodeId={component.id}
          box={box}
          label={component.label}
          sublabel={component.sublabel}
          tag={component.tag}
          kind={component.type}
          active={active?.has(component.id)}
          dimmed={active ? !active.has(component.id) : false}
          onSelect={onSelectNode ? () => onSelectNode(component.id) : undefined}
        />
      ))}
      {labels}
    </>
  )

  const used = [...new Set(spec.components.map((component) => component.type))]

  return {
    extent,
    artwork,
    nodes: spec.components.map((component) => ({
      id: component.id,
      label: component.label,
      sublabel: component.sublabel,
      kind: component.type,
    })),
    edges: connections.map((connection) => ({
      from: connection.from,
      to: connection.to,
      label: connection.label,
    })),
    // A boundary is a statement — this runs there, that may reach it — drawn as
    // a frame inside artwork a screen reader is told to skip. It groups nothing
    // in the list, because two boundaries can hold the same component and a
    // node published twice is a node the keyboard reaches twice.
    notes: boundaries.map(({ boundary, inside }) => {
      const kind = boundary.kind === 'region' ? 'Region' : 'Security group'
      const members = inside.map((id) => named.get(id) ?? id)
      return members.length > 0
        ? `${kind} ${boundary.label} encloses ${members.join(', ')}.`
        : `${kind} ${boundary.label} encloses nothing this figure draws.`
    }),
    legend: kindLegend(
      resolveLegend(used, spec.meta.legend?.mode, KINDS, spec.meta.legend?.entries),
      spec.meta.legend?.entries,
    ),
  }
}

export default ArchitectureFigure
