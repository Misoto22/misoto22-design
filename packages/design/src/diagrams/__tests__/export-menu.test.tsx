import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiagramExportMenu, type ExportResult } from '../index'
import { downloadBlob, serializeSvg } from '../../lib/svg-export'

/**
 * The export pipeline is mocked because none of it can run under jsdom — there
 * is no rasteriser and no object URL — and none of it is what these tests are
 * about. What is being asserted is the CONTRACT around it: which pipeline ran,
 * what the menu told the caller, and whether the rows are menu rows.
 */
vi.mock('../../lib/svg-export', () => ({
  downloadBlob: vi.fn(),
  exportFilename: (title: string, extension: string) => `${title}.${extension}`,
  rasterize: vi.fn(async () => new Blob()),
  readToken: (_element: Element, _name: string, fallback: string) => fallback,
  serializeSvg: vi.fn(() => '<svg />'),
}))

function artwork() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('data-diagram-artwork', '')
  document.body.append(svg)
  return { current: svg }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('DiagramExportMenu', () => {
  it('makes the formats menu rows rather than buttons dropped inside a menu', async () => {
    render(<DiagramExportMenu targetRef={artwork()} title="Request path" />)
    await userEvent.click(screen.getByRole('button', { name: 'Export' }))

    // Plain buttons inside a role="menu" get no roving focus, no typeahead and
    // no close-on-pick — the three things a menu is.
    expect(screen.getAllByRole('menuitem')).toHaveLength(5)
  })

  it('says whose pipeline ran when the caller supplied one', async () => {
    const results: ExportResult[] = []
    render(
      <DiagramExportMenu
        targetRef={artwork()}
        title="Request path"
        onExport={() => {}}
        onResult={(result) => results.push(result)}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /^PNG/ }))

    // A no-op handler produced no file. `ok` cannot say otherwise on its own,
    // so the result says which pipeline it is reporting on.
    await waitFor(() => expect(results).toHaveLength(1))
    expect(results[0]).toMatchObject({ format: 'png', ok: true, source: 'caller' })
  })

  it('reports its own export as its own', async () => {
    const results: ExportResult[] = []
    render(
      <DiagramExportMenu
        targetRef={artwork()}
        title="Request path"
        onResult={(result) => results.push(result)}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /SVG/ }))

    await waitFor(() => expect(results).toHaveLength(1))
    expect(results[0]).toMatchObject({ format: 'svg', ok: true, source: 'built-in' })
    expect(downloadBlob).toHaveBeenCalled()
  })

  it('can take the figure off the page without a plate behind it', async () => {
    render(<DiagramExportMenu targetRef={artwork()} title="Request path" background={null} />)

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /SVG/ }))

    await waitFor(() => expect(serializeSvg).toHaveBeenCalled())
    expect(vi.mocked(serializeSvg).mock.calls[0]![1]?.background).toBeUndefined()
  })

  it('paints the reader’s own paper behind it by default', async () => {
    render(<DiagramExportMenu targetRef={artwork()} title="Request path" />)

    await userEvent.click(screen.getByRole('button', { name: 'Export' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /SVG/ }))

    await waitFor(() => expect(serializeSvg).toHaveBeenCalled())
    expect(vi.mocked(serializeSvg).mock.calls[0]![1]?.background).toBe('#ffffff')
  })
})
