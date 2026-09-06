'use client'

import { useRef } from 'react'
import { DEV, warn } from '../../lib/warn'

/**
 * The ways a diagram specification can typecheck and draw something else.
 *
 * A figure has no runtime validator and should not grow one: the specification
 * is a plain object, the layout is arithmetic on numbers it already carries,
 * and a schema check would be a second copy of the types. What it needs instead
 * is the same thing the components have — a word at the moment the arithmetic
 * is asked to do something the author cannot have meant.
 *
 * Every case here shares one shape: the renderer CAN produce a picture, so
 * nothing throws, and the picture is not the one the specification describes.
 * A lane id nothing declares resolves to lane 0 and the step is drawn in the
 * wrong band; a stage past the last heading is drawn past the last heading; a
 * message to a participant that does not exist is drawn nowhere at all. Each of
 * those used to be silent, and silence is the one outcome ruled out: an author
 * who cannot see the difference between "I placed this" and "the renderer gave
 * up" has no way to find the mistake except by knowing what the picture should
 * have looked like.
 *
 * All of it goes through `lib/warn`, so it is dev-only, printed once per
 * problem, and dropped from a production bundle by the consumer's own bundler.
 */

/**
 * Says so when a figure is handed the same object it was handed last time, with
 * different contents inside it.
 *
 * Every figure memoises its model on the specification's IDENTITY, which is the
 * only key that costs nothing to compare — and which a `spec.components.push()`
 * does not change. The figure then goes on drawing the picture it was first
 * given, through any number of re-renders, with no error and no clue.
 *
 * The fingerprint is only computed in development, and only ever compared with
 * the previous render's: it is a diagnostic, not the memo key. Making it the
 * memo key would put a `JSON.stringify` of the whole specification in front of
 * every production render, which is a far worse trade than asking the author to
 * build a new object.
 */
export function useSpecIdentity(spec: unknown, component: string): void {
  const last = useRef<{ spec: unknown; print: string } | null>(null)
  if (!DEV) return

  const print = fingerprint(spec)
  const previous = last.current
  last.current = { spec, print }

  if (previous && previous.spec === spec && previous.print !== print) {
    warn({
      code: 'DIAGRAM_SPEC_MUTATED',
      problem: `${component} was given the same spec object with different contents. The model is memoised on the object's identity, so the figure is still drawing what that object held on the first render.`,
      field: `${component}.spec`,
      fix: 'Build a new spec object for the change — { ...spec, nodes: [...] } — rather than mutating the one already passed.',
      component,
    })
  }
}

function fingerprint(value: unknown): string {
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    // A spec that cannot be serialised cannot be fingerprinted either. It is
    // not this function's job to complain about that.
    return ''
  }
}

/** Says so when a node names a lane the specification never declared. */
export function warnUnknownLane(component: string, nodeId: string, lane: string): void {
  if (!DEV) return
  warn({
    code: 'DIAGRAM_LANE_UNKNOWN',
    problem: `${component} was given the lane "${lane}" on "${nodeId}", which no lane in the specification declares. It falls back to the first lane, so the node is drawn in the right column and the wrong band.`,
    field: `${component}.nodes[${nodeId}].lane`,
    fix: `Use one of the ids in spec.lanes, or add a lane whose id is "${lane}".`,
    component,
  })
}

/** Says so when a data-flow node sits past the last stage heading. */
export function warnStageOutOfRange(
  component: string,
  nodeId: string,
  stage: number,
  stages: number,
): void {
  if (!DEV) return
  warn({
    code: 'DIAGRAM_STAGE_OUT_OF_RANGE',
    problem: `${component} was given stage ${stage} on "${nodeId}" against ${stages} declared stages. A node's x is computed from its own index, so it is drawn past the last heading — in a column the axis does not label.`,
    field: `${component}.nodes[${nodeId}].stage`,
    fix: `Use a stage between 0 and ${Math.max(0, stages - 1)}, or declare the stages the pipeline actually has.`,
    component,
  })
}

/** Says so when two boxes were placed on exactly the same coordinate. */
export function warnCollision(component: string, ids: string[]): void {
  if (!DEV) return
  warn({
    code: 'DIAGRAM_CELL_COLLISION',
    problem: `${component} placed ${ids.map((id) => `"${id}"`).join(' and ')} at the same coordinate, so one plate is drawn on top of the other. Both are still in the summary list, so the mistake exists only in the picture.`,
    field: `${component}.components[${ids[0]}]`,
    fix: 'Give each of them its own row and col, or its own pos.',
    component,
  })
}

/**
 * The edges whose two ends exist, with a word about the ones that do not.
 *
 * Routing already drops a line it cannot place — there is no box to draw it
 * between — and the summary list used to iterate the specification instead, so
 * the picture and its text equivalent disagreed: one showed nothing, the other
 * reported a relationship to an id no node claims. Both halves now read this,
 * which is what makes them agree by construction rather than by inspection.
 */
export function liveEdges<E extends { from: string; to: string }>(
  component: string,
  edges: E[] | undefined,
  known: (id: string) => boolean,
): E[] {
  if (!edges) return []
  const out: E[] = []
  for (const edge of edges) {
    const missing = [edge.from, edge.to].filter((id) => !known(id))
    if (missing.length === 0) {
      out.push(edge)
      continue
    }
    if (DEV) {
      warn({
        code: 'DIAGRAM_EDGE_DANGLING',
        problem: `${component} was given a relationship ${edge.from} → ${edge.to}, and ${missing.map((id) => `"${id}"`).join(' and ')} is not a node the specification declares. There is nothing to draw it between, so it is left out of the picture and out of the summary.`,
        field: `${component}.edges[${edge.from}→${edge.to}]`,
        fix: 'Correct the id, or add the node it names.',
        component,
      })
    }
  }
  return out
}

/** Says so when anything else in the spec points at an id nothing declares. */
export function warnUnknownRef(
  component: string,
  field: string,
  id: string,
  effect: string,
): void {
  if (!DEV) return
  warn({
    code: 'DIAGRAM_REF_UNKNOWN',
    problem: `${component} was given "${id}" in ${field}, which no node in the specification declares, so ${effect}.`,
    field: `${component}.${field}`,
    fix: 'Correct the id, or add the node it names.',
    component,
  })
}
