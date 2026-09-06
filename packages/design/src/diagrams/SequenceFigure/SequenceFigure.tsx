'use client'

import { useId, useMemo } from 'react'
import { liveEdges, useSpecIdentity, warnUnknownRef } from '../lib/dev'
import { DiagramFrame, type FigureChrome, type FigureModel } from '../lib/frame'
import { round, textWidth, TYPE, type Box } from '../lib/geometry'
import { resolveLegend, variantLegend } from '../lib/legend'
import { EdgeLabel, NodePlate } from '../lib/marks'
import type { SequenceSpec, Variant } from '../spec'

const HEAD = { y: 44, h: 62, w: 148, gap: 40 }
const VARIANTS: (Variant | 'return')[] = ['default', 'emphasis', 'security', 'dashed', 'return']

export interface SequenceFigureProps extends FigureChrome {
  spec: SequenceSpec
}

/**
 * A call chain over time: who asks whom, in what order, and what comes back.
 *
 * The one diagram type here whose vertical axis MEANS something. Every other
 * figure's y is layout; a sequence's y is time, which is why a message carries
 * an explicit `y` rather than an index — two calls 8 units apart happened
 * together, and two 200 apart did not, and an evenly spaced list of messages
 * would erase that distinction while looking tidier.
 *
 * **Lifelines** are hairlines, not solid rules, because they are the axis
 * rather than the content. A lifeline drawn at the weight of a message is a
 * diagram where seven vertical lines compete with twelve horizontal ones.
 *
 * **Activation bars** say who is BUSY, which is the fact a sequence diagram
 * carries that a list of calls does not — the third participant's bar
 * overlapping the second's is the reason to draw them at all.
 *
 * **Segments** band the axis into phases — request, fallback, response —
 * printed as a rule with a mono caption rather than as a tinted panel, for the
 * same reason architecture boundaries are: a second ground inside the figure
 * would sit under every message label's mask.
 *
 * A `return` message is dashed AND takes an open arrowhead. Two signals rather
 * than one, because the reply is the thing a reader most often needs to pick
 * out of a dense trace, and a dash alone is doing the same work as `dashed`
 * already does for an asynchronous call.
 */
export function SequenceFigure({
  spec,
  className,
  legend = 'auto',
  cards = true,
  heading = true,
  activeIds,
  onSelectNode,
}: SequenceFigureProps) {
  const uid = useId().replace(/:/g, '')
  useSpecIdentity(spec, 'SequenceFigure')
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
  spec: SequenceSpec,
  _uid: string,
  activeIds: string[] | undefined,
  onSelectNode: ((id: string) => void) | undefined,
): FigureModel {
  // A participant's box has to hold its own name. `spread` lets the widest
  // label set the pitch for every column, which is the layout archify reaches
  // for when a fixed 86-unit column would clip a meaningful name — and
  // shortening the name instead is not a repair, it is a different diagram.
  const natural = Math.max(
    HEAD.w,
    ...spec.participants.map(
      (participant) =>
        Math.max(
          textWidth(participant.label, TYPE.label),
          textWidth(participant.sublabel ?? '', TYPE.sub),
        ) + 44,
    ),
  )
  const colW = spec.meta.column_fit === 'spread' ? natural : HEAD.w
  const pitch = colW + HEAD.gap

  const centre = new Map<string, number>()
  const heads = spec.participants.map((participant, index) => {
    const x = 40 + index * pitch
    centre.set(participant.id, x + colW / 2)
    return { participant, box: { x, y: HEAD.y, w: colW, h: HEAD.h } as Box }
  })

  // A message to a participant nothing declares has no column to be drawn
  // between, so the artwork returned null for it and the summary list went on
  // reporting a call to a raw id — the picture and its text equivalent
  // disagreeing about what the exchange contains. Both halves read this.
  const messages = liveEdges('SequenceFigure', spec.messages, (id) => centre.has(id))

  const lastY = Math.max(
    HEAD.y + HEAD.h + 80,
    ...messages.map((message) => message.y),
    ...(spec.activations ?? []).map((activation) => activation.to),
    ...(spec.segments ?? []).map((segment) => segment.to),
  )
  const lifelineBottom = lastY + 42

  const active = activeIds && activeIds.length > 0 ? new Set(activeIds) : null
  const width = 40 + spec.participants.length * pitch - HEAD.gap + 40

  const artwork = (
    <>
      {/* Segments first: they are the ground the whole exchange happens on. */}
      {(spec.segments ?? []).map((segment, index) => (
        <g key={`segment-${index}`} aria-hidden="true">
          <path
            d={`M 20 ${round(segment.from)} H ${round(width - 20)}`}
            className="stroke-(--diagram-rule) [stroke-width:1] [stroke-dasharray:2_4]"
          />
          <rect
            x={20}
            y={round(segment.from - 7)}
            width={round(textWidth(segment.label, TYPE.band) + 14)}
            height={14}
            className="fill-(--diagram-surface)"
          />
          <text
            x={27}
            y={round(segment.from + 3.5)}
            className="fill-(--diagram-ink-3) font-mono [font-size:10.5px] [letter-spacing:0.08em] uppercase"
          >
            {segment.label}
          </text>
        </g>
      ))}

      {/* Lifelines. */}
      {heads.map(({ participant, box }) => (
        <path
          key={`life-${participant.id}`}
          d={`M ${round(box.x + colW / 2)} ${round(box.y + box.h)} V ${round(lifelineBottom)}`}
          className="stroke-(--diagram-rule) [stroke-width:1]"
          aria-hidden="true"
        />
      ))}

      {/* Activation bars. */}
      {(spec.activations ?? []).map((activation, index) => {
        const x = centre.get(activation.participant)
        if (x === undefined) return null

        return (
          <rect
            key={`act-${index}`}
            x={round(x - 5)}
            y={round(activation.from)}
            width={10}
            height={round(Math.max(6, activation.to - activation.from))}
            rx={2}
            className="fill-(--diagram-node-2) stroke-(--diagram-rule)"
            strokeWidth={1}
            aria-hidden="true"
          />
        )
      })}

      {/* Messages. */}
      {messages.map((message, index) => {
        const from = centre.get(message.from)
        const to = centre.get(message.to)
        if (from === undefined || to === undefined) return null
        const forward = to >= from
        const inset = 6
        const x1 = forward ? from + inset : from - inset
        const x2 = forward ? to - inset : to + inset
        return (
          <path
            key={message.id ?? `msg-${index}`}
            d={`M ${round(x1)} ${round(message.y)} H ${round(x2)}`}
            fill="none"
            data-edge={message.id}
            markerEnd={`url(#${_uid}-${messageMarker(message.variant)})`}
            className={messageClasses(message.variant)}
            {...messageStroke(message.variant)}
          />
        )
      })}

      {/* Participants, over the lines that end at them. */}
      {heads.map(({ participant, box }) => (
        <NodePlate
          key={participant.id}
          nodeId={participant.id}
          box={box}
          label={participant.label}
          sublabel={participant.sublabel}
          kind={participant.type}
          active={active?.has(participant.id)}
          dimmed={active ? !active.has(participant.id) : false}
          onSelect={onSelectNode ? () => onSelectNode(participant.id) : undefined}
        />
      ))}

      {/* Message wording last, so its mask covers every line. */}
      {messages.map((message, index) => {
        const from = centre.get(message.from)
        const to = centre.get(message.to)
        if (from === undefined || to === undefined || !message.label) return null
        return (
          <EdgeLabel
            key={`label-${message.id ?? index}`}
            x={(from + to) / 2}
            y={message.y}
            axis="x"
            text={message.label}
          />
        )
      })}
    </>
  )

  const used = [
    ...new Set(messages.map((message) => message.variant ?? 'default')),
  ] as (Variant | 'return')[]

  // The messages a span of the axis holds, which is what both a segment caption
  // and an activation bar are actually saying. Naming them by the calls inside
  // them rather than by their y bounds is the only version of that fact a
  // reader who cannot see the axis can use.
  const across = (from: number, to: number) =>
    messages
      .filter((message) => message.y >= from && message.y <= to && message.label)
      .map((message) => message.label as string)

  const named = new Map(spec.participants.map((p) => [p.id, p.label]))

  return {
    extent: { x: 0, y: 0, w: width, h: lifelineBottom + 24 },
    artwork,
    nodes: spec.participants.map((participant) => ({
      id: participant.id,
      label: participant.label,
      sublabel: participant.sublabel,
      kind: participant.type,
    })),
    edges: messages.map((message) => ({
      from: message.from,
      to: message.to,
      label: message.label,
    })),
    // Segments band the TIME axis and activations sit on a lifeline, so neither
    // groups the participants; both are statements the picture makes and the
    // list did not carry at all.
    notes: [
      ...(spec.segments ?? []).map((segment) => {
        const held = across(segment.from, segment.to)
        return held.length > 0
          ? `Phase ${segment.label} covers ${held.join(', ')}.`
          : `Phase ${segment.label} covers no message this figure labels.`
      }),
      ...(spec.activations ?? []).flatMap((activation) => {
        const who = named.get(activation.participant)
        if (who === undefined) {
          warnUnknownRef(
            'SequenceFigure',
            'activations[].participant',
            activation.participant,
            'the bar is drawn on no lifeline at all',
          )
          return []
        }
        const held = across(activation.from, activation.to)
        if (held.length > 1) return [`${who} is busy from ${held[0]} to ${held.at(-1)}.`]
        if (held.length === 1) return [`${who} is busy during ${held[0]}.`]
        return [`${who} is busy for a span none of the messages name.`]
      }),
    ],
    legend: variantLegend(
      resolveLegend(used, spec.meta.legend?.mode, VARIANTS, spec.meta.legend?.entries),
      spec.meta.legend?.entries,
    ),
  }
}

/** Which arrowhead a message ends in. */
function messageMarker(
  variant: SequenceSpec['messages'][number]['variant'],
): 'arrow' | 'arrow-strong' | 'arrow-open' {
  if (variant === 'emphasis') return 'arrow-strong'
  if (variant === 'return') return 'arrow-open'
  return 'arrow'
}

/** A message's colour. Geometry goes through attributes — see `edgeClasses`. */
function messageClasses(variant: SequenceSpec['messages'][number]['variant']): string {
  switch (variant) {
    case 'emphasis':
      return 'stroke-(--diagram-line-strong)'
    case 'return':
    case 'dashed':
      return 'stroke-(--diagram-line-soft)'
    default:
      return 'stroke-(--diagram-line)'
  }
}

/** A message's width and dash pattern. Heavier than a map's line: it IS the content. */
function messageStroke(variant: SequenceSpec['messages'][number]['variant']): {
  strokeWidth: number
  strokeDasharray?: string
} {
  switch (variant) {
    case 'emphasis':
      return { strokeWidth: 2 }
    case 'security':
      return { strokeWidth: 1.4, strokeDasharray: '6 3' }
    case 'return':
      return { strokeWidth: 1.2, strokeDasharray: '4 3.5' }
    case 'dashed':
      return { strokeWidth: 1.2, strokeDasharray: '3 3' }
    default:
      return { strokeWidth: 1.4 }
  }
}

export default SequenceFigure
