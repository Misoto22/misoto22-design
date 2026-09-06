import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render as rtlRender, screen, within } from '@testing-library/react'
import { rasterize, readToken, serializeSvg } from '../../lib/svg-export'
import { chartToCsv, chartToPng, exportFilename } from '../lib/export'
import { clampWindow, panWindow, zoomWindow } from '../lib/zoom'
import { BarChart } from '../BarChart/BarChart'
import type { ChartConfig } from '../lib/chart'

/** A UTF-8 byte order mark, written out so the assertions can say so. */
const BOM = '\uFEFF'

/**
 * The general half of the export path lives in `lib/svg-export` and is tested
 * there. Mocking it here leaves exactly the seam this module still owns: WHICH
 * `<svg>` is the plot, and what ground and ink an exported chart carries.
 */
vi.mock('../../lib/svg-export', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/svg-export')>()),
  serializeSvg: vi.fn(() => '<svg/>'),
  rasterize: vi.fn(async () => new Blob()),
  readToken: vi.fn((_element: Element, name: string, fallback: string) =>
    name === '--chart-surface' ? SURFACE : name === '--ink' ? INK : fallback,
  ),
}))

const SURFACE = '#fafafa'
const INK = '#101010'

beforeEach(() => {
  vi.mocked(serializeSvg).mockClear()
  vi.mocked(rasterize).mockClear()
  vi.mocked(readToken).mockClear()
})

const columns = [
  { key: 'month', label: 'Month' },
  { key: 'desktop', label: 'Desktop' },
]

/** The CSV without its BOM and without the trailing record separator. */
function records(csv: string): string[] {
  expect(csv.startsWith(BOM)).toBe(true)
  return csv.slice(BOM.length).replace(/\r\n$/, '').split('\r\n')
}

describe('CSV export', () => {
  it('leaves an ordinary field alone', () => {
    // Quoting everything is legal and unreadable. The RFC asks for quotes
    // where they are load-bearing, and nowhere else.
    const csv = chartToCsv([{ month: 'Jan', desktop: 186 }], columns)

    expect(records(csv)).toEqual(['Month,Desktop', 'Jan,186'])
  })

  it('quotes a field that contains the separator', () => {
    const csv = chartToCsv([{ month: 'Jan, 2026', desktop: 186 }], columns)

    expect(records(csv)[1]).toBe('"Jan, 2026",186')
  })

  it('quotes a field with a quote in it, and doubles the quote', () => {
    // Escaping with a backslash is the habit every other format teaches and
    // the one thing a CSV parser will not understand.
    const csv = chartToCsv([{ month: 'the "good" month', desktop: 186 }], columns)

    expect(records(csv)[1]).toBe('"the ""good"" month",186')
  })

  it('quotes a field containing a line break, which then survives the record split', () => {
    const csv = chartToCsv([{ month: 'Jan\nlate', desktop: 186 }], columns)

    // One record, not two: the newline is inside the quoted field, so the
    // CRLF record separator is still the only place a row ends.
    expect(records(csv)).toEqual(['Month,Desktop', '"Jan\nlate",186'])
  })

  it('starts with a UTF-8 BOM, so Excel does not guess the encoding', () => {
    // Without it Excel decodes the file with the machine's legacy code page
    // and every non-ASCII label arrives as mojibake.
    const csv = chartToCsv([{ month: '一月', desktop: 186 }], columns)

    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain('一月')
  })

  it('separates records with CRLF, including the last one', () => {
    const csv = chartToCsv(
      [
        { month: 'Jan', desktop: 186 },
        { month: 'Feb', desktop: 305 },
      ],
      columns,
    )

    expect(csv).toBe(`${BOM}Month,Desktop\r\nJan,186\r\nFeb,305\r\n`)
  })

  it('writes numbers unformatted, so they land in the spreadsheet as numbers', () => {
    // `1,234` would need quoting, and a quoted number is text — which is the
    // one thing a numeric export must not become.
    const csv = chartToCsv([{ month: 'Jan', desktop: 1234567 }], columns)

    expect(records(csv)[1]).toBe('Jan,1234567')
  })

  it('writes an empty cell for a value it cannot spell, rather than "undefined"', () => {
    const csv = chartToCsv([{ month: 'Jan' }, { month: 'Feb', desktop: Number.NaN }], columns)

    expect(records(csv).slice(1)).toEqual(['Jan,', 'Feb,'])
  })

  it('falls back to the column key when the label is markup rather than text', () => {
    // A column's label is a ReactNode, so it can be an element. A key is a
    // worse header than a label and a much better one than an empty cell.
    const csv = chartToCsv([{ desktop: 186 }], [{ key: 'desktop', label: null }])

    expect(records(csv)[0]).toBe('desktop')
  })

  it('is a header and nothing else when there are no rows', () => {
    expect(chartToCsv([], columns)).toBe(`${BOM}Month,Desktop\r\n`)
  })
})

describe('filenames', () => {
  it('turns a figure title into something a shell will not fight', () => {
    expect(exportFilename('Visitors per month, 2026', 'csv')).toBe('visitors-per-month-2026.csv')
  })

  it('never produces a file that is only an extension', () => {
    expect(exportFilename('—', 'png')).toBe('chart.png')
  })
})

describe('PNG export', () => {
  it('says what is wrong rather than downloading an empty image', async () => {
    // The failure a call site actually hits: exporting before the chart has
    // rendered. A 0-byte PNG would look like a broken feature.
    await expect(chartToPng(document.createElement('div'))).rejects.toThrow(/no <svg>/)
  })

  it('hands the plot to the serialiser, not the first icon it finds', async () => {
    // The three decisions this function still owns after the general half moved
    // to `lib/svg-export`. The first is the one that breaks silently: a toolbar
    // sits inside the same wrapper and every control in it is an `<svg>`, so a
    // naive `querySelector('svg')` exports a picture of a magnifying glass —
    // which looks like a working download until someone opens the file.
    // Both narrowings, in one fixture, because both are load-bearing and each
    // fails the same silent way. The toolbar is outside the plot wrapper; the
    // legend swatch is inside it.
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <div role="group"><button><svg id="toolbar-icon"></svg></button></div>
      <div data-slot="chart">
        <div class="legend"><svg id="legend-swatch"></svg></div>
        <svg id="plot" class="recharts-surface"></svg>
      </div>
    `
    document.body.append(wrapper)

    try {
      await chartToPng(wrapper, { title: 'Visitors' })
    } catch {
      // jsdom cannot rasterise; what is asserted is what was handed over.
    }

    expect(serializeSvg).toHaveBeenCalledOnce()
    const [svg, options] = vi.mocked(serializeSvg).mock.calls[0]!
    expect(svg.id).toBe('plot')
    expect(options?.background).toBe(SURFACE)
    expect(options?.titleColor).toBe(INK)

    wrapper.remove()
  })
})

/** 41 rows, so the window runs 0…40 and a half is a whole number. */
const TOTAL = 41

describe('the zoom window', () => {
  it('halves the span and keeps the centre where it was', () => {
    // A zoom that re-centres loses the point the reader was looking at, which
    // is the whole reason they zoomed.
    expect(zoomWindow({ startIndex: 0, endIndex: 40 }, TOTAL, 0.5)).toEqual({
      startIndex: 10,
      endIndex: 30,
    })
  })

  it('holds the anchored row in place instead of the centre', () => {
    // A wheel zoom anchors on the pointer. Anchored at the last row, the last
    // row must still be the last row afterwards.
    expect(zoomWindow({ startIndex: 0, endIndex: 40 }, TOTAL, 0.5, 2, 40)).toEqual({
      startIndex: 20,
      endIndex: 40,
    })
    expect(zoomWindow({ startIndex: 0, endIndex: 40 }, TOTAL, 0.5, 2, 0)).toEqual({
      startIndex: 0,
      endIndex: 20,
    })
  })

  it('refuses to close past the minimum span', () => {
    const narrow = zoomWindow({ startIndex: 0, endIndex: 3 }, TOTAL, 0.5, 2)

    expect(narrow.endIndex - narrow.startIndex).toBe(2)
    // And a further step is a no-op rather than an inverted window.
    expect(zoomWindow(narrow, TOTAL, 0.5, 2)).toEqual(narrow)
  })

  it('always moves when it can, rather than rounding back onto itself', () => {
    // Rounding in both directions leaves a three-row window stuck at three:
    // 3 × 0.5 rounds to 2 but 2 × 0.5 rounds to 1 → clamped back to 2 → stuck.
    // Flooring on the way in is what breaks the tie.
    const step = zoomWindow({ startIndex: 0, endIndex: 5 }, TOTAL, 0.5, 1)

    expect(step.endIndex - step.startIndex).toBe(2)
  })

  it('stops at the whole dataset when zooming out', () => {
    expect(zoomWindow({ startIndex: 10, endIndex: 30 }, TOTAL, 2)).toEqual({
      startIndex: 0,
      endIndex: 40,
    })
    expect(zoomWindow({ startIndex: 0, endIndex: 40 }, TOTAL, 8)).toEqual({
      startIndex: 0,
      endIndex: 40,
    })
  })

  it('is a single point when there is a single row, and does not throw', () => {
    expect(zoomWindow({ startIndex: 0, endIndex: 0 }, 1, 0.5)).toEqual({
      startIndex: 0,
      endIndex: 0,
    })
    expect(zoomWindow({ startIndex: 0, endIndex: 0 }, 0, 0.5)).toEqual({
      startIndex: 0,
      endIndex: 0,
    })
  })
})

describe('panning', () => {
  it('slides the window and keeps its span', () => {
    expect(panWindow({ startIndex: 10, endIndex: 30 }, TOTAL, 5)).toEqual({
      startIndex: 15,
      endIndex: 35,
    })
  })

  it('stops at the end rather than shrinking against it', () => {
    // A pan that narrowed itself at the edge would change the scale under the
    // reader, which is a different gesture from the one they made.
    const far = panWindow({ startIndex: 10, endIndex: 30 }, TOTAL, 999)

    expect(far).toEqual({ startIndex: 20, endIndex: 40 })
    expect(far.endIndex - far.startIndex).toBe(20)
  })

  it('stops at the start the same way', () => {
    expect(panWindow({ startIndex: 10, endIndex: 30 }, TOTAL, -999)).toEqual({
      startIndex: 0,
      endIndex: 20,
    })
  })
})

describe('clamping', () => {
  it('rights an inverted window instead of returning a negative span', () => {
    expect(clampWindow({ startIndex: 30, endIndex: 5 }, TOTAL)).toEqual({
      startIndex: 5,
      endIndex: 30,
    })
  })

  it('pulls a window that ran off both ends back inside the data', () => {
    expect(clampWindow({ startIndex: -5, endIndex: 100 }, TOTAL)).toEqual({
      startIndex: 0,
      endIndex: 40,
    })
  })

  it('opens a collapsed window out to the minimum span', () => {
    expect(clampWindow({ startIndex: 7, endIndex: 7 }, TOTAL, 2)).toEqual({
      startIndex: 7,
      endIndex: 9,
    })
  })

  it('opens it backwards when there is no room ahead', () => {
    expect(clampWindow({ startIndex: 40, endIndex: 40 }, TOTAL, 2)).toEqual({
      startIndex: 38,
      endIndex: 40,
    })
  })
})

describe('the toolbar row', () => {
  const config = { desktop: { label: 'Desktop' } } satisfies ChartConfig

  const data = Array.from({ length: 12 }, (_, index) => ({
    month: `M${index + 1}`,
    desktop: 100 + index * 10,
  }))

  const render = () =>
    rtlRender(
      <BarChart title="Visitors" config={config} data={data} xDataKey="month">
        <BarChart.Toolbar exports={['png', 'csv']} />
        <BarChart.Bar dataKey="desktop" />
      </BarChart>,
    )

  it('names every control twice, in the two places that are read', () => {
    render()

    // `aria-label` is what a screen reader announces and `title` is what a
    // pointer user sees. Both read the one label, so they cannot drift.
    for (const name of ['Zoom in', 'Zoom out', 'Reset zoom', 'Download PNG', 'Download CSV']) {
      const button = screen.getByRole('button', { name })
      expect(button).toHaveAttribute('title', name)
    }
  })

  it('keeps every control on the row rather than behind a second gesture', () => {
    render()

    // The row is capped at five controls by construction, so there is no
    // overflow menu to open — and no Radix menu for a chart to reach
    // statically. A caller with less width drops controls instead.
    const group = screen.getByRole('group', { name: 'Visitors — chart controls' })
    expect(within(group).getAllByRole('button')).toHaveLength(5)
    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument()
  })

  it('drops the controls a caller turned off', () => {
    rtlRender(
      <BarChart title="Visitors" config={config} data={data} xDataKey="month">
        <BarChart.Toolbar exports={['csv']} zoom={false} />
        <BarChart.Bar dataKey="desktop" />
      </BarChart>,
    )

    const group = screen.getByRole('group', { name: 'Visitors — chart controls' })
    expect(within(group).getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument()
  })
})
