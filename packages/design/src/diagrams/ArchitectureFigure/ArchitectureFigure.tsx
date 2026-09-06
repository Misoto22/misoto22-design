'use client'

import { useId, useMemo } from 'react'
import { DiagramFrame, type FigureChrome, type FigureModel } from '../lib/frame'
import { inflate, TYPE, union, wrapText, type Box } from '../lib/geometry'
import { kindLegend, resolveLegend } from '../lib/legend'
import { BandFrame, NodePlate, PLATE, plateHeight } from '../lib/marks'
import { renderWires, wiresFor } from '../lib/wires'
import type { ArchitectureSpec, NodeKind } from '../spec'

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

function buildModel(
  spec: ArchitectureSpec,
  uid: string,
  activeIds: string[] | undefined,
  onSelectNode: ((id: string) => void) | undefined,
): FigureModel {
  const layout = { ...GRID, ...spec.layout }
  const [originX, originY] = layout.origin

  const boxes = new Map<string, Box>()
  const placed = spec.components.map((component) => {
    const labelWidth = component.size?.[0] ?? component.width ?? GRID.cellW
    const lines = wrapText(component.label, TYPE.label, labelWidth - PLATE.padX * 2, 2)
    const height = plateHeight(
      lines.length,
      Boolean(component.sublabel),
      Boolean(component.type || component.tag),
      component.size?.[1] ?? component.height ?? 0,
    )

    const x = component.pos ? component.pos[0] : originX + (component.col ?? 0) * (layout.cellW + layout.gapX)
    const y = component.pos ? component.pos[1] : originY + (component.row ?? 0) * (layout.cellH + layout.gapY)

    const box: Box = { x, y, w: labelWidth, h: height }
    boxes.set(component.id, box)
    return { component, box }
  })

  const boundaries = (spec.boundaries ?? []).map((boundary) => {
    const wrapped = boundary.wraps.map((id) => boxes.get(id)).filter((box): box is Box => Boolean(box))
    const extent = union(wrapped)
    return { boundary, box: extent ? inflate(extent, boundary.pad ?? 28) : null }
  })

  // A waypoint is only meaningful when both ends were placed absolutely — see
  // `Wire.keepWaypoints`. In this diagram type that is common, which is why an
  // archify architecture specification's hand-tuned routes survive the move.
  const absolute = new Set(
    spec.components.filter((component) => component.pos).map((component) => component.id),
  )
  const wires = wiresFor(spec.connections, boxes, (connection) => ({
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
    edges: (spec.connections ?? []).map((connection) => ({
      from: connection.from,
      to: connection.to,
      label: connection.label,
    })),
    legend: kindLegend(
      resolveLegend(used, spec.meta.legend?.mode, KINDS, spec.meta.legend?.entries),
      spec.meta.legend?.entries,
    ),
  }
}

export default ArchitectureFigure
