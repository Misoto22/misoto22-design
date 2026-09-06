import type { ChartColumn } from './figure'
import {
  downloadBlob,
  exportFilename as figureFilename,
  rasterize,
  readToken,
  serializeSvg,
} from '../../lib/svg-export'

/**
 * Taking a chart off the page: a PNG of the plot, or a CSV of its rows.
 *
 * The general half — walking a live tree to inline its resolved paint,
 * serialising a standalone SVG document, rasterising one through a canvas — is
 * not chart-shaped at all, and lives in `src/lib/svg-export.ts` shared with the
 * diagrams entry. What is left here is what only a Recharts chart knows: which
 * `<svg>` in the subtree is the plot, what a row of chart data looks like as a
 * CSV record, and that the ground behind an exported plot is `--chart-surface`.
 *
 * Nothing here touches the DOM at module scope. Every browser API is reached
 * for inside a function body, so this module is safe to import from a server
 * component and only fails when a consumer actually asks for a file on a
 * server, which is a call that cannot succeed anywhere.
 */

export interface ChartPngOptions {
  /**
   * Printed above the plot in the exported image. Pass the figure's title: a
   * PNG travels into a slide deck with none of the page's context around it,
   * and an unnamed plot in a deck is a plot nobody can cite.
   */
  title?: string
  /** Multiplier on the on-screen size. 2 is a retina-sharp export. */
  scale?: number
  /**
   * Painted behind the plot. Defaults to the resolved `--chart-surface`, which
   * is what makes a dark-mode export come out dark rather than transparent.
   */
  background?: string
  /** Space around the plot, in CSS pixels. */
  padding?: number
}

/**
 * The chart's `<svg>`, rasterised to a PNG blob.
 *
 * Three chart-specific decisions and nothing else. `serializeSvg` does the
 * work, and its comment carries the reason a naive `XMLSerializer` export of a
 * themed chart comes out as an empty rectangle with axes on it.
 *
 * 1. WHICH `<svg>` — the plot, not the first one in the subtree. See
 *    `findPlotSvg`.
 * 2. WHAT GROUND — `--chart-surface`, resolved against the live element, which
 *    is what makes a dark-mode export come out dark rather than transparent.
 * 3. WHAT INK AND FACE for the caption — `--ink` and the element's own
 *    resolved family, so the exported title matches the page it came from.
 *
 * ## What this cannot capture, honestly
 *
 * - **Anything drawn in HTML.** The legend, the tooltip, the brush strip and
 *   the hidden data table are DOM, not SVG. The PNG is the plot.
 * - **Web fonts, cross-origin images, and the exact rendering.** See
 *   `serializeSvg` and `rasterize`.
 *
 * @example
 * const blob = await chartToPng(plotRef.current, { title: 'Visitors per month' })
 * downloadBlob(blob, exportFilename('Visitors per month', 'png'))
 */
export async function chartToPng(
  element: HTMLElement | SVGSVGElement,
  options: ChartPngOptions = {},
): Promise<Blob> {
  const { title, scale = 2, background, padding = 16 } = options

  const svg = findPlotSvg(element)
  if (!svg) throw new Error('chartToPng: found no <svg> to export inside the element it was given')

  const markup = serializeSvg(svg, {
    padding,
    background: background ?? readToken(element, '--chart-surface', '#ffffff'),
    title,
    titleColor: readToken(element, '--ink', '#101010'),
    titleFont: getComputedStyle(element).fontFamily || 'sans-serif',
  })

  return rasterize(markup, 'png', { scale })
}

/**
 * The plot's `<svg>`, not the first `<svg>` in the subtree.
 *
 * Two narrowings, and both are load-bearing. The toolbar sits outside the plot
 * wrapper and every control in it is an `<svg>`, so the scope comes first;
 * INSIDE the wrapper the legend draws its own swatches, so `.recharts-surface`
 * comes second. Either one missing exports a picture of an icon, which looks
 * like a working download until somebody opens the file.
 */
function findPlotSvg(element: HTMLElement | SVGSVGElement): SVGSVGElement | null {
  if (element.tagName.toLowerCase() === 'svg') return element as SVGSVGElement
  const scope = element.querySelector('[data-slot="chart"]') ?? element
  return scope.querySelector<SVGSVGElement>('svg.recharts-surface') ?? scope.querySelector('svg')
}

/**
 * A UTF-8 byte order mark.
 *
 * Excel does not sniff encodings. Handed a CSV with no BOM it decodes the file
 * with the machine's legacy code page, so "Müller", "東京" and "€" arrive as
 * mojibake on most Windows installs — and the reader's conclusion is that the
 * export is broken, not that the encoding was guessed. The BOM is the only
 * in-band signal Excel honours, and every other tool skips it silently.
 */
const UTF8_BOM = '\uFEFF'

/**
 * The chart's rows as RFC 4180 CSV.
 *
 * Quotes a field only when it needs quoting — a comma, a double quote, or a
 * line break in it — doubles any quote inside, and separates records with CRLF
 * as the RFC requires rather than with the `\n` a Unix habit would reach for.
 *
 * Numbers are written unformatted on purpose. `1,234` would need quoting and
 * would then land in the spreadsheet as text, which is the one thing a numeric
 * export must not do; formatting belongs to the chart, not to the file.
 *
 * A column's `label` is a `ReactNode`, so only a string or a number can be a
 * header. Anything else falls back to the column's key, which is a worse
 * header than the label but a better one than an empty cell.
 *
 * @example
 * const csv = chartToCsv(data, [{ key: 'desktop', label: 'Desktop' }])
 * downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'visitors.csv')
 */
export function chartToCsv(rows: Record<string, unknown>[], columns: ChartColumn[]): string {
  if (columns.length === 0) return UTF8_BOM

  const lines = [columns.map((column) => csvField(headerText(column))).join(',')]

  for (const row of rows) {
    lines.push(columns.map((column) => csvField(cellText(row[column.key]))).join(','))
  }

  // The RFC makes the last CRLF optional; writing it matches what a
  // spreadsheet emits and keeps the file from ending mid-record in a terminal.
  return `${UTF8_BOM}${lines.join('\r\n')}\r\n`
}

/** One field, quoted only when the RFC says it has to be. */
function csvField(value: string): string {
  if (!/[",\r\n]/.test(value)) return value
  return `"${value.replace(/"/g, '""')}"`
}

/** A column's header text, falling back to its key when the label is markup. */
function headerText(column: ChartColumn): string {
  const { label } = column
  if (typeof label === 'string') return label
  if (typeof label === 'number') return String(label)
  return column.key
}

/** A cell value as text. Anything that is not a primitive reads as empty. */
function cellText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  if (typeof value === 'string' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  return ''
}

export { downloadBlob }

/**
 * A figure's title as a filename.
 *
 * The shared slugger, with `chart` rather than `figure` as the fallback for a
 * title that slugs to nothing — an export from this entry is a chart, and the
 * name a reader finds in their downloads folder should say so.
 */
export function exportFilename(title: string, extension: string): string {
  return figureFilename(title, extension, 'chart')
}
