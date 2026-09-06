/**
 * The marks every figure is drawn out of: a plate, a sigil, a line, a band.
 *
 * THE PROBLEM THIS FILE SOLVES. Archify separates seven kinds of node by hue —
 * a cyan frontend, an emerald service, a rose security boundary. This system
 * has no hue to spend: the only chroma left in it is bound to state, and the
 * rest is paper and ink. So the kind is carried TWICE, by a drawn sigil and by
 * a word, on one eyebrow line above the name.
 *
 * Two carriers rather than one, and the redundancy is the design. A 12-unit
 * glyph alone is a guess — a cylinder and a queue are four grey pixels apart at
 * reading size, and a reader who has not learnt the key is looking at smudges
 * that cost 30 units of the plate's width. A word alone scans slowly: seven
 * boxes each reading SERVICE in the same weight is a column of text, not a
 * diagram. Together the sigil does the scanning and the word does the
 * disambiguating, and the key that teaches the sigil shows the pair.
 *
 * THE HIERARCHY IS WEIGHT, RULE AND REVERSAL — the system's own law 7, and the
 * only one available once colour is spent. A plate is paper on a hairline; the
 * one node a figure is ABOUT is ink-filled; a boundary is a rule and never a
 * ground; a main path is a heavier line rather than a different one.
 *
 * Everything paints through CSS rather than through a presentation attribute,
 * because `fill="var(--ink)"` is not valid markup — a custom property has to
 * reach an SVG through a style rule. That indirection is also what makes the
 * export work: `getComputedStyle` has already substituted the variable, so a
 * serialised clone carries a real colour rather than a name nothing resolves.
 */

import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { LifecycleStateKind, NodeKind, Variant } from '../spec'
import { round, TYPE, textWidth, wrapText, type Box } from './geometry'

/** The corner radius on a plate, tracking the system's ladder. */
const PLATE_RADIUS = '[rx:var(--radius-sm)] [ry:var(--radius-sm)]' as const

/** What each kind is called on a plate's eyebrow. Short, because it is a kicker. */
export const KIND_WORD: Record<NodeKind, string> = {
  frontend: 'CLIENT',
  backend: 'SERVICE',
  database: 'DATA',
  cloud: 'CLOUD',
  security: 'POLICY',
  messagebus: 'QUEUE',
  external: 'EXTERNAL',
}

/**
 * The marker definitions every figure needs.
 *
 * Rendered once per figure. The ids are namespaced by the figure's own id
 * because two diagrams on one page would otherwise share one `<defs>`, and the
 * second figure's arrowheads would silently take the first figure's paint —
 * SVG ids are document-global, and a duplicate is resolved to whichever came
 * first rather than to the nearest one.
 */
export function DiagramDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <marker
        id={`${uid}-arrow`}
        markerWidth="11"
        markerHeight="11"
        refX="9.5"
        refY="5.5"
        orient="auto-start-reverse"
        markerUnits="userSpaceOnUse"
      >
        <path d="M 0.6 1.4 L 10 5.5 L 0.6 9.6 Z" className="fill-(--diagram-line)" />
      </marker>
      <marker
        id={`${uid}-arrow-strong`}
        markerWidth="12"
        markerHeight="12"
        refX="10.5"
        refY="6"
        orient="auto-start-reverse"
        markerUnits="userSpaceOnUse"
      >
        <path d="M 0.6 1.6 L 11 6 L 0.6 10.4 Z" className="fill-(--diagram-line-strong)" />
      </marker>
      {/* An open head, for a reply. A reader distinguishes a return from a call
          faster by the head than by the dash pattern, which is why the two are
          different shapes rather than the same shape in two weights. */}
      <marker
        id={`${uid}-arrow-open`}
        markerWidth="11"
        markerHeight="11"
        refX="9.5"
        refY="5.5"
        orient="auto-start-reverse"
        markerUnits="userSpaceOnUse"
      >
        <path
          d="M 1 1.6 L 9.6 5.5 L 1 9.4"
          fill="none"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-(--diagram-line-soft)"
        />
      </marker>
    </defs>
  )
}

/**
 * The 14×14 mark that says what kind of thing a node is.
 *
 * Drawn on a 14-unit grid at a 1.35 stroke. Both numbers went up from the first
 * pass and both had to: at 12 units and a 1.2 stroke the seven forms were a few
 * grey pixels apart at reading size, which is not a distinction — it is a
 * smudge. Every path is closed geometry rather than an icon font, because a
 * figure has to serialise into a standalone file and a font the exported
 * document cannot fetch renders as a box.
 */
export function Sigil({
  kind,
  x,
  y,
  reversed,
}: {
  kind: NodeKind
  x: number
  y: number
  reversed?: boolean
}) {
  const stroke = cn(
    'fill-none [stroke-width:1.35] [stroke-linejoin:round] [stroke-linecap:round]',
    reversed ? 'stroke-(--diagram-plate-ink)' : 'stroke-(--diagram-sigil)',
  )

  return (
    <g transform={`translate(${round(x)}, ${round(y)})`} aria-hidden="true">
      {kind === 'frontend' && (
        <g className={stroke}>
          <rect x="0.8" y="2" width="12.4" height="10" rx="1.6" />
          <path d="M 0.8 5.2 H 13.2" />
          <path d="M 3 3.6 H 4" />
        </g>
      )}
      {kind === 'backend' && (
        <g className={stroke}>
          <rect x="0.8" y="1.8" width="12.4" height="4.4" rx="1.2" />
          <rect x="0.8" y="7.8" width="12.4" height="4.4" rx="1.2" />
          <path d="M 3 4 H 4.2" />
          <path d="M 3 10 H 4.2" />
        </g>
      )}
      {kind === 'database' && (
        <g className={stroke}>
          <ellipse cx="7" cy="3.4" rx="6" ry="2.4" />
          <path d="M 1 3.4 V 10.6 A 6 2.4 0 0 0 13 10.6 V 3.4" />
          <path d="M 1 7 A 6 2.4 0 0 0 13 7" />
        </g>
      )}
      {kind === 'cloud' && (
        <g className={stroke}>
          <path d="M 3.4 10.8 A 2.9 2.9 0 0 1 3.5 5 A 3.8 3.8 0 0 1 10.5 4.2 A 3.2 3.2 0 0 1 11 10.8 Z" />
        </g>
      )}
      {kind === 'security' && (
        <g className={stroke}>
          <path d="M 7 1 L 12.5 3.1 V 7 C 12.5 10 10 12.1 7 13 C 4 12.1 1.5 10 1.5 7 V 3.1 Z" />
          <path d="M 4.7 7 L 6.4 8.7 L 9.4 5.3" />
        </g>
      )}
      {kind === 'messagebus' && (
        <g className={stroke}>
          <path d="M 0.9 2.8 H 13.1" />
          <path d="M 0.9 11.2 H 13.1" />
          <path d="M 3.6 5.2 V 8.8" />
          <path d="M 7 5.2 V 8.8" />
          <path d="M 10.4 5.2 V 8.8" />
        </g>
      )}
      {kind === 'external' && (
        <g className={stroke}>
          <path d="M 7.4 1.8 H 1.6 V 12.2 H 12.4 V 6.4" />
          <path d="M 8.4 5.4 L 13 1" />
          <path d="M 9.6 0.9 H 13.1 V 4.4" />
        </g>
      )}
    </g>
  )
}

/** How a plate is painted, given what the specification insisted on. */
function plateClasses(variant: Variant | undefined, muted: boolean): string {
  switch (variant) {
    case 'emphasis':
      return 'fill-(--diagram-plate) stroke-(--diagram-plate) [stroke-width:1]'
    case 'security':
      return 'fill-(--diagram-node) stroke-(--diagram-rule-hard) [stroke-width:1.3] [stroke-dasharray:5_3]'
    case 'dashed':
      return 'fill-(--diagram-node) stroke-(--diagram-rule) [stroke-width:1] [stroke-dasharray:4_3]'
    default:
      return muted
        ? 'fill-(--diagram-node-2) stroke-(--diagram-rule) [stroke-width:1]'
        : 'fill-(--diagram-node) stroke-(--diagram-rule) [stroke-width:1]'
  }
}

/**
 * A plate's internal vertical rhythm, in user units from its top edge.
 *
 * Written out as one object rather than computed inline in three renderers,
 * because these numbers ARE the plate: change one and the card stops looking
 * like a card. The eyebrow sits high and tight, the name is the only thing set
 * at reading size, and the sublabel hangs under it in the meta voice.
 */
export const PLATE = {
  padX: 15,
  eyebrow: 19,
  label: 39,
  sub: 53,
  lineStep: 17,
  /** Where the eyebrow lands when there is none — the label moves up into it. */
  riseWithoutEyebrow: 16,
} as const

/**
 * How tall a plate has to be to hold what it was given.
 *
 * A declared height is a FLOOR, not a ceiling. When a specification asks for a
 * 60-unit box and then puts two lines of name and a qualifier in it, honouring
 * the 60 prints the qualifier through the bottom rule — which reads as a
 * rendering fault rather than as a box asked to hold too much. Growing is
 * visible and correct; clipping is invisible and wrong.
 */
export function plateHeight(
  labelLines: number,
  hasSub: boolean,
  hasEyebrow: boolean,
  floor = 0,
): number {
  const last = hasSub ? PLATE.sub : PLATE.label
  const content =
    last + (labelLines - 1) * PLATE.lineStep + 16 - (hasEyebrow ? 0 : PLATE.riseWithoutEyebrow)
  return Math.max(floor, Math.ceil(content))
}

export interface NodePlateProps {
  box: Box
  label: string
  sublabel?: string
  tag?: string
  kind?: NodeKind
  variant?: Variant
  /** Printed in the trailing corner in mono — a step number. */
  step?: string
  /** Paints the plate on the recessed ground rather than on paper. */
  muted?: boolean
  /** Lit by a guided chapter or a reader's focus. */
  active?: boolean
  /** Dimmed because something else is lit. */
  dimmed?: boolean
  onSelect?: () => void
  /** A stable hook the viewer chrome and the tests both address nodes by. */
  nodeId?: string
}

/**
 * One box, with everything that can be printed inside it.
 *
 * Three registers, top to bottom, and each is a different voice on purpose: a
 * mono kicker naming the KIND, the name at reading size in the interface face,
 * and the qualifier back in mono. That is the same ladder a record on a page
 * uses — the diagram is not inventing a second typography for itself.
 *
 * WHAT IT IS NOT is a button, and that is deliberate. The `<svg>` around it
 * carries `role="img"`, which makes everything inside it presentational to
 * assistive technology — so a `role="button"` here would announce a control a
 * screen reader can never reach. The keyboard route to the same selection is
 * the figure's own summary list, which is a real `<ul>` of real `<button>`s
 * sitting beside the picture. `onSelect` here is the POINTER path to that same
 * action, and nothing else.
 */
export function NodePlate({
  box,
  label,
  sublabel,
  tag,
  kind,
  variant,
  step,
  muted,
  active,
  dimmed,
  onSelect,
  nodeId,
}: NodePlateProps) {
  const reversed = variant === 'emphasis'
  const lines = wrapText(label, TYPE.label, box.w - PLATE.padX * 2, 2)

  // The eyebrow slot carries the most specific thing known about this node: the
  // author's own tag when there is one, and the kind word otherwise. Giving the
  // tag a row of its own instead cost every tagged plate 22 units of height for
  // one short string, and left the plate a portrait rectangle in a figure of
  // landscape ones. The sigil never moves, so the kind is still on the plate
  // either way — which is what makes the substitution safe.
  const eyebrow = tag ?? (kind ? KIND_WORD[kind] : undefined)
  const hasEyebrow = Boolean(eyebrow || step)
  const rise = hasEyebrow ? 0 : PLATE.riseWithoutEyebrow
  const labelY = box.y + PLATE.label - rise
  const subY = box.y + PLATE.sub - rise + (lines.length - 1) * PLATE.lineStep

  return (
    <g
      data-node={nodeId}
      data-active={active ? '' : undefined}
      className={cn(
        'transition-opacity duration-(--duration-fast)',
        dimmed && 'opacity-25',
        onSelect && 'cursor-pointer',
      )}
      onClick={onSelect}
    >
      <rect
        x={round(box.x)}
        y={round(box.y)}
        width={round(box.w)}
        height={round(box.h)}
        rx={6}
        ry={6}
        className={cn(PLATE_RADIUS, plateClasses(variant, Boolean(muted)))}
      />

      {active && (
        <rect
          x={round(box.x) - 3.5}
          y={round(box.y) - 3.5}
          width={round(box.w) + 7}
          height={round(box.h) + 7}
          rx={9}
          ry={9}
          fill="none"
          className="stroke-(--accent) [stroke-width:1.5]"
        />
      )}

      {kind && (
        <Sigil
          kind={kind}
          x={box.x + PLATE.padX}
          y={box.y + PLATE.eyebrow - 11}
          reversed={reversed}
        />
      )}

      {eyebrow && (
        <text
          x={round(box.x + PLATE.padX + (kind ? 20 : 0))}
          y={round(box.y + PLATE.eyebrow)}
          className={cn(
            'font-mono [font-size:8.5px] [letter-spacing:0.13em] uppercase',
            reversed ? 'fill-(--diagram-plate-ink) opacity-70' : 'fill-(--diagram-ink-3)',
          )}
        >
          {eyebrow}
        </text>
      )}

      {step && (
        <text
          x={round(box.x + box.w - PLATE.padX)}
          y={round(box.y + PLATE.eyebrow)}
          textAnchor="end"
          className={cn(
            'font-mono [font-size:9px] [letter-spacing:0.1em]',
            reversed ? 'fill-(--diagram-plate-ink) opacity-65' : 'fill-(--diagram-ink-3)',
          )}
        >
          {step}
        </text>
      )}

      {lines.map((line, index) => (
        <text
          key={index}
          x={round(box.x + PLATE.padX)}
          y={round(labelY + index * PLATE.lineStep)}
          className={cn(
            'font-sans [font-size:14px] [letter-spacing:-0.005em]',
            reversed ? 'fill-(--diagram-plate-ink)' : 'fill-(--diagram-ink)',
          )}
        >
          {line}
        </text>
      ))}

      {sublabel && (
        <text
          x={round(box.x + PLATE.padX)}
          y={round(subY)}
          className={cn(
            'font-mono [font-size:10px]',
            reversed ? 'fill-(--diagram-plate-ink) opacity-65' : 'fill-(--diagram-ink-3)',
          )}
        >
          {sublabel}
        </text>
      )}

    </g>
  )
}

/**
 * A mono chip: a version, a region, a protocol, a data classification.
 *
 * A rule and a word, with no fill under it. The filled chip this replaced put a
 * third ground inside a plate that already sat on a figure that sat on the
 * page, and three grounds deep is where a diagram stops reading as structure
 * and starts reading as packaging.
 */
export function Chip({
  x,
  y,
  text,
  align = 'start',
  reversed,
}: {
  x: number
  y: number
  text: string
  align?: 'start' | 'middle' | 'end'
  reversed?: boolean
}) {
  const width = textWidth(text, TYPE.chip) + 12
  const left = align === 'end' ? x - width : align === 'middle' ? x - width / 2 : x

  return (
    <g aria-hidden="true">
      <rect
        x={round(left)}
        y={round(y - 7.5)}
        width={round(width)}
        height={15}
        rx={3}
        ry={3}
        className={cn(
          '[stroke-width:0.9] fill-(--diagram-surface)',
          reversed ? 'stroke-(--diagram-plate-ink) opacity-40' : 'stroke-(--diagram-rule)',
        )}
      />
      <text
        x={round(left + width / 2)}
        y={round(y + 2.8)}
        textAnchor="middle"
        className={cn(
          'font-mono [font-size:9px] [letter-spacing:0.05em]',
          reversed ? 'fill-(--diagram-plate-ink) opacity-70' : 'fill-(--diagram-ink-3)',
        )}
      >
        {text}
      </text>
    </g>
  )
}

/**
 * How a line is painted: the colour as a class, the geometry as attributes.
 *
 * THE SPLIT IS NOT ARBITRARY, and getting it wrong cost an afternoon. Tailwind
 * generates a rule only for a class name it can find as a LITERAL in the
 * source. A width built at runtime — `` `[stroke-width:${weight}]` `` — is a
 * class that never gets a rule, so the browser falls back to SVG's default
 * 1px, silently, on exactly the lines a figure most needs to be heavier. The
 * main path came out the same weight as a side branch and nothing said so.
 *
 * Colour still goes through a class, because a paint has to resolve a custom
 * property and `stroke="var(--x)"` is not valid as an attribute. Width and dash
 * pattern are plain numbers, so they go through presentation attributes where
 * no build step has to have predicted them — and `getComputedStyle` reports an
 * attribute exactly as it reports a rule, so the export still picks them up.
 */
export function edgeClasses(variant?: Variant | 'return'): string {
  switch (variant) {
    case 'emphasis':
      return 'stroke-(--diagram-line-strong)'
    case 'dashed':
    case 'return':
      return 'stroke-(--diagram-line-soft)'
    default:
      return 'stroke-(--diagram-line)'
  }
}

/** A line's width and dash pattern, as presentation attributes. */
export function edgeStroke(
  variant?: Variant | 'return',
  weight?: number,
): { strokeWidth: number; strokeDasharray?: string } {
  switch (variant) {
    case 'emphasis':
      return { strokeWidth: weight ?? 2.1 }
    case 'security':
      return { strokeWidth: weight ?? 1.4, strokeDasharray: '7 4' }
    case 'dashed':
    case 'return':
      return { strokeWidth: weight ?? 1.3, strokeDasharray: '4.5 4' }
    default:
      return { strokeWidth: weight ?? 1.4 }
  }
}

/** Which arrowhead a line ends in. */
export function edgeMarker(variant?: Variant | 'return'): 'arrow' | 'arrow-strong' | 'arrow-open' {
  if (variant === 'emphasis') return 'arrow-strong'
  if (variant === 'return') return 'arrow-open'
  return 'arrow'
}

export interface EdgeLabelProps {
  x: number
  y: number
  axis: 'x' | 'y'
  text: string
  /** A mono chip printed under the wording — a data classification. */
  chip?: string
  /** A second, quieter line — a condition, a timeout, a retry count. */
  note?: string
}

/**
 * A relationship's wording, on a mask that punches the line out from under it.
 *
 * The mask is not decoration. A label drawn straight onto a line is unreadable
 * at every size, and the two repairs a renderer can make are moving the label
 * or hiding the line behind it. Moving it changes which segment the wording
 * belongs to, which is a semantic change; masking is the one that leaves the
 * meaning alone.
 *
 * Set in mono rather than in the interface face. The wording on a line is an
 * ANNOTATION on the picture, not a second rank of content — and at the sans
 * face it competed with the names on the plates, which is the one comparison it
 * must lose.
 */
export function EdgeLabel({ x, y, axis, text, chip, note }: EdgeLabelProps) {
  const width = textWidth(text, TYPE.edge) + 10
  const noteWidth = note ? textWidth(note, TYPE.chip) + 10 : 0
  const cy = y + (axis === 'x' ? -10 : 0)

  return (
    <g aria-hidden="true">
      <rect
        x={round(x - width / 2)}
        y={round(cy - 7)}
        width={round(width)}
        height={14}
        className="fill-(--diagram-surface)"
      />
      <text
        x={round(x)}
        y={round(cy + 3.5)}
        textAnchor="middle"
        className="fill-(--diagram-ink-2) font-mono [font-size:10px]"
      >
        {text}
      </text>
      {note && (
        <>
          <rect
            x={round(x - noteWidth / 2)}
            y={round(cy + 6)}
            width={round(noteWidth)}
            height={13}
            className="fill-(--diagram-surface)"
          />
          <text
            x={round(x)}
            y={round(cy + 15.5)}
            textAnchor="middle"
            className="fill-(--diagram-ink-3) font-mono [font-size:9px]"
          >
            {note}
          </text>
        </>
      )}
      {chip && <Chip x={x} y={cy + (note ? 33 : 20)} text={chip} align="middle" />}
    </g>
  )
}

/**
 * A labelled frame around a set of boxes: a region, a security group, a phase,
 * a process group.
 *
 * A FRAME IS A RULE AND NOT A GROUND. Archify washes its regions with a tint,
 * which this system cannot copy for two reasons: a second ground inside a paper
 * figure reads as packaging rather than as structure — the same argument the
 * containment `Diagram` primitive makes about nested boxes — and every
 * relationship label crossing the wash would then need to know which of two
 * grounds its mask is punching through, which is a question a label cannot
 * answer. `muted` therefore washes only where a band IS the ground it labels: a
 * workflow's exception lane, which nothing routes across.
 *
 * The label sits ABOVE the top rule rather than inside the frame or on it.
 * Inside, it costs a line of vertical space in every frame whether or not the
 * frame had one to spare. ON the rule — which is where it started — it has to
 * punch a mask through the frame, and that mask then competes for the same few
 * units of clear ground as any relationship label routed along the frame's own
 * edge: two captions, two white plates, one on top of the other. Above the
 * rule it needs no mask, leaves the frame unbroken, and reads as a caption for
 * the frame rather than as its first child.
 */
export function BandFrame({
  box,
  label,
  dashed,
  muted,
}: {
  box: Box
  label?: string
  dashed?: boolean
  muted?: boolean
}) {
  return (
    <g aria-hidden="true">
      <rect
        x={round(box.x)}
        y={round(box.y)}
        width={round(box.w)}
        height={round(box.h)}
        rx={10}
        ry={10}
        className={cn(
          '[rx:var(--radius-lg)] [ry:var(--radius-lg)]',
          muted ? 'fill-(--diagram-band)' : 'fill-none',
          dashed
            ? 'stroke-(--diagram-rule-hard) [stroke-width:1.2] [stroke-dasharray:6_4]'
            : 'stroke-(--diagram-rule) [stroke-width:1]',
        )}
      />
      {label && (
        <text
          x={round(box.x + 2)}
          y={round(box.y - 7)}
          className="fill-(--diagram-ink-3) font-mono [font-size:9px] [letter-spacing:0.14em] uppercase"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * The plate shape for a lifecycle state.
 *
 * This is the one place the system spends colour, and it spends exactly the two
 * tokens it reserves for state: `--success` on a terminal success, `--danger`
 * on a terminal failure. Every other kind is carried by shape — a filled cap
 * for a start, a diamond for a decision, a dashed frame for a wait, a cut
 * corner for something outside the system — so a greyscale print loses the two
 * outcomes' hue and keeps all six other distinctions.
 */
export function StatePlate({
  box,
  kind,
  children,
}: {
  box: Box
  kind: LifecycleStateKind
  children?: ReactNode
}) {
  const { x, y, w, h } = box
  const common = '[stroke-width:1.3]'

  if (kind === 'decision') {
    const cx = x + w / 2
    const cy = y + h / 2
    return (
      <g>
        <path
          d={`M ${round(cx)} ${round(y)} L ${round(x + w)} ${round(cy)} L ${round(cx)} ${round(y + h)} L ${round(x)} ${round(cy)} Z`}
          className={cn('fill-(--diagram-node) stroke-(--diagram-rule-hard)', common)}
        />
        {children}
      </g>
    )
  }

  if (kind === 'external') {
    const cut = 13
    return (
      <g>
        <path
          d={`M ${round(x)} ${round(y)} H ${round(x + w - cut)} L ${round(x + w)} ${round(y + cut)} V ${round(y + h)} H ${round(x)} Z`}
          className={cn('fill-(--diagram-node-2) stroke-(--diagram-rule)', common)}
        />
        {children}
      </g>
    )
  }

  const shape =
    kind === 'start'
      ? 'fill-(--diagram-plate) stroke-(--diagram-plate)'
      : kind === 'success'
        ? 'fill-(--success-wash) stroke-(--success)'
        : kind === 'failure'
          ? 'fill-(--danger-wash) stroke-(--danger)'
          : kind === 'waiting'
            ? 'fill-(--diagram-node) stroke-(--diagram-rule) [stroke-dasharray:5_3]'
            : kind === 'neutral'
              ? 'fill-(--diagram-node-2) stroke-(--diagram-rule)'
              : 'fill-(--diagram-node) stroke-(--diagram-rule-hard)'

  const radius = kind === 'start' ? h / 2 : 6

  return (
    <g>
      <rect
        x={round(x)}
        y={round(y)}
        width={round(w)}
        height={round(h)}
        rx={radius}
        ry={radius}
        className={cn(kind === 'start' ? '' : PLATE_RADIUS, shape, common)}
      />
      {children}
    </g>
  )
}
