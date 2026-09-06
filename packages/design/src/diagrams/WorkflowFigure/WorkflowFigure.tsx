'use client'

import { useId, useMemo } from 'react'
import { DiagramFrame, type FigureChrome, type FigureModel } from '../lib/frame'
import { inflate, round, textWidth, TYPE, union, wrapText, type Box } from '../lib/geometry'
import { resolveLegend, variantLegend } from '../lib/legend'
import { BandFrame, NodePlate, PLATE, plateHeight } from '../lib/marks'
import { renderWires, wiresFor, type Wire } from '../lib/wires'
import type { Variant, WorkflowEdge, WorkflowSpec } from '../spec'

const VARIANTS: (Variant | 'return')[] = ['default', 'emphasis', 'security', 'dashed']

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
 * way — dashed and soft — so the exception path recedes without disappearing.
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

  const boxes = new Map<string, Box>()
  const placed = spec.nodes.map((node) => {
    const w = node.width ?? GRID.colW
    const lines = wrapText(node.label, TYPE.label, w - PLATE.padX * 2, 2)
    const h = plateHeight(lines.length, Boolean(node.sublabel), true, node.height ?? 0)
    const index = laneIndex.get(node.lane) ?? 0

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

  const wires = wiresFor(spec.edges, boxes, (edge: WorkflowEdge): Partial<Wire> => {
    const onMain = mainPairs.has(`${edge.from}→${edge.to}`)
    return {
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
      {/* Phases: one header rule across the figure, with a caption per span. */}
      {(spec.phases ?? []).length > 0 && (
        <path
          d={`M ${round(GRID.railW)} ${round(headerY + 8)} H ${round(extent.x + extent.w - 20)}`}
          className="stroke-(--diagram-rule)"
          strokeWidth={1}
          aria-hidden="true"
        />
      )}
      {(spec.phases ?? []).map((phase) => (
        <text
          key={phase.id}
          x={round(colX(phase.fromCol))}
          y={round(headerY)}
          className="fill-(--diagram-ink-3) font-mono [font-size:9px] [letter-spacing:0.14em] uppercase"
          aria-hidden="true"
        >
          {phase.label}
        </text>
      ))}

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
        const index = laneIndex.get(group.lane) ?? 0
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

  const used = [...new Set((spec.edges ?? []).map((edge) => edge.variant ?? 'default'))]

  return {
    extent,
    artwork,
    nodes: spec.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      kind: node.type,
    })),
    edges: (spec.edges ?? []).map((edge) => ({
      from: edge.from,
      to: edge.to,
      label: edge.label,
    })),
    legend: variantLegend(
      resolveLegend(used, spec.meta.legend?.mode, VARIANTS, spec.meta.legend?.entries),
      spec.meta.legend?.entries,
    ),
  }
}

export default WorkflowFigure
