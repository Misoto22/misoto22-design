'use client'

import { OverlayContainer } from '@misoto22/design'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EXAMPLES } from '@/generated/example-registry'

/**
 * The component itself, running, at the top of its card in the index.
 *
 * A gallery of names and one-line summaries makes a reader open a page to find
 * out what a thing looks like, and then go back. The card can answer that where
 * it is asked.
 *
 * It is the real component from the real example, not a picture: a screenshot
 * would need generating, would go stale silently, and would not follow the
 * reader's theme.
 *
 * `inert`, so the whole card stays one link and the index does not become a
 * hundred tab stops before the first heading.
 *
 * Scaled with `zoom`, not `transform: scale`. Scale only touches paint: the
 * layout box stays full size, so a component that MEASURES itself — the toggle
 * group's sliding pill, say — reads unscaled pixels and lands in the wrong
 * place, and the band clips a box larger than what it shows. `zoom` scales the
 * layout, so both stay honest.
 *
 * Mounted rather than server-rendered. The site is a static export, so its HTML
 * is months older than the visit — and an example that renders today's date
 * hydrates against a build-time "today" and mismatches. These are decorative
 * and `aria-hidden`, so nothing is lost by drawing them after mount, and the
 * shipped HTML stays a page of links rather than a page of apps.
 */
export function ComponentThumb({ exampleKey }: { exampleKey: string }) {
  const [frame, setFrame] = useState<HTMLElement | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  /**
   * Shrink the laid-out example until it fits the band, and no further.
   *
   * Written to the node rather than held in state: this runs on every resize
   * of every card on the page, and a state update per card per frame is a
   * gallery that stutters while it is being read.
   *
   * `min(1, …)` is the half that matters. A Badge is 60px wide and must not be
   * blown up to fill a 400px band — the point is a component at its own size
   * wherever it fits, and only the oversized ones giving something up.
   */
  const fit = useCallback(() => {
    const band = frame
    const node = box.current
    if (!band || !node) return
    node.style.zoom = '1'
    const room = { w: band.clientWidth - 40, h: band.clientHeight - 24 }
    const natural = { w: node.scrollWidth, h: node.scrollHeight }
    if (natural.w === 0 || natural.h === 0) return
    node.style.zoom = String(Math.min(1, room.w / natural.w, room.h / natural.h))
  }, [frame])

  useEffect(() => {
    if (!mounted || !frame) return
    fit()
    // Two frames, not one: an example that loads a font or settles a chart is
    // a different size on the frame after the one it mounted in.
    const settle = requestAnimationFrame(() => requestAnimationFrame(fit))
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    return () => {
      cancelAnimationFrame(settle)
      observer.disconnect()
    }
  }, [mounted, frame, fit])

  const Example = EXAMPLES[exampleKey]
  if (!Example) return null

  return (
    <div
      ref={setFrame}
      inert
      aria-hidden
      // `-mx-5 -mt-5` matches `CardBody`'s own `p-5`. At `-4` the band stopped
      // four pixels short of the card on three sides, which read as a sliver of
      // paper around a grey box rather than as a bleed.
      //
      // A fixed height, and the same one on every card: the band is the half of
      // the card a reader is actually looking at, so it is the half that must
      // not move from card to card.
      className="relative -mx-5 -mt-5 mb-3 grid h-44 place-items-center overflow-hidden border-b border-(--rule) bg-(--paper-2)"
    >
      {mounted && (
        // 440px, and the same 440 on every card. This is the whole fix for a
        // gallery that used to squeeze its examples: a component handed the
        // CARD's width reflows into it, so a three-column BigNumber wrapped
        // every label onto two lines and its figures collided with them, and a
        // FigureBand stacked its counts on top of each other. What the card
        // showed was not the component but the component having a bad time.
        // Laying every example out at one comfortable width and shrinking the
        // result makes a thumbnail the same picture at every card size, and the
        // card never has to be wide enough for the example — only proportional
        // to it.
        <div ref={box} className="pointer-events-none w-[440px] origin-center">
          <OverlayContainer container={frame}>
            <Example />
          </OverlayContainer>
        </div>
      )}
    </div>
  )
}
