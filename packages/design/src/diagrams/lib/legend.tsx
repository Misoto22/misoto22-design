import type { LegendMode, LifecycleStateKind, NodeKind, Variant } from '../spec'
import { KIND_WORD, Sigil } from './marks'

const VARIANT_LABEL: Record<Variant | 'return', string> = {
  default: 'Call',
  emphasis: 'Primary path',
  security: 'Crosses a trust boundary',
  dashed: 'Asynchronous',
  return: 'Return',
}

const STATE_LABEL: Record<LifecycleStateKind, string> = {
  start: 'Entry',
  active: 'Working',
  waiting: 'Waiting',
  decision: 'Decision',
  success: 'Succeeded',
  failure: 'Failed',
  neutral: 'Idle',
  external: 'External',
}

export type LegendEntry = { key: string; label: string; sample: React.ReactNode }

/**
 * Which entries the key shows.
 *
 * `auto` — the default and the truthful one — lists only the kinds the figure
 * actually drew. A key that names seven kinds beside a figure using three is
 * not more informative; it is four claims the picture does not support.
 */
export function resolveLegend<T extends string>(
  used: T[],
  mode: LegendMode = 'auto',
  all: T[] = [],
  overrides?: Record<string, { label?: string; visible?: boolean }>,
): T[] {
  if (mode === 'hidden') return []
  const base = mode === 'all' ? all : [...new Set(used)]
  return base.filter((key) => overrides?.[key]?.visible !== false)
}

/** A key entry for each node kind, drawn with the same sigil the figure uses. */
export function kindLegend(
  kinds: NodeKind[],
  overrides?: Record<string, { label?: string }>,
): LegendEntry[] {
  return kinds.map((kind) => ({
    key: kind,
    // The key names a kind with the SAME word the plate's eyebrow prints. They
    // were two vocabularies for one fact — a plate reading SERVICE beside a key
    // reading "Datastore" — which is the one thing a key must never do.
    label: overrides?.[kind]?.label ?? KIND_WORD[kind],
    sample: (
      <g transform="translate(1, 1)">
        <Sigil kind={kind} x={0} y={0} />
      </g>
    ),
  }))
}

/** A key entry for each relationship variant, drawn as the line itself. */
export function variantLegend(
  variants: (Variant | 'return')[],
  overrides?: Record<string, { label?: string }>,
): LegendEntry[] {
  return variants.map((variant) => ({
    key: variant,
    label: overrides?.[variant]?.label ?? VARIANT_LABEL[variant],
    sample: (
      <path
        d="M 0.5 7 H 13.5"
        fill="none"
        className={
          variant === 'emphasis'
            ? 'stroke-(--diagram-line-strong) [stroke-width:2.4]'
            : variant === 'security'
              ? 'stroke-(--diagram-line) [stroke-width:1.6] [stroke-dasharray:4_2]'
              : variant === 'dashed' || variant === 'return'
                ? 'stroke-(--diagram-line-soft) [stroke-width:1.6] [stroke-dasharray:3_2.5]'
                : 'stroke-(--diagram-line) [stroke-width:1.6]'
        }
      />
    ),
  }))
}

/** A key entry for each lifecycle state kind, drawn as its plate. */
export function stateLegend(
  kinds: LifecycleStateKind[],
  overrides?: Record<string, { label?: string }>,
): LegendEntry[] {
  return kinds.map((kind) => ({
    key: kind,
    label: overrides?.[kind]?.label ?? STATE_LABEL[kind],
    sample:
      kind === 'decision' ? (
        <path
          d="M 7 1 L 13 7 L 7 13 L 1 7 Z"
          className="fill-(--diagram-node) stroke-(--diagram-rule-hard) [stroke-width:1.2]"
        />
      ) : kind === 'external' ? (
        <path
          d="M 1 2 H 9.5 L 13 5.5 V 12 H 1 Z"
          className="fill-(--diagram-node-2) stroke-(--diagram-rule) [stroke-width:1.2]"
        />
      ) : (
        <rect
          x="1"
          y="3"
          width="12"
          height="8"
          rx={kind === 'start' ? 4 : 2}
          className={
            kind === 'start'
              ? 'fill-(--diagram-plate) stroke-(--diagram-plate) [stroke-width:1.2]'
              : kind === 'success'
                ? 'fill-(--success-wash) stroke-(--success) [stroke-width:1.2]'
                : kind === 'failure'
                  ? 'fill-(--danger-wash) stroke-(--danger) [stroke-width:1.2]'
                  : kind === 'waiting'
                    ? 'fill-(--diagram-node) stroke-(--diagram-rule) [stroke-width:1.2] [stroke-dasharray:3_2]'
                    : kind === 'neutral'
                      ? 'fill-(--diagram-node-2) stroke-(--diagram-rule) [stroke-width:1.2]'
                      : 'fill-(--diagram-node) stroke-(--diagram-rule-hard) [stroke-width:1.2]'
          }
        />
      ),
  }))
}
