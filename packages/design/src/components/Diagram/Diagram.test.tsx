import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Diagram } from './Diagram'
import { resetWarnings } from '../../lib/warn'

/**
 * A diagram is data rendered as a confident picture, which is what makes a
 * silent no-op here worse than a crash: the figure is drawn, it is drawn
 * beautifully, and it describes something other than what the spec says.
 *
 * Every case below is a spec the renderer used to accept and quietly ignore.
 */
const arrows = (container: HTMLElement) =>
  [...container.querySelectorAll('span')].filter((span) => span.textContent === '→')

describe('Diagram', () => {
  let warned: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetWarnings()
    warned = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warned.mockRestore()
  })

  const message = () => warned.mock.calls.map((call) => String(call[0])).join('\n')

  it('draws the arrow an adjacent edge asks for, and says nothing about it', () => {
    const { container } = render(
      <Diagram
        spec={{
          edges: [{ from: 'edge', to: 'app', label: 'HTTPS' }],
          nodes: [
            { id: 'edge', label: 'Edge' },
            { id: 'app', label: 'Application' },
          ],
        }}
      />,
    )
    expect(arrows(container)).toHaveLength(1)
    expect(warned).not.toHaveBeenCalled()
  })

  it('says so when an edge names two nodes that are not adjacent', () => {
    // Drawn nothing and reported nothing: the author sees a figure with a
    // missing arrow and no reason to believe the spec was read at all.
    const { container } = render(
      <Diagram
        spec={{
          edges: [{ from: 'edge', to: 'store' }],
          nodes: [
            { id: 'edge', label: 'Edge' },
            { id: 'app', label: 'Application' },
            { id: 'store', label: 'Store' },
          ],
        }}
      />,
    )
    expect(arrows(container)).toHaveLength(0)
    expect(message()).toContain('DIAGRAM_EDGE_NOT_ADJACENT')
    expect(message()).toContain('edge → store')
  })

  it('says so when an edge is written the wrong way round', () => {
    render(
      <Diagram
        spec={{
          edges: [{ from: 'app', to: 'edge' }],
          nodes: [
            { id: 'edge', label: 'Edge' },
            { id: 'app', label: 'Application' },
          ],
        }}
      />,
    )
    expect(message()).toContain('DIAGRAM_EDGE_NOT_ADJACENT')
  })

  it('says so when an edge names a node the spec does not have', () => {
    render(
      <Diagram
        spec={{
          edges: [{ from: 'edge', to: 'queue' }],
          nodes: [
            { id: 'edge', label: 'Edge' },
            { id: 'app', label: 'Application' },
          ],
        }}
      />,
    )
    expect(message()).toContain('DIAGRAM_EDGE_UNKNOWN_NODE')
    expect(message()).toContain('queue')
  })

  it('draws each edge once, however many ranks repeat the pair', () => {
    // The same edges array was handed to every rank, so a reused pair two
    // levels down drew the arrow again down there — an arrow the spec asked
    // for once and the figure asserts twice.
    const { container } = render(
      <Diagram
        spec={{
          edges: [{ from: 'edge', to: 'app' }],
          nodes: [
            { id: 'edge', label: 'Edge' },
            {
              id: 'app',
              label: 'Application',
              children: [
                { id: 'edge', label: 'Inner edge' },
                { id: 'app', label: 'Inner app' },
              ],
            },
          ],
        }}
      />,
    )
    expect(arrows(container)).toHaveLength(1)
    expect(message()).toContain('DIAGRAM_DUPLICATE_ID')
  })

  it('says so when accent is set on a node that has children', () => {
    // A container is a band and a band has no fill to take, so this
    // type-checks, renders and paints nothing.
    render(
      <Diagram
        spec={{
          nodes: [{ id: 'app', label: 'Application', accent: true, children: [{ label: 'Router' }] }],
        }}
      />,
    )
    expect(message()).toContain('DIAGRAM_ACCENT_ON_CONTAINER')
    expect(message()).toContain('Application')
  })

  it('says so when direction is set on a node that has none', () => {
    // The axis a leaf sits on belongs to its parent, so direction here is read
    // by nothing.
    render(<Diagram spec={{ nodes: [{ label: 'Router', direction: 'column' }] }} />)
    expect(message()).toContain('DIAGRAM_DIRECTION_ON_LEAF')
    expect(message()).toContain('Router')
  })

  it('stays quiet for a spec that means what it renders', () => {
    render(
      <Diagram
        spec={{
          caption: 'One request, end to end.',
          edges: [{ from: 'edge', to: 'app', label: 'HTTPS' }],
          nodes: [
            { id: 'edge', label: 'Edge', note: 'CDN' },
            { id: 'app', label: 'Application', direction: 'column', children: [{ label: 'Router', accent: true }] },
          ],
        }}
      />,
    )
    expect(warned).not.toHaveBeenCalled()
  })
})
