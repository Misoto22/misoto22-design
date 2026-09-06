'use client'

import { useId, useMemo } from 'react'
import { DiagramFrame, type FigureChrome, type FigureModel } from '../lib/frame'
import { inflate, round, TYPE, textWidth, union, wrapText, type Box } from '../lib/geometry'
import { resolveLegend, stateLegend } from '../lib/legend'
import { Chip, PLATE, plateHeight, StatePlate } from '../lib/marks'
import { renderWires, wiresFor } from '../lib/wires'
import type { LifecycleSpec, LifecycleStateKind } from '../spec'

const KINDS: LifecycleStateKind[] = [
  'start',
  'active',
  'waiting',
  'decision',
  'success',
  'failure',
  'neutral',
  'external',
]

const GRID = { originX: 132, originY: 56, colW: 158, gapX: 62, laneGap: 52, stateH: 68 }

/**
 * How far a secondary lane's columns are shifted along the main rail.
 *
 * archify's lifecycle contract: the first lane holds the ordered phases in
 * columns 0–4, and a secondary lane's column N sits exactly beneath main column
 * N + 2. It is a convention rather than a derivation — the alternative would be
 * making every author restate a column index they already implied — and
 * honouring it is what keeps `executing → approval` a straight vertical drop
 * instead of a dogleg across two unrelated states.
 */
const SECONDARY_LANE_OFFSET = 2

/** How much horizontal room a state's own shape leaves for its name. */
function textRoom(width: number, kind: LifecycleStateKind): number {
  return kind === 'decision' ? width * 0.56 : width - PLATE.padX * 2
}

export interface LifecycleFigureProps extends FigureChrome {
  spec: LifecycleSpec
}

/**
 * A state machine: what something can BE, and what moves it.
 *
 * The one figure here that spends colour, and it spends exactly the two tokens
 * this system reserves for state: `--success` on a terminal success,
 * `--danger` on a terminal failure. Nothing else in the package is allowed
 * those two, and a lifecycle diagram is the case they were reserved for — the
 * whole point of the picture is which end a run came out of.
 *
 * The other six kinds are carried by shape, so a greyscale print loses the two
 * outcomes' hue and keeps every other distinction: a start is a filled cap, a
 * decision is a diamond, a wait is a dashed frame, an external is a plate with
 * a cut corner.
 *
 * A RECOVERABLE FAILURE IS A FAILURE WITH A WAY BACK. `type: "failure"` says
 * how a state is drawn; a transition OUT of it is what says whether the run is
 * over. A retryable error and a terminal one look identical until you follow
 * the arrows, which is correct — the difference between them is a real edge in
 * the machine, not an adjective on a box.
 */
export function LifecycleFigure({
  spec,
  className,
  legend = 'auto',
  cards = true,
  heading = true,
  activeIds,
  onSelectNode,
}: LifecycleFigureProps) {
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
  spec: LifecycleSpec,
  uid: string,
  activeIds: string[] | undefined,
  onSelectNode: ((id: string) => void) | undefined,
): FigureModel {
  const lanes = spec.lanes ?? [{ id: '', label: '' }]
  const laneIndex = new Map(lanes.map((lane, index) => [lane.id, index]))

  const boxes = new Map<string, Box>()
  const placed = spec.states.map((state) => {
    // A diamond is only half as wide as its box where the label crosses it, so
    // it gets a wider box for the same words. Sizing it like a rectangle is
    // what pushes a decision's name out past its own two sloping edges.
    const w = state.width ?? (state.type === 'decision' ? GRID.colW + 34 : GRID.colW)
    const lines = wrapText(state.label, TYPE.label, textRoom(w, state.type), 2)
    const h = plateHeight(lines.length, Boolean(state.sublabel), true, state.height ?? GRID.stateH)

    const lane = laneIndex.get(state.lane ?? '') ?? 0
    const col = state.col + (lane === 0 ? 0 : SECONDARY_LANE_OFFSET)

    // `yOffset` is deliberately NOT applied. It is an absolute nudge measured in
    // archify's own lane heights, and this renderer's lanes are a different
    // depth — so a 78-unit push that cleared a neighbour there drops a state
    // squarely on top of the lane below here. Two overlapping plates are worse
    // than a state sitting on its lane's centre line, which is where the
    // specification put it before the nudge.
    const x = GRID.originX + col * (GRID.colW + GRID.gapX)
    const y = GRID.originY + lane * (GRID.stateH + GRID.laneGap)

    const box: Box = { x, y, w, h }
    boxes.set(state.id, box)
    return { state, box, lane }
  })

  // The main rail is IMPLICIT, and has to be. archify's lifecycle contract
  // gives the first lane's columns 0..4 to the ordered phases and does not ask
  // an author to restate `queued → planning → executing` as transitions —
  // those are the diagram's spine, not its exceptions. Without them drawn, the
  // top row reads as five unconnected boxes.
  const rail = placed
    .filter((entry) => entry.lane === 0)
    .sort((a, b) => a.state.col - b.state.col)
  const declared = new Set((spec.transitions ?? []).map((t) => `${t.from}→${t.to}`))
  const implied = rail
    .slice(0, -1)
    .map((entry, index) => ({ from: entry.state.id, to: rail[index + 1]!.state.id }))
    .filter((edge) => !declared.has(`${edge.from}→${edge.to}`))

  const wires = [
    ...wiresFor(implied, boxes, () => ({ weight: 2.1 })),
    ...wiresFor(spec.transitions, boxes),
  ]
  const { paths, labels } = renderWires(wires, uid)

  const extent = inflate(union([...boxes.values()]) ?? { x: 0, y: 0, w: 500, h: 240 }, 34)
  const active = activeIds && activeIds.length > 0 ? new Set(activeIds) : null

  // A lane's rule spans what it actually holds. Drawing it across the figure's
  // full width would claim a band reaches columns nothing in it occupies.
  const laneRules = lanes.map((lane, index) => {
    const inside = placed.filter((entry) => entry.lane === index).map((entry) => entry.box)
    const span = union(inside)
    return span ? { lane, y: span.y - 16, x1: extent.x + 18, x2: span.x + span.w } : null
  })

  const artwork = (
    <>
      {laneRules.map((rule, index) =>
        rule && rule.lane.label ? (
          <g key={`lane-${index}`} aria-hidden="true">
            <path
              d={`M ${round(rule.x1)} ${round(rule.y)} H ${round(rule.x2)}`}
              className="stroke-(--diagram-rule) [stroke-width:1]"
            />
            <text
              x={round(rule.x1)}
              y={round(rule.y - 7)}
              className="fill-(--diagram-ink-3) font-mono [font-size:10.5px] [letter-spacing:0.08em] uppercase"
            >
              {rule.lane.label}
            </text>
          </g>
        ) : null,
      )}

      {paths}

      {placed.map(({ state, box }) => {
        const lines = wrapText(state.label, TYPE.label, textRoom(box.w, state.type), 2)
        const bottomReserve = state.tag ? 20 : 0
        const blockHeight = lines.length * (TYPE.label * 1.25) + (state.sublabel ? TYPE.sub * 1.5 : 0)
        const top = box.y + (box.h - bottomReserve - blockHeight) / 2
        const reversed = state.type === 'start'
        const centreX = box.x + box.w / 2

        return (
          <g
            key={state.id}
            data-node={state.id}
            data-active={active?.has(state.id) ? '' : undefined}
            className={active && !active.has(state.id) ? 'opacity-25' : undefined}
            onClick={onSelectNode ? () => onSelectNode(state.id) : undefined}
          >
            <StatePlate box={box} kind={state.type}>
              {active?.has(state.id) && (
                <rect
                  x={round(box.x) - 3}
                  y={round(box.y) - 3}
                  width={round(box.w) + 6}
                  height={round(box.h) + 6}
                  rx={9}
                  fill="none"
                  className="stroke-(--accent) [stroke-width:1.4]"
                />
              )}
              {state.step && (
                <text
                  x={round(box.x + 10)}
                  y={round(box.y + 15)}
                  className={
                    reversed
                      ? 'fill-(--diagram-plate-ink) font-mono [font-size:9.5px] opacity-70'
                      : 'fill-(--diagram-ink-3) font-mono [font-size:9.5px]'
                  }
                >
                  {state.step}
                </text>
              )}
              {lines.map((line, index) => (
                <text
                  key={index}
                  x={round(centreX)}
                  y={round(top + (index + 1) * TYPE.label * 1.25 - 3.5)}
                  textAnchor="middle"
                  className={
                    reversed
                      ? 'fill-(--diagram-plate-ink) font-sans [font-size:13px]'
                      : 'fill-(--diagram-ink) font-sans [font-size:13px]'
                  }
                >
                  {line}
                </text>
              ))}
              {state.sublabel && (
                <text
                  x={round(centreX)}
                  y={round(top + lines.length * TYPE.label * 1.25 + TYPE.sub)}
                  textAnchor="middle"
                  className={
                    reversed
                      ? 'fill-(--diagram-plate-ink) font-mono [font-size:10.5px] opacity-70'
                      : 'fill-(--diagram-ink-3) font-mono [font-size:10.5px]'
                  }
                >
                  {state.sublabel}
                </text>
              )}
              {state.tag && <Chip x={centreX} y={box.y + box.h - 9} text={state.tag} align="middle" />}
            </StatePlate>
          </g>
        )
      })}

      {labels}

    </>
  )

  const used = [...new Set(spec.states.map((state) => state.type))]
  const widest = Math.max(
    0,
    ...lanes.map((lane) => textWidth(lane.label, TYPE.band)),
  )

  // Widening the frame to the LEFT for the lane names has to widen it, not
  // slide it: moving `x` without adding the same amount to `w` trims exactly
  // that much off the right-hand edge, which cost the last column of states.
  const railLeft = Math.min(extent.x, GRID.originX - widest - 30)

  return {
    extent: { ...extent, x: railLeft, w: extent.w + (extent.x - railLeft) },
    artwork,
    nodes: spec.states.map((state) => ({
      id: state.id,
      label: state.label,
      sublabel: state.sublabel,
      kind: state.type,
    })),
    edges: (spec.transitions ?? []).map((transition) => ({
      from: transition.from,
      to: transition.to,
      label: [transition.label, transition.note].filter(Boolean).join(' — ') || undefined,
    })),
    legend: stateLegend(
      resolveLegend(used, spec.meta.legend?.mode, KINDS, spec.meta.legend?.entries),
      spec.meta.legend?.entries,
    ),
  }
}

export default LifecycleFigure
