'use client'

import { useState, type ReactNode, type RefObject } from 'react'
import { cn } from '../../lib/cn'
import {
  downloadBlob,
  exportFilename,
  rasterize,
  readToken,
  serializeSvg,
} from '../../lib/svg-export'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu'
import { Button } from '../../components/Button/Button'

/** The files a figure can be taken away as. */
export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg' | 'share-card'

/** What came of an export, for a page that wants to say so. */
export interface ExportResult {
  format: ExportFormat
  ok: boolean
  error?: Error
}

/** A share card is a fixed frame, because the surfaces that consume one are. */
const SHARE_CARD = { width: 1200, height: 630 } as const

const ITEMS: { format: ExportFormat; title: string; hint: string; group: string }[] = [
  { group: 'Image', format: 'png', title: 'PNG', hint: 'Lossless, 2× for retina' },
  { group: 'Image', format: 'jpeg', title: 'JPEG', hint: 'Compact, flattened onto paper' },
  { group: 'Image', format: 'webp', title: 'WebP', hint: 'Smaller, modern browsers' },
  { group: 'Vector', format: 'svg', title: 'SVG', hint: 'Editable, colours resolved' },
  { group: 'Share', format: 'share-card', title: 'Share card', hint: '1200 × 630 PNG' },
]

export interface DiagramExportMenuProps {
  /**
   * The `<svg>` to export, or an element containing exactly one.
   *
   * A ref rather than a selector, because a page can hold several figures and a
   * selector would export whichever the document happened to reach first.
   */
  targetRef: RefObject<HTMLElement | SVGSVGElement | null>
  /** Names the file, and is printed on the share card. */
  title: string
  /** Replaces the trigger. */
  trigger?: ReactNode
  className?: string
  /** Runs instead of the built-in export — for a caller with its own pipeline. */
  onExport?: (format: ExportFormat) => void | Promise<void>
  /** Told what happened, so a page can raise a toast. */
  onResult?: (result: ExportResult) => void
}

/**
 * Taking the figure off the page: five files, one menu.
 *
 * WHY THE MENU DOES THE WORK rather than handing back a format: every one of
 * these exports is the same six steps — find the `<svg>`, walk it with
 * `getComputedStyle` to bake the custom properties into real colours,
 * serialise, rasterise, name the file, hand it to the browser — and only the
 * last two differ between them. A menu that emitted `'png'` and left the caller
 * to do the rest would be a menu that every consumer reimplements, badly, and
 * the interesting half (a serialised SVG resolves `var(--ink)` to nothing and
 * comes out invisible) is exactly the half a caller would not know to write.
 *
 * `onExport` is still there for a page with its own pipeline — a server-side
 * renderer, a different frame size — and taking it turns everything below into
 * a no-op.
 *
 * What each format actually is, stated rather than implied.
 *
 * **SVG** is the artwork with resolved colours. It is editable and it is the
 * only lossless one, but it carries no web fonts: a machine without the family
 * renders it in a fallback, so type metrics will differ.
 *
 * **PNG, JPEG and WebP** are the browser's own rasteriser re-drawing that SVG
 * at 2×. Not a screenshot — antialiasing and any effect a page stylesheet
 * applied from OUTSIDE the `<svg>` are not in it. **JPEG has no alpha**, so it
 * is flattened onto the resolved paper colour rather than onto black, which is
 * what a transparent PNG becomes when a format with no transparency is asked
 * to hold it.
 *
 * **The share card** is a 1200 × 630 frame with the title on it and the whole
 * diagram letterboxed inside — never cropped. A card that cropped to fill the
 * frame would be a picture of a different diagram.
 */
export function DiagramExportMenu({
  targetRef,
  title,
  trigger,
  className,
  onExport,
  onResult,
}: DiagramExportMenuProps) {
  const [busy, setBusy] = useState<ExportFormat | null>(null)

  async function run(format: ExportFormat) {
    setBusy(format)
    try {
      if (onExport) {
        await onExport(format)
      } else {
        await exportFigure(targetRef.current, title, format)
      }
      onResult?.({ format, ok: true })
    } catch (cause) {
      // Never swallowed: a download is something the reader just asked for, and
      // a click that quietly does nothing is indistinguishable from a broken
      // button. The caller gets the error to put in front of them.
      onResult?.({ format, ok: false, error: cause as Error })
    } finally {
      setBusy(null)
    }
  }

  const groups = [...new Set(ITEMS.map((item) => item.group))]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="secondary" className={className}>
            Export
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {groups.map((group, index) => (
          <div key={group}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group}</DropdownMenuLabel>
            {ITEMS.filter((item) => item.group === group).map((item) => (
              <button
                key={item.format}
                type="button"
                disabled={busy !== null}
                onClick={() => void run(item.format)}
                className={cn(
                  'flex w-full flex-col items-start gap-0.5 rounded-(--radius-sm) px-2 py-1.5 text-start',
                  'transition-colors duration-(--duration-fast)',
                  'hover:bg-(--stone) focus-visible:bg-(--stone) focus-visible:outline-none',
                  'disabled:pointer-events-none disabled:opacity-(--disabled-opacity)',
                )}
              >
                <span className="text-[13px] leading-tight text-(--ink)">
                  {item.title}
                  {busy === item.format && ' …'}
                </span>
                <span className="mono-meta text-(--ink-3-aa)">{item.hint}</span>
              </button>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * One figure, one format, one file.
 *
 * Exported so a page can wire a keyboard shortcut or its own button to exactly
 * what the menu does, without reimplementing the six steps.
 */
export async function exportFigure(
  target: HTMLElement | SVGSVGElement | null,
  title: string,
  format: ExportFormat,
): Promise<void> {
  const svg = findArtwork(target)
  if (!svg) throw new Error('exportFigure: found no <svg> to export inside the given element')

  // Read against the LIVE element, so the file comes out in whichever theme the
  // reader is looking at rather than in whichever one the code assumed.
  const paper = readToken(svg, '--diagram-surface', '#ffffff')
  const ink = readToken(svg, '--ink', '#101010')
  const font = getComputedStyle(svg).fontFamily || 'sans-serif'

  if (format === 'share-card') {
    const markup = serializeSvg(svg, {
      padding: 56,
      background: paper,
      title,
      titleColor: ink,
      titleFont: font,
      frame: SHARE_CARD,
    })
    const blob = await rasterize(markup, 'png', { scale: 1 })
    downloadBlob(blob, exportFilename(title, 'png', 'share-card'))
    return
  }

  const markup = serializeSvg(svg, { padding: 20, background: paper })

  if (format === 'svg') {
    downloadBlob(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }), exportFilename(title, 'svg'))
    return
  }

  const blob = await rasterize(markup, format, {
    scale: 2,
    // JPEG has no alpha channel, so an unflattened export lands on black.
    background: format === 'jpeg' ? paper : undefined,
  })
  downloadBlob(blob, exportFilename(title, format))
}

/**
 * The figure's own `<svg>`, not the first one in the subtree.
 *
 * The distinction is load-bearing: a toolbar sits inside the same wrapper and
 * every icon in it is an `<svg>`. Looking for the artwork marker first is what
 * stops an export of a diagram from being a picture of a chevron.
 */
function findArtwork(element: HTMLElement | SVGSVGElement | null): SVGSVGElement | null {
  if (!element) return null
  if (element.tagName.toLowerCase() === 'svg') return element as SVGSVGElement
  return (
    element.querySelector<SVGSVGElement>('svg[data-diagram-artwork]') ??
    element.querySelector<SVGSVGElement>('svg')
  )
}

export default DiagramExportMenu
