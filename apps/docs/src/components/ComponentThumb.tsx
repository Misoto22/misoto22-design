'use client'

import { OverlayContainer } from '@misoto22/design'
import { useEffect, useState } from 'react'
import { EXAMPLES } from '@/generated/example-registry'

/**
 * The component itself, running, at the top of its card in the index.
 *
 * A gallery of forty-nine names and one-line summaries makes a reader open a
 * page to find out what a thing looks like, and then go back. The card can
 * answer that where it is asked.
 *
 * It is the real component from the real example, not a picture: a screenshot
 * would need generating, would go stale silently, and would not follow the
 * reader's theme.
 *
 * `inert`, so the whole card stays one link and the index does not become
 * forty-nine tab stops before the first heading.
 *
 * Shrunk with `zoom`, not `transform: scale`. Scale only touches paint: the
 * layout box stays full size, so a component that MEASURES itself — the toggle
 * group's sliding pill, say — reads unscaled pixels and lands in the wrong
 * place, and the band clips a box larger than what it shows. `zoom` scales the
 * layout, so both stay honest.
 *
 * Mounted rather than server-rendered. The site is a static export, so its HTML
 * is months older than the visit — and an example that renders today's date
 * hydrates against a build-time "today" and mismatches. These are decorative
 * and `aria-hidden`, so nothing is lost by drawing them after mount, and the
 * shipped HTML stays a page of forty-nine links rather than forty-nine apps.
 */
export function ComponentThumb({ exampleKey }: { exampleKey: string }) {
  const [frame, setFrame] = useState<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const Example = EXAMPLES[exampleKey]
  if (!Example) return null

  return (
    <div
      ref={setFrame}
      inert
      aria-hidden
      className="relative -mx-4 -mt-4 mb-1 grid h-28 place-items-center overflow-hidden border-b border-(--rule) bg-(--paper-2)"
    >
      {mounted && (
        <div className="pointer-events-none [zoom:0.72]">
          <OverlayContainer container={frame}>
            <Example />
          </OverlayContainer>
        </div>
      )}
    </div>
  )
}
