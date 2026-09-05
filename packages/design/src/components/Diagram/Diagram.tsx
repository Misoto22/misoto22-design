import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface DiagramNode {
  /** Only needed when an edge names this node. */
  id?: string
  /** The node's name, set in the interface face. */
  label: string
  /** What it is — one short line, a step back. */
  note?: string
  /** The one node the diagram is about. At most one or two per diagram. */
  accent?: boolean
  /** How this node's children are laid out. Defaults to a row. */
  direction?: 'row' | 'column'
  children?: DiagramNode[]
  /** A line printed under the frame, outside it — what the box means. */
  footnote?: string
}

export interface DiagramEdge {
  from: string
  to: string
  label?: string
}

export interface DiagramSpec {
  /** How the top-level nodes are laid out. Defaults to a row. */
  direction?: 'row' | 'column'
  nodes: DiagramNode[]
  /** Arrows between adjacent top-level nodes, by id. */
  edges?: DiagramEdge[]
  /** The figure's caption. */
  caption?: string
  /** Names the figure for assistive tech when the caption does not. */
  label?: string
}

export interface DiagramProps {
  spec: DiagramSpec
  className?: string
}

/**
 * A flow or architecture diagram, drawn out of the system's own parts.
 *
 * The alternative it replaces is a fenced block of box-drawing characters —
 * `┌──────┬──────┐` — which is a picture rendered in a font chosen for code. It
 * inherits the code block's frame and scrollbar, so a diagram reads as terminal
 * output; it cannot wrap, so on a phone it either overflows or is scaled to
 * nothing; the box edges are text, so a screen reader reads the rules out loud;
 * and none of it responds to the theme.
 *
 * The other alternative is a diagramming library, which is several hundred
 * kilobytes of layout engine, renders after hydration, and draws in its own
 * palette. This is neither: hairline frames on the radius scale, mono labels,
 * the muted step for anything supporting — so a diagram belongs to the page it
 * sits on. It server-renders, because it is markup.
 *
 * NESTING IS CONTAINMENT, which is what most architecture diagrams actually
 * describe: this is inside that, and these two sit beside each other. Edges are
 * for the sequence between siblings, not for arbitrary wiring — a diagram that
 * needs arbitrary wiring is a diagram that wants a drawing, and this will not
 * pretend otherwise.
 *
 * It takes a spec rather than markup, so a fenced ```diagram block in an
 * article and a hand-written figure on a page are one renderer and one look —
 * and a wrong diagram is corrected by editing data.
 *
 * @example
 * <Diagram
 *   spec={{
 *     caption: 'One request, end to end.',
 *     edges: [{ from: 'edge', to: 'app', label: 'HTTPS' }],
 *     nodes: [
 *       { id: 'edge', label: 'Edge', note: 'CDN' },
 *       { id: 'app', label: 'Application', accent: true, children: [
 *         { label: 'Router' },
 *         { label: 'Handlers' },
 *       ] },
 *     ],
 *   }}
 * />
 */
export function Diagram({ spec, className }: DiagramProps) {
  const { nodes, edges = [], direction = 'row', caption, label } = spec

  return (
    <figure className={cn('m-0', className)} role="group" aria-label={label ?? caption ?? undefined}>
      <div className="overflow-x-auto rounded-(--radius-lg) border border-(--rule) bg-(--paper-2) p-[clamp(1.125rem,calc(2.5*var(--fluid)),1.875rem)] scroll-slim">
        <NodeList nodes={nodes} edges={edges} direction={direction} depth={0} />
      </div>
      {caption && (
        // A <div>, not a <figcaption>. A long-form stylesheet dropped around
        // this will style `figcaption` and `p` unlayered, and an unlayered rule
        // beats a utility whatever the specificity — inside an article a real
        // figcaption came out uppercased and every label in the diagram
        // inherited a paragraph margin. Nothing here uses a tag prose reaches
        // for.
        <div className="mt-3 mono-meta leading-[1.6] text-(--ink-3-aa)">{caption}</div>
      )}
    </figure>
  )
}

/** One rank of the diagram: the nodes, and any arrows between them. */
function NodeList({
  nodes,
  edges,
  direction,
  depth,
}: {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  direction: 'row' | 'column'
  depth: number
}) {
  const row = direction === 'row'

  return (
    <div className={cn('flex min-w-0 gap-3', row ? 'flex-col sm:flex-row' : 'flex-col')}>
      {nodes.map((node, index) => (
        <NodeFrame
          key={node.id ?? `${node.label}-${index}`}
          node={node}
          edges={edges}
          depth={depth}
          lead={index > 0 ? findEdge(edges, nodes[index - 1]!, node) : undefined}
          row={row}
        />
      ))}
    </div>
  )
}

/** The arrow that sits between two adjacent nodes, when an edge names them. */
function findEdge(edges: DiagramEdge[], from: DiagramNode, to: DiagramNode): DiagramEdge | undefined {
  if (!from.id || !to.id) return undefined
  return edges.find((edge) => edge.from === from.id && edge.to === to.id)
}

/**
 * A node is one of two things, and they are drawn differently on purpose.
 *
 * A LEAF is a plate: a bordered card on paper, or ink-filled when it is what
 * the diagram is about. A CONTAINER is a band: a labelled hairline with its
 * children underneath, and NO frame of its own.
 *
 * That distinction is the whole design. Drawing a container as another box puts
 * three borders around anything two levels deep — the figure's frame, the
 * group's, and the plate's — and the result reads as packaging rather than as
 * structure. A rule with a name on it says "these belong together" using the
 * device every section head already uses, and leaves the borders to the things
 * that are actually objects.
 */
function NodeFrame({
  node,
  edges,
  depth,
  lead,
  row,
}: {
  node: DiagramNode
  edges: DiagramEdge[]
  depth: number
  lead?: DiagramEdge
  row: boolean
}) {
  const children = node.children ?? []
  const isGroup = children.length > 0

  return (
    <>
      {lead && <EdgeMark label={lead.label} row={row} />}
      <div className="flex min-w-0 flex-1 flex-col">
        {isGroup ? (
          <div
            className={cn(
              'min-w-0 flex-1 border-t pt-3',
              depth === 0 ? 'border-(--ink)' : 'border-(--rule-2)',
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="font-sans text-[13.5px] leading-[1.35] text-(--ink)">
                {node.label}
              </span>
              {node.note && <span className="mono-meta text-(--ink-3-aa)">{node.note}</span>}
            </div>
            <div className="mt-3">
              <NodeList
                nodes={children}
                edges={edges}
                direction={node.direction ?? 'row'}
                depth={depth + 1}
              />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'flex min-w-0 flex-1 flex-col justify-center rounded-(--radius) px-3.5 py-3',
              node.accent ? 'bg-(--accent)' : 'border border-(--rule-2) bg-(--paper)',
            )}
          >
            {/* An identifier can be one long word — `TenantMainMiddleware` —
                with no break opportunity, so it runs into the plate's edge
                unless it is allowed to break inside itself. */}
            <span
              className={cn(
                'block break-words font-sans text-[13.5px] leading-[1.35]',
                node.accent ? 'text-(--accent-foreground)' : 'text-(--ink)',
              )}
            >
              {node.label}
            </span>
            {node.note && (
              <span
                className={cn(
                  'mt-1 block mono-meta',
                  node.accent ? 'text-(--accent-foreground) opacity-70' : 'text-(--ink-3-aa)',
                )}
              >
                {node.note}
              </span>
            )}
          </div>
        )}

        {node.footnote && (
          <span className="mt-2 block mono-meta text-(--ink-3-aa)">{node.footnote}</span>
        )}
      </div>
    </>
  )
}

/**
 * The connector. An arrow and, when the edge is named, the name under it —
 * hidden from assistive tech, which reads the nodes in document order anyway
 * and has no use for a glyph pointing at the next one.
 */
function EdgeMark({ label, row }: { label?: string; row: boolean }): ReactNode {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex flex-none items-center justify-center gap-1.5 text-(--ink-3-aa)',
        row ? 'sm:flex-col' : 'flex-col',
      )}
    >
      {/* One glyph, turned. A row stacks into a column below `sm`, so the arrow
          has to point the way the layout actually runs at that width. In RTL the
          inline axis reverses, so the flat arrow is mirrored with it. */}
      <span
        className={cn(
          'font-mono text-[13px] leading-none',
          row ? 'rotate-90 sm:rotate-0 sm:rtl:-scale-x-100' : 'rotate-90',
        )}
      >
        →
      </span>
      {label && <span className="mono-meta whitespace-nowrap">{label}</span>}
    </div>
  )
}

export default Diagram
