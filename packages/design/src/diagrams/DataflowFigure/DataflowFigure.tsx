'use client'

import { useId, useMemo } from 'react'
import { DiagramFrame, type FigureChrome, type FigureModel } from '../lib/frame'
import { inflate, round, TYPE, union, wrapText, type Box } from '../lib/geometry'
import { kindLegend, resolveLegend } from '../lib/legend'
import { NodePlate, PLATE, plateHeight } from '../lib/marks'
import { renderWires, wiresFor } from '../lib/wires'
import type { DataflowSpec, NodeKind } from '../spec'

const KINDS: NodeKind[] = [
  'frontend',
  'backend',
  'database',
  'cloud',
  'security',
  'messagebus',
  'external',
]

const GRID = { originX: 40, originY: 92, colW: 184, gapX: 78, rowH: 52, nodeH: 74 }

export interface DataflowFigureProps extends FigureChrome {
  spec: DataflowSpec
}

/**
 * A pipeline: where data comes from, what happens to it, and who ends up with
 * it.
 *
 * Structurally close to an architecture map and read for a completely different
 * question, which is why it is a separate renderer rather than a preset. An
 * architecture diagram is read for "what talks to what". A data-flow diagram is
 * read for "what is IN this arrow" — and that question is why `classification`
 * gets its own mono chip under the label rather than being folded into the
 * wording. `clickstream / PII touch` and `clickstream` are two different facts,
 * and a governance reviewer is looking for the second one.
 *
 * Stages are printed as column headings on a rule across the top. They are the
 * axis of the figure: a node's `stage` is its position along the pipeline, and
 * a reader should be able to answer "how far has this got" by looking up rather
 * than by tracing arrows.
 */
export function DataflowFigure({
  spec,
  className,
  legend = 'auto',
  cards = true,
  heading = true,
  activeIds,
  onSelectNode,
}: DataflowFigureProps) {
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

function buildModel(
  spec: DataflowSpec,
  uid: string,
  activeIds: string[] | undefined,
  onSelectNode: ((id: string) => void) | undefined,
): FigureModel {
  const boxes = new Map<string, Box>()
  const placed = spec.nodes.map((node) => {
    const w = node.width ?? GRID.colW
    const lines = wrapText(node.label, TYPE.label, w - PLATE.padX * 2, 2)
    const h = plateHeight(lines.length, Boolean(node.sublabel), true, node.height ?? 0)

    const x = GRID.originX + node.stage * (GRID.colW + GRID.gapX)
    const y = GRID.originY + node.row * (GRID.rowH + GRID.nodeH) + (node.yOffset ?? 0)

    const box: Box = { x, y, w, h }
    boxes.set(node.id, box)
    return { node, box }
  })

  // Waypoints refer to the author's own grid, not this one — see
  // `Wire.keepWaypoints`. A data-flow specification always places by stage and
  // row, so there is never a case where honouring them would be correct.
  const wires = wiresFor(spec.flows, boxes)
  const { paths, labels } = renderWires(wires, uid)

  const extent = inflate(union([...boxes.values()]) ?? { x: 0, y: 0, w: 500, h: 240 }, 30)
  const headerY = Math.min(GRID.originY - 30, extent.y + 28)
  const active = activeIds && activeIds.length > 0 ? new Set(activeIds) : null

  const artwork = (
    <>
      {/* Stage headings, on one rule across the whole figure. */}
      <path
        d={`M ${round(extent.x + 14)} ${round(headerY + 8)} H ${round(extent.x + extent.w - 14)}`}
        className="stroke-(--diagram-rule) [stroke-width:1]"
        aria-hidden="true"
      />
      {spec.stages.map((stage, index) => (
        <text
          key={`${stage.label}-${index}`}
          x={round(GRID.originX + index * (GRID.colW + GRID.gapX))}
          y={round(headerY)}
          className="fill-(--diagram-ink-3) font-mono [font-size:10.5px] [letter-spacing:0.08em] uppercase"
          aria-hidden="true"
        >
          {stage.label}
        </text>
      ))}

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

  const used = [...new Set(spec.nodes.map((node) => node.type))]

  return {
    extent: { ...extent, y: headerY - 22, h: extent.h + (extent.y - (headerY - 22)) },
    artwork,
    nodes: spec.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      sublabel: node.sublabel,
      kind: node.type,
    })),
    edges: (spec.flows ?? []).map((flow) => ({
      from: flow.from,
      to: flow.to,
      label: [flow.label, flow.classification].filter(Boolean).join(' — ') || undefined,
    })),
    legend: kindLegend(
      resolveLegend(used, spec.meta.legend?.mode, KINDS, spec.meta.legend?.entries),
      spec.meta.legend?.entries,
    ),
  }
}

export default DataflowFigure
