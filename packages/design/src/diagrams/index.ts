/**
 * @misoto22/design/diagrams — the public entry.
 *
 * Five renderers for the five diagram shapes software actually needs, plus the
 * chrome a reader explores one with. They ship from their own entry point
 * rather than from the package root for one reason: a page that renders a Badge
 * should not be paying for a routing engine. Nothing under `src/components`
 * imports anything here, so the main barrel stays the size it was.
 *
 * The specification types mirror
 * [archify](https://github.com/tt-a1i/archify)'s published JSON schemas, so a
 * document authored for that tool renders here with no translation step — in
 * this system's own monochrome terms rather than in archify's palette.
 *
 * The look ships with the rest of the package:
 *
 *   import '@misoto22/design/styles.css'
 *
 * Everything below is a consumer contract. Adding an export is cheap; changing
 * or removing one is a breaking change (DESIGN-API-001).
 */

// ─── Specifications ───
export type {
  ArchitectureBoundary,
  ArchitectureComponent,
  ArchitectureSpec,
  DataflowEdge,
  DataflowNode,
  DataflowSpec,
  DataflowStage,
  DiagramCard,
  DiagramMeta,
  DiagramSpecAny,
  DiagramView,
  EdgeBase,
  LegendMode,
  LifecycleLane,
  LifecycleSpec,
  LifecycleState,
  LifecycleStateKind,
  LifecycleTransition,
  NodeBase,
  NodeKind,
  Point,
  RouteMode,
  SequenceActivation,
  SequenceMessage,
  SequenceParticipant,
  SequenceSegment,
  SequenceSpec,
  Side,
  SourceRef,
  Variant,
  WorkflowEdge,
  WorkflowEdgeRole,
  WorkflowGroup,
  WorkflowLane,
  WorkflowNode,
  WorkflowPhase,
  WorkflowSpec,
} from './spec'

// ─── Figures ───
export * from './ArchitectureFigure/ArchitectureFigure'
export * from './WorkflowFigure/WorkflowFigure'
export * from './SequenceFigure/SequenceFigure'
export * from './DataflowFigure/DataflowFigure'
export * from './LifecycleFigure/LifecycleFigure'

// ─── Chrome ───
export * from './DiagramCanvas/DiagramCanvas'
export * from './DiagramToolbar/DiagramToolbar'
export * from './DiagramExportMenu/DiagramExportMenu'
export * from './DiagramInspector/DiagramInspector'
export * from './DiagramMinimap/DiagramMinimap'
export * from './DiagramLegend/DiagramLegend'

// ─── Building a key ───
export { kindLegend, resolveLegend, stateLegend, variantLegend } from './lib/legend'
export type { LegendEntry } from './lib/legend'

// ─── Shared chrome types ───
export type { FigureChrome } from './lib/frame'
