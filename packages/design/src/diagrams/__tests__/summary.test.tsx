import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ArchitectureFigure,
  DataflowFigure,
  LifecycleFigure,
  SequenceFigure,
  WorkflowFigure,
} from '../index'
import { ARCHITECTURE, DATAFLOW, LIFECYCLE, SEQUENCE, WORKFLOW } from './fixtures'

/**
 * The half of every figure that is not a picture.
 *
 * The `<svg>` is `role="img"` and its whole subtree is presentational, so a
 * reader who is not looking at it gets exactly what the summary beside it
 * carries — and that summary used to carry the nodes and the edges and nothing
 * else. Every axis the figures draw sat inside the hidden artwork: the lane a
 * step belongs to, the stage a node sits in, the boundary around a service, the
 * phase a message happened in, the number printed in a state's corner.
 *
 * Those are not decoration. A workflow's lanes are WHO and a data flow's stages
 * are WHERE ALONG — the second dimension of both diagrams — and a summary
 * without them describes a line of boxes.
 *
 * So the axis is now the list's own structure: the nodes are published grouped
 * by the band they are drawn in, which is a stronger statement than repeating
 * the lane's name on every row, and the structures that do not partition the
 * nodes are published as sentences under it.
 */
describe('the axis a figure draws reaches the text', () => {
  it('groups a workflow by the lane that owns each step', () => {
    render(<WorkflowFigure spec={WORKFLOW} />)

    const ci = screen.getByText('Lane: CI').closest('li')
    expect(ci?.textContent).toContain('Tests')
    expect(ci?.textContent).toContain('Deploy')
    expect(ci?.textContent).not.toContain('Roll back')

    const recovery = screen.getByText('Exception lane: Recovery').closest('li')
    expect(recovery?.textContent).toContain('Roll back')
  })

  it('publishes a workflow phase as the span it covers', () => {
    render(<WorkflowFigure spec={WORKFLOW} />)

    expect(screen.getByText(/Phase Build covers columns 0 to 1/)).toHaveTextContent(
      /Tests, Deploy, Roll back/,
    )
  })

  it('groups a data flow by the stage each node sits in', () => {
    render(<DataflowFigure spec={DATAFLOW} />)

    expect(screen.getByText('Stage: Sources').closest('li')?.textContent).toContain('Web SDK')
    expect(screen.getByText('Stage: Store').closest('li')?.textContent).toContain('Warehouse')
  })

  it('names a node the stages do not reach rather than hiding it in the list', () => {
    render(
      <DataflowFigure
        spec={{
          ...DATAFLOW,
          nodes: [...DATAFLOW.nodes, { id: 'x', type: 'cloud', label: 'Orphan', stage: 4, row: 0 }],
        }}
      />,
    )

    expect(screen.getByText(/Stage: outside the declared stages/).closest('li')?.textContent).toContain(
      'Orphan',
    )
  })

  it('publishes an architecture boundary and what it holds', () => {
    render(<ArchitectureFigure spec={ARCHITECTURE} />)

    const note = screen.getByText(/Region ap-southeast-2 encloses/)
    expect(note).toHaveTextContent(/API, Postgres/)
    expect(note.textContent).not.toContain('CloudFront')
  })

  it('publishes a sequence segment and the bars that say who was busy', () => {
    render(<SequenceFigure spec={SEQUENCE} />)

    expect(screen.getByText(/Phase Request covers/)).toHaveTextContent(/GET \/me, read, miss/)
    expect(screen.getByText(/API is busy from GET \/me to miss/)).toBeInTheDocument()
  })

  it('publishes a lifecycle step number and the rail it is drawn on', () => {
    render(<LifecycleFigure spec={LIFECYCLE} />)

    expect(screen.getByText('Lane: Phases').closest('li')?.textContent).toContain('step 01')

    // The spine is drawn between consecutive states in the first lane whether
    // or not a transition declares it, so a summary that omits it is missing
    // two of the three arrows in the picture.
    expect(screen.getByText(/Queued → Running/)).toBeInTheDocument()
    expect(screen.getByText(/Running → Done/)).toBeInTheDocument()
    expect(screen.getByText(/Running → Failed: error — after 3 tries/)).toBeInTheDocument()
  })

  it('still gives a keyboard exactly one control per node once grouped', () => {
    render(<WorkflowFigure spec={WORKFLOW} onSelectNode={() => {}} />)

    // Grouping must not duplicate a node into two bands: the list is the only
    // route a keyboard has to a selection, and two buttons for one node is two
    // stops that do the same thing.
    expect(screen.getAllByRole('button')).toHaveLength(WORKFLOW.nodes.length)
  })
})
