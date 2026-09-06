'use client'

import { useId, useMemo } from 'react'
import { liveEdges, useSpecIdentity, warnUnknownLane } from '../lib/dev'
import { DiagramFrame, type FigureBand, type FigureChrome, type FigureModel } from '../lib/frame'
import { inflate, round, textWidth, TYPE, union, wrapText, type Box } from '../lib/geometry'
import { resolveLegend, variantLegend } from '../lib/legend'
import { BandFrame, NodePlate, PLATE, plateHeight } from '../lib/marks'
import { renderWires, wiresFor, type Wire } from '../lib/wires'
import type { Variant, WorkflowEdge, WorkflowEdgeRole, WorkflowSpec } from '../spec'

const VARIANTS: (Variant | 'return')[] = ['default', 'emphasis', 'security', 'dashed']

/**
 * What a ROLE does to the line, where the author did not say it with a variant.
 *
 * `role` is about meaning and `variant` is about drawing, and for three of the
 * five roles the two answers coincide: an asynchronous hop and a path to the
 * exception lane are both the quiet line this system already has. `main` and
 * `branch` are deliberately absent — a main edge is heavier because `mainPath`
 * lists it, and a branch is simply an edge that is not on it, so both are
 * already carried by weight rather than by a second dash pattern.
 *
 * An explicit `variant` always wins: the author drew it on purpose.
 */
const ROLE_VARIANT: Partial<Record<WorkflowEdgeRole, Variant>> = {
  async: 'dashed',
  error: 'dashed',
}

/** How a line is drawn, once its role has had its say. */
const variantOf = (edge: WorkflowEdge): Variant | undefined =>
  edge.variant ?? (edge.role ? ROLE_VARIANT[edge.role] : undefined)

const GRID = {
  /** The gutter the lane names live in. */
  railW: 118,
  originY: 74,
  colW: 168,
  gapX: 58,
  laneH: 92,
  laneGap: 40,
}

export interface WorkflowFigureProps extends FigureChrome {
  spec: WorkflowSpec
}

/**
 * A process: who does what, in what order, and where it can go wrong.
 *
 * Three structures stacked on one grid, and they are three because they answer
 * three different questions a reader brings to a runbook.
 *
 * **Lanes** are rows and answer WHO. A lane marked `exception` is the one band
 * that gets a wash rather than a rule, and it earns the exception to the
 * frames-are-rules law because nothing routes across it — it IS the ground for
 * the failure path, not a frame drawn over the happy one.
 *
 * **Phases** are columns across every lane and answer WHEN. Printed as captions
 * on one header rule, because a phase is an axis label. **Groups** are frames
 * inside a single lane and answer WHAT BELONGS TOGETHER — a planning loop, an
 * evidence path.
 *
 * THE MAIN PATH IS HEAVIER, and that is the whole hierarchy. `mainPath` lists
 * the node ids a reader should be able to follow without thinking. Every edge
 * between two consecutive ids on it is drawn at the emphasis weight whatever
 * its own variant says, which is the one thing that turns fourteen boxes and
 * nineteen arrows into a diagram with a subject. An `error` role goes the other
 * way — dashed and soft — so the exception path recedes without disappearing,
 * and so does `async`. `branch` adds no stroke of its own: a branch is an edge
 * the main path does not list, and that is already the difference on the page.
 */
export function WorkflowFigure({
  spec,
  className,
  legend = 'auto',
  cards = true,
  heading = true,
  activeIds,
  onSelectNode,
}: WorkflowFigureProps) {
  const uid = useId().replace(/:/g, '')
  useSpecIdentity(spec, 'WorkflowFigure')
  const model = useMemo(
    () => buildModel(spec, uid, activeIds, onSelectNode),
    [spec, uid, activeIds, onSelectNode],
  )

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

/** The x of a column's left edge, and of the whole span from `from` to `to`. */
const colX = (col: number) => GRID.railW + col * (GRID.colW + GRID.gapX)
const spanBox = (fromCol: number, toCol: number, y: number, h: number): Box => ({
  x: colX(fromCol),
  y,
  w: colX(toCol) + GRID.colW - colX(fromCol),
  h,
})

function buildModel(
  spec: WorkflowSpec,
  uid: string,
  activeIds: string[] | undefined,
  onSelectNode: ((id: string) => void) | undefined,
): FigureModel {
  const laneIndex = new Map(spec.lanes.map((lane, index) => [lane.id, index]))
  const laneY = (index: number) => GRID.originY + index * (GRID.laneH + GRID.laneGap)

  // A lane id nothing declares still resolves to a row — there is nowhere else
  // to put the box — so the only thing that separates "I meant lane 0" from
  // "the renderer gave up" is being told.
  const laneOf = (id: string, owner: string) => {
    const index = laneIndex.get(id)
    if (index !== undefined) return index
    warnUnknownLane('WorkflowFigure', owner, id)
    return 0
  }

  const boxes = new Map<string, Box>()
  const placed = spec.nodes.map((node) => {
    const w = node.width ?? GRID.colW
    const lines = wrapText(node.label, TYPE.label, w - PLATE.padX * 2, 2)
    const h = plateHeight(lines.length, Boolean(node.sublabel), true, node.height ?? 0)
    const index = laneOf(node.lane, node.id)

    const box: Box = {
      x: colX(node.col),
      y: laneY(index) + (GRID.laneH - h) / 2 + (node.yOffset ?? 0),
      w,
      h,
    }
    boxes.set(node.id, box)
    return { node, box, lane: index }
  })

  // Consecutive pairs on the main path, so the edge between them can be drawn
  // at the weight that says "follow this one".
  const mainPairs = new Set<string>()
  for (let index = 0; index < (spec.mainPath?.length ?? 0) - 1; index += 1) {
    mainPairs.add(`${spec.mainPath![index]}→${spec.mainPath![index + 1]}`)
  }

  const edges = liveEdges('WorkflowFigure', spec.edges, (id) => boxes.has(id))
  const wires = wiresFor(edges, boxes, (edge: WorkflowEdge): Partial<Wire> => {
    const onMain = mainPairs.has(`${edge.from}→${edge.to}`)
    const variant = variantOf(edge)
    return {
      edge: variant === edge.variant ? edge : { ...edge, variant },
      weight: onMain ? 2.1 : undefined,
      open: edge.role === 'return',
    }
  })
  const { paths, labels } = renderWires(wires, uid)

  // A lane's band spans what the lane actually holds. Starting it at the rail
  // instead ran the exception wash under the label gutter, which made the
  // gutter look like part of the band rather than like the axis it is.
  const laneBoxes = spec.lanes.map((lane, index) => {
    const inside = placed.filter((entry) => entry.lane === index).map((entry) => entry.box)
    const span = union(inside)
    const left = span ? span.x - 14 : GRID.railW - 14
    return {
      lane,
      index,
      box: {
        x: left,
        y: laneY(index) - 8,
        w: (span ? span.x + span.w + 14 : colX(0) + GRID.colW) - left,
        h: GRID.laneH + 16,
      } as Box,
    }
  })

  const drawn = [...boxes.values(), ...laneBoxes.map((entry) => entry.box)]
  const headerY = GRID.originY - 30

  // The frame has to hold what is printed OUTSIDE the boxes too: the lane names
  // in the gutter and the phase captions above the header rule. Sizing the
  // extent from the boxes alone clipped both — and a clipped axis label is the
  // one kind of overflow a reader reads as a broken renderer rather than as a
  // long word.
  const railTextW = Math.max(0, ...spec.lanes.map((lane) => textWidth(lane.label, 9)))
  const raw = union(drawn) ?? { x: 0, y: 0, w: 600, h: 300 }
  const left = Math.min(raw.x, GRID.railW - 26 - railTextW)
  const top = Math.min(raw.y, headerY - 14)
  const extent = inflate(
    { x: left, y: top, w: raw.x + raw.w - left, h: raw.y + raw.h - top },
    24,
  )
  const active = activeIds && activeIds.length > 0 ? new Set(activeIds) : null

  const artwork = (
    <>
      {/* Phases: one rule per phase, drawn across the columns that phase
          claims. A single rule spanning the figure made `toCol` a field the
          type accepted and the picture could not show — two phases starting in
          the same column printed their captions on top of each other, and a
          phase's extent was not a thing a reader could see. */}
      {(spec.phases ?? []).map((phase) => {
        const span = spanBox(phase.fromCol, Math.max(phase.fromCol, phase.toCol), headerY + 8, 0)
        const dashed = phase.variant === 'security' || phase.variant === 'dashed'
        return (
          <g key={phase.id} data-phase={phase.id} aria-hidden="true">
            <path
              d={`M ${round(span.x)} ${round(span.y)} H ${round(span.x + span.w)}`}
              className={
                phase.variant === 'emphasis'
                  ? 'stroke-(--diagram-rule-hard)'
                  : 'stroke-(--diagram-rule)'
              }
              strokeWidth={phase.variant === 'emphasis' ? 1.6 : 1}
              strokeDasharray={dashed ? '7 4' : undefined}
            />
            <text
              x={round(span.x)}
              y={round(headerY)}
              className="fill-(--diagram-ink-3) font-mono [font-size:9px] [letter-spacing:0.14em] uppercase"
            >
              {phase.label}
            </text>
          </g>
        )
      })}

      {/* Lanes. The exception band is the one wash in the system's diagrams. */}
      {laneBoxes.map(({ lane, box }) => (
        <g key={lane.id} aria-hidden="true">
          {lane.variant === 'exception' && (
            <rect
              x={round(box.x)}
              y={round(box.y)}
              width={round(box.w)}
              height={round(box.h)}
              rx={10}
              className="fill-(--diagram-band) [rx:var(--radius-lg)] [ry:var(--radius-lg)]"
            />
          )}
          <text
            x={round(GRID.railW - 26)}
            y={round(box.y + box.h / 2 + 3)}
            textAnchor="end"
            className="fill-(--diagram-ink-3) font-mono [font-size:9px] [letter-spacing:0.14em] uppercase"
          >
            {lane.label}
          </text>
        </g>
      ))}

      {/* Groups: a frame inside one lane. */}
      {(spec.groups ?? []).map((group) => {
        const index = laneOf(group.lane, group.id)
        return (
          <BandFrame
            key={group.id}
            box={spanBox(group.fromCol, group.toCol, laneY(index) - 2, GRID.laneH + 4)}
            label={group.label}
            dashed={group.variant === 'security'}
          />
        )
      })}

      {paths}

      {placed.map(({ node, box }) => (
        <NodePlate
          key={node.id}
          nodeId={node.id}
          box={box}
          label={node.label}
          sublabel={node.sublabel}
          tag={node.tag}
          kind={node.type}
          active={active?.has(node.id)}
          dimmed={active ? !active.has(node.id) : false}
          onSelect={onSelectNode ? () => onSelectNode(node.id) : undefined}
        />
      ))}

      {labels}
    </>
  )

  const used = [...new Set(edges.map((edge) => variantOf(edge) ?? 'default'))]

  // The lanes ARE the list's structure, not a phrase repeated on every row.
  // WHO does a step is half of where the step sits, and it was drawn only in a
  // gutter inside artwork a screen reader is told to skip.
  const bands: FigureBand[] = spec.lanes.map((lane, index) => ({
    kind: lane.variant === 'exception' ? 'Exception lane' : 'Lane',
    label: lane.label,
    ids: placed
      .filter((entry) => entry.lane === index)
      .sort((a, b) => a.node.col - b.node.col)
      .map((entry) => entry.node.id),
  }))

  return {
    extent,
    artwork,
    nodes: spec.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      kind: node.type,
    })),
    edges: edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      label: edge.label,
    })),
    bands,
    // A phase and a group both cut ACROSS the lanes, so neither can be the
    // list's structure without publishing a node twice. They are sentences.
    notes: [
      ...(spec.phases ?? []).map((phase) =>
        span('Phase', phase.label, phase.fromCol, phase.toCol, spec.nodes, ''),
      ),
      ...(spec.groups ?? []).map((group) =>
        span(
          'Group',
          group.label,
          group.fromCol,
          group.toCol,
          spec.nodes.filter((node) => node.lane === group.lane),
          ` in lane ${spec.lanes[laneIndex.get(group.lane) ?? 0]?.label ?? group.lane}`,
        ),
      ),
    ],
    legend: variantLegend(
      resolveLegend(used, spec.meta.legend?.mode, VARIANTS, spec.meta.legend?.entries),
      spec.meta.legend?.entries,
    ),
  }
}

/** One phase or group, written out: what it covers, and what is inside it. */
function span(
  kind: string,
  label: string,
  fromCol: number,
  toCol: number,
  nodes: { col: number; label: string }[],
  where: string,
): string {
  const inside = nodes.filter((node) => node.col >= fromCol && node.col <= toCol)
  const held = inside.length > 0 ? `: ${inside.map((node) => node.label).join(', ')}` : ''
  return `${kind} ${label} covers columns ${fromCol} to ${toCol}${where}${held}.`
}

export default WorkflowFigure
