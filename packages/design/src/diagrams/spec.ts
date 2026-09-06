/**
 * The five diagram specifications, and the vocabulary they share.
 *
 * These types mirror the JSON schemas published by
 * [archify](https://github.com/tt-a1i/archify) — `architecture`, `workflow`,
 * `sequence`, `dataflow` and `lifecycle` — so a specification authored for that
 * tool renders here without a translation step. That compatibility is the whole
 * point of copying somebody else's field names: an agent that already knows how
 * to write `{ "diagram_type": "architecture", "components": [...] }` can hand
 * the same object to a React component and get the system's own look back.
 *
 * WHAT IS DELIBERATELY NOT HERE: archify's routing micro-controls. `via`,
 * `channelX`, `channelY`, `labelAt`, `labelSegment` and `bias` exist there to
 * let an author nudge a line after a validator complains about a collision.
 * They are accepted below and honoured where they are cheap, because dropping a
 * field silently turns a valid specification into a different diagram — but
 * they are hints, not a contract, and a figure that needs many of them is a
 * figure that wants fewer edges.
 *
 * Every position in every type is EXPLICIT — a row and a column, a lane and a
 * step, a participant and a y. Nothing below is solved for. That is what makes
 * these figures server-renderable: layout is arithmetic on numbers the
 * specification already carries, not a simulation that has to settle.
 */

/** A point in the figure's own user-unit space. */
export type Point = [x: number, y: number]

/** Which face of a box a line leaves from or arrives at. */
export type Side = 'left' | 'right' | 'top' | 'bottom'

/**
 * What a node IS, across every diagram type that has nodes.
 *
 * Seven kinds, and in a monochrome system none of them is a colour. Each is
 * drawn as a distinct sigil in the node's leading corner — a cylinder for a
 * database, a shield for a security boundary, rails and ticks for a queue — so
 * the kind survives a greyscale print, a colour-blind reader, and the system's
 * own rule that the only chroma left is bound to state.
 */
export type NodeKind =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'cloud'
  | 'security'
  | 'messagebus'
  | 'external'

/**
 * How much a relationship or a node is being insisted upon.
 *
 * `emphasis` reverses the plate; `security` dashes the frame and doubles the
 * rule; `dashed` is the quiet one — an optional path, an asynchronous hop.
 */
export type Variant = 'default' | 'emphasis' | 'security' | 'dashed'

/** How a line gets from one box to another. */
export type RouteMode = 'auto' | 'straight' | 'orthogonal-h' | 'orthogonal-v'

/** Whether the key beside the figure names every kind, only the used ones, or none. */
export type LegendMode = 'auto' | 'all' | 'hidden'

/**
 * One curated stop in a guided reading of the figure.
 *
 * At most five, which is archify's cap and a good one: a sixth chapter is a
 * second diagram wearing the first one's clothes.
 */
export interface DiagramView {
  id: string
  label: string
  /** Node ids this chapter lights. */
  focus: string[]
  note?: string
}

/**
 * A conclusion card printed under the figure.
 *
 * `dot` names a hue in archify's palette. Here it selects a MARK — a filled
 * square, a ring, a bar — rather than a colour, so seven cards in a row are
 * still seven distinguishable cards on paper-white.
 */
export interface DiagramCard {
  dot: 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose' | 'orange' | 'slate'
  title: string
  items: string[]
}

/** What every specification says about itself. */
export interface DiagramMeta {
  title: string
  subtitle?: string
  /**
   * The extent the author's own renderer came out at.
   *
   * Accepted so a specification carrying it still typechecks, and deliberately
   * NOT applied. It describes archify's layout — a different grid, different
   * column widths, a different plate height — so on any figure placed from
   * lanes and columns it is simply the wrong rectangle: too small and it crops
   * the last participants off the edge, too large and it hangs a band of dead
   * paper under the diagram. The extent here is computed from the marks
   * actually drawn, which is the only number that can be right.
   */
  viewBox?: [number, number] | [number, number, number, number]
  legend?: { mode?: LegendMode; entries?: Record<string, { label?: string; visible?: boolean }> }
  views?: DiagramView[]
}

/** Where a node's facts came from, when the figure was built against real code. */
export interface SourceRef {
  path: string
  line?: number
  end_line?: number
  label?: string
}

/** The fields every drawn box carries, whatever the diagram type calls it. */
export interface NodeBase {
  id: string
  label: string
  /** One short line under the label — what it is, a step back. */
  sublabel?: string
  /** A mono chip on the box: a version, a region, a protocol. */
  tag?: string
  /** How wide and tall this box is, when the type's default does not suit it. */
  width?: number
  height?: number
}

/** The fields every drawn line carries. */
export interface EdgeBase {
  id?: string
  from: string
  to: string
  label?: string
  variant?: Variant
  fromSide?: Side
  toSide?: Side
  route?: RouteMode | string
  /** Waypoints the line is dragged through, in order. */
  via?: Point[]
  /** Pins the label rather than letting the router place it. */
  labelAt?: Point
  labelDx?: number
  labelDy?: number
  /** Forces an orthogonal run through a fixed coordinate. */
  channelX?: number
  channelY?: number
  /** Stroke weight, in user units. */
  width?: number
}

// ─── architecture ───────────────────────────────────────────────────────────

export interface ArchitectureComponent extends NodeBase {
  type: NodeKind
  /** Grid placement. Ignored when `pos` is given. */
  row?: number
  col?: number
  /** Absolute placement, in user units, overriding the grid. */
  pos?: Point
  /**
   * `[width, height]`, which is how archify's architecture schema spells it.
   *
   * Accepted alongside the `width` / `height` pair every other diagram type
   * uses, and it wins when both are given. Two spellings for one fact is not a
   * design — it is the cost of reading somebody else's file format without
   * making its authors edit their files.
   */
  size?: [number, number]
  sources?: SourceRef[]
}

/**
 * A frame drawn around several components.
 *
 * `region` is a deployment boundary — an availability zone, a VPC, a cluster.
 * `security-group` is a trust boundary, and is drawn dashed for that reason: a
 * reader should be able to see which line is about where a thing runs and which
 * is about what may reach it, without reading either label.
 */
export interface ArchitectureBoundary {
  kind: 'region' | 'security-group'
  label: string
  /** Component ids this frame encloses. */
  wraps: string[]
  /** Clear space between the frame and the boxes it holds. */
  pad?: number
}

export interface ArchitectureSpec {
  diagram_type?: 'architecture'
  meta: DiagramMeta
  layout?: {
    origin?: Point
    cols?: number
    gapX?: number
    gapY?: number
    cellW?: number
    cellH?: number
  }
  components: ArchitectureComponent[]
  boundaries?: ArchitectureBoundary[]
  connections?: EdgeBase[]
  cards?: DiagramCard[]
}

// ─── workflow ───────────────────────────────────────────────────────────────

/** A horizontal band: who or what performs the steps in it. */
export interface WorkflowLane {
  id: string
  label: string
  /** `exception` bands hold the failure path and are drawn on a washed ground. */
  variant?: 'normal' | 'exception'
}

/** A vertical band across every lane: a stage of the process. */
export interface WorkflowPhase {
  id: string
  label: string
  fromCol: number
  toCol: number
  variant?: Variant
}

/** A frame around a run of columns inside ONE lane. */
export interface WorkflowGroup extends WorkflowPhase {
  lane: string
}

export interface WorkflowNode extends NodeBase {
  lane: string
  col: number
  type?: NodeKind
  /** Nudges this box off its row's centre line, for a branch that needs room. */
  yOffset?: number
}

/**
 * What a line MEANS in a process, which is not the same question as how it is
 * drawn.
 *
 * `main` is the path the reader should be able to follow without thinking;
 * `branch` leaves it and comes back; `async` does not block; `return` goes
 * backwards; `error` leaves for the exception lane.
 */
export type WorkflowEdgeRole = 'main' | 'branch' | 'async' | 'return' | 'error'

export interface WorkflowEdge extends EdgeBase {
  role?: WorkflowEdgeRole
}

export interface WorkflowSpec {
  diagram_type?: 'workflow'
  schema_version?: 1 | 2
  meta: DiagramMeta
  lanes: WorkflowLane[]
  phases?: WorkflowPhase[]
  groups?: WorkflowGroup[]
  nodes: WorkflowNode[]
  edges?: WorkflowEdge[]
  /** Node ids on the path a reader should follow first. Drawn heavier. */
  mainPath?: string[]
  cards?: DiagramCard[]
}

// ─── sequence ───────────────────────────────────────────────────────────────

export interface SequenceParticipant extends NodeBase {
  type?: NodeKind
}

/** A labelled horizontal band across the whole figure: a phase of the exchange. */
export interface SequenceSegment {
  from: number
  to: number
  label: string
}

export interface SequenceMessage {
  id?: string
  from: string
  to: string
  /** Where this message sits on the vertical time axis, in user units. */
  y: number
  label?: string
  /** `return` is drawn dashed with an open head — a reply, not a call. */
  variant?: Variant | 'return'
  note?: string
}

/** A bar on a lifeline: this participant is busy for this span of the axis. */
export interface SequenceActivation {
  participant: string
  from: number
  to: number
  type?: NodeKind
}

export interface SequenceSpec {
  diagram_type?: 'sequence'
  meta: DiagramMeta & {
    /**
     * `fixed` gives every participant the same column width; `spread` divides
     * the figure evenly instead.
     *
     * Reach for `spread` when a fixed layout would leave a wide empty margin,
     * or when a meaningful participant label does not fit. Shortening the label
     * to make it fit is the wrong repair — the label is the data.
     */
    column_fit?: 'fixed' | 'spread'
  }
  participants: SequenceParticipant[]
  segments?: SequenceSegment[]
  messages: SequenceMessage[]
  activations?: SequenceActivation[]
  cards?: DiagramCard[]
}

// ─── dataflow ───────────────────────────────────────────────────────────────

/** A column header: a stage of the pipeline. */
export interface DataflowStage {
  label: string
}

export interface DataflowNode extends NodeBase {
  type: NodeKind
  /** Index into `stages`. */
  stage: number
  row: number
  yOffset?: number
}

export interface DataflowEdge extends EdgeBase {
  /**
   * What is travelling, in governance terms — `PII`, `aggregated`, `hashed`.
   *
   * Printed as a mono chip on the line rather than folded into the label,
   * because a data-flow diagram is very often read for exactly this and for
   * nothing else.
   */
  classification?: string
}

export interface DataflowSpec {
  diagram_type?: 'dataflow'
  meta: DiagramMeta
  stages: DataflowStage[]
  nodes: DataflowNode[]
  flows?: DataflowEdge[]
  cards?: DiagramCard[]
}

// ─── lifecycle ──────────────────────────────────────────────────────────────

/**
 * What a state IS, and here the system's one licence for colour applies.
 *
 * `success` and `failure` are bound to `--ok` and `--danger` — the two tokens
 * this design system reserves for state and refuses to spend on brand. Every
 * other kind is carried by shape: a start is a filled cap, a decision is a
 * diamond, a wait is dashed, an external is a plate with a cut corner.
 */
export type LifecycleStateKind =
  | 'start'
  | 'active'
  | 'waiting'
  | 'decision'
  | 'success'
  | 'failure'
  | 'neutral'
  | 'external'

export interface LifecycleLane {
  id: string
  label: string
}

export interface LifecycleState extends NodeBase {
  type: LifecycleStateKind
  /** A step number printed in the corner — `01`, `02a`. */
  step?: string
  lane?: string
  col: number
  yOffset?: number
}

export interface LifecycleTransition extends EdgeBase {
  /** A second line under the label: the condition, the timeout, the retry count. */
  note?: string
}

export interface LifecycleSpec {
  diagram_type?: 'lifecycle'
  meta: DiagramMeta
  lanes?: LifecycleLane[]
  states: LifecycleState[]
  transitions?: LifecycleTransition[]
  cards?: DiagramCard[]
}

/** Any of the five, for a call site that dispatches on `diagram_type`. */
export type DiagramSpecAny =
  | ArchitectureSpec
  | WorkflowSpec
  | SequenceSpec
  | DataflowSpec
  | LifecycleSpec
