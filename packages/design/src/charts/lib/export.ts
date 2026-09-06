import type { ChartColumn } from './figure'

/**
 * Taking a chart off the page: a PNG of the plot, or a CSV of its rows.
 *
 * Nothing here touches the DOM at module scope. Every browser API — `document`,
 * `canvas`, `URL.createObjectURL` — is reached for inside a function body, so
 * this module is safe to import from a server component and only fails when a
 * consumer actually asks for a file on a server, which is a call that cannot
 * succeed anywhere.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * The properties copied from the live DOM onto the serialised clone.
 *
 * Paint, geometry-adjacent paint, and type. Layout is deliberately absent: an
 * SVG's geometry is in its attributes, which the clone already carries, and
 * copying computed `width`/`height`/`transform` onto every node would fight
 * them.
 */
const PAINTED_PROPERTIES = [
  'display',
  'visibility',
  'opacity',
  'color',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stop-color',
  'stop-opacity',
  'flood-color',
  'flood-opacity',
  'mask',
  'filter',
  'clip-path',
  'clip-rule',
  'paint-order',
  'mix-blend-mode',
  'shape-rendering',
  'text-anchor',
  'dominant-baseline',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'text-transform',
] as const

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
 * ## The problem this function exists to solve
 *
 * Serialising the `<svg>` and handing it to an `<img>` puts it in a document
 * of its own. That document has none of the page's stylesheets, so every
 * `var(--color-desktop-0)`, `var(--chart-fill)` and `var(--ink)` in the markup
 * resolves to nothing — and a paint that resolves to nothing is not a fallback
 * colour, it is an invisible mark. Serialise a chart naively and you get an
 * empty rectangle with axes on it.
 *
 * ## The solution
 *
 * Walk the live tree and the clone in step, and on every node write
 * `getComputedStyle`'s answer for the painted properties into an inline
 * `style`. Computed values have already had `var()` substituted by the engine,
 * so `fill: var(--color-desktop-0)` arrives as `fill: rgb(16, 16, 16)` — and,
 * because the walk reads the LIVE element, it reads it under whichever theme
 * is currently applied. Light and dark come out right for free, with no theme
 * argument anywhere in this file.
 *
 * `<stop>` elements are walked too, which is the half that is easy to miss: a
 * series is painted `fill="url(#…-colors-desktop)"`, the url survives
 * serialisation because the gradient is inside the same `<svg>`, and it is the
 * gradient's STOPS that carry the custom properties.
 *
 * ## What this cannot capture, honestly
 *
 * - **Anything drawn in HTML.** The legend, the tooltip, the brush strip and
 *   the hidden data table are DOM, not SVG. The PNG is the plot.
 * - **Web fonts.** The isolated document cannot fetch the page's `@font-face`
 *   sources, so text is rasterised in whatever the resolved family stack finds
 *   locally. Type metrics will differ from the screen.
 * - **Cross-origin images.** A chart with an external `<image>` in it taints
 *   the canvas and `toBlob` throws; there is no way around it from script.
 * - **The exact rendering.** This is the browser's SVG rasteriser re-drawing
 *   the markup, not a screenshot. Antialiasing, `backdrop-filter` and any
 *   effect a page stylesheet applied from outside the `<svg>` are not in it.
 *
 * @example
 * const blob = await chartToPng(plotRef.current, { title: 'Visitors per month' })
 * downloadBlob(blob, 'visitors-per-month.png')
 */
export async function chartToPng(
  element: HTMLElement | SVGSVGElement,
  options: ChartPngOptions = {},
): Promise<Blob> {
  const { title, scale = 2, background, padding = 16 } = options

  const svg = findPlotSvg(element)
  if (!svg) throw new Error('chartToPng: found no <svg> to export inside the element it was given')

  const box = svg.getBoundingClientRect()
  const width = Math.ceil(box.width)
  const height = Math.ceil(box.height)
  if (width === 0 || height === 0) {
    // A chart that has not been measured yet has no size to export. Silently
    // producing a 0×0 PNG would look like a broken download rather than a
    // too-early call.
    throw new Error('chartToPng: the chart has no measured size yet — export it after it renders')
  }

  const clone = svg.cloneNode(true) as SVGSVGElement
  inlinePaint(svg, clone)
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  const titleBand = title ? 30 : 0
  const totalWidth = width + padding * 2
  const totalHeight = height + padding * 2 + titleBand

  const page = document.createElementNS(SVG_NS, 'svg')
  page.setAttribute('xmlns', SVG_NS)
  page.setAttribute('width', String(totalWidth))
  page.setAttribute('height', String(totalHeight))
  page.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`)

  const plate = document.createElementNS(SVG_NS, 'rect')
  plate.setAttribute('width', String(totalWidth))
  plate.setAttribute('height', String(totalHeight))
  plate.setAttribute('fill', background ?? readToken(element, '--chart-surface', '#ffffff'))
  page.append(plate)

  if (title) {
    const caption = document.createElementNS(SVG_NS, 'text')
    caption.setAttribute('x', String(padding))
    caption.setAttribute('y', String(padding + 14))
    caption.setAttribute('fill', readToken(element, '--ink', '#101010'))
    caption.setAttribute('font-size', '13')
    caption.setAttribute('font-weight', '500')
    caption.setAttribute('font-family', getComputedStyle(element).fontFamily || 'sans-serif')
    caption.textContent = title
    page.append(caption)
  }

  const group = document.createElementNS(SVG_NS, 'g')
  group.setAttribute('transform', `translate(${padding}, ${padding + titleBand})`)
  group.append(clone)
  page.append(group)

  const markup = new XMLSerializer().serializeToString(page)
  const url = URL.createObjectURL(
    new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${markup}`], {
      type: 'image/svg+xml;charset=utf-8',
    }),
  )

  try {
    const image = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(totalWidth * scale)
    canvas.height = Math.ceil(totalHeight * scale)

    const context = canvas.getContext('2d')
    if (!context) throw new Error('chartToPng: this browser gave back no 2D canvas context')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return await canvasToBlob(canvas)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * The plot's `<svg>`, not the first `<svg>` in the subtree.
 *
 * The distinction matters because the toolbar sits inside the same wrapper and
 * every icon in it is an `<svg>`. Narrowing to the measured chart box first is
 * what stops an export of a chart from being a picture of a magnifying glass.
 */
function findPlotSvg(element: HTMLElement | SVGSVGElement): SVGSVGElement | null {
  if (element.tagName.toLowerCase() === 'svg') return element as SVGSVGElement
  const scope = element.querySelector('[data-slot="chart"]') ?? element
  return scope.querySelector<SVGSVGElement>('svg.recharts-surface') ?? scope.querySelector('svg')
}

/** Copies the resolved paint of every node in `live` onto the matching node in `clone`. */
function inlinePaint(live: Element, clone: Element): void {
  const computed = getComputedStyle(live)
  let css = ''
  for (const property of PAINTED_PROPERTIES) {
    const value = computed.getPropertyValue(property)
    if (value) css += `${property}:${value};`
  }
  if (css) clone.setAttribute('style', css)

  // The clone is a faithful deep copy, so child lists line up by index.
  const children = live.children
  const clones = clone.children
  for (let index = 0; index < children.length; index += 1) {
    const liveChild = children[index]
    const cloneChild = clones[index]
    if (liveChild && cloneChild) inlinePaint(liveChild, cloneChild)
  }
}

/**
 * A custom property, resolved against the live element.
 *
 * `var()` inside a custom property is substituted at computed-value time, so
 * `--chart-surface: var(--paper)` reads back as a colour. The guard is for the
 * case where it did not — an unregistered name, or a value the engine left as
 * a token stream — because writing `var(--paper)` into a serialised SVG paints
 * nothing at all.
 */
function readToken(element: Element, name: string, fallback: string): string {
  const value = getComputedStyle(element).getPropertyValue(name).trim()
  return value && !value.includes('var(') ? value : fallback
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () =>
      reject(new Error('chartToPng: the browser refused to decode the serialised chart')),
    )
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('chartToPng: the canvas produced no PNG data'))
      }, 'image/png')
    } catch (cause) {
      // A cross-origin image anywhere in the plot taints the canvas and this
      // throws SecurityError. Nothing in script can untaint it, so the honest
      // move is to say which failure it was.
      reject(
        new Error(
          'chartToPng: the canvas is tainted, which means the chart contains a cross-origin image',
          { cause },
        ),
      )
    }
  })
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

/**
 * Hands a blob to the browser as a download.
 *
 * Throws rather than no-oping without a `document`: a download is something a
 * person just asked for, and a silent return would look to them like a click
 * that did nothing.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') {
    throw new Error('downloadBlob: needs a browser document — call it from an event handler')
  }

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  anchor.style.display = 'none'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  // Revoking in the same tick cancels the download in Safari; one turn of the
  // event loop is enough for the navigation to have started.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * A figure's title as a filename.
 *
 * Lowercase, ASCII-safe and hyphenated, because a downloaded file crosses into
 * shells, zip archives and Windows paths where a title's spaces and slashes
 * are someone else's problem.
 */
export function exportFilename(title: string, extension: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'chart'}.${extension}`
}
