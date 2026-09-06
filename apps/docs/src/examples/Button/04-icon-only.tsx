import { Button } from '@misoto22/design'
import { ArrowUpRight, Copy, Share2 } from 'lucide-react'

/**
 * A square control carrying a glyph and no label, for a toolbar where the word
 * would only repeat what the row already says. iconOnly leaves nothing
 * text-shaped behind, so aria-label is not optional here — an icon button
 * without one is announced as an unnamed button, and is the single most common
 * way a design system ships a control nobody can use.
 */
export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button iconOnly aria-label="Copy to clipboard" variant="secondary">
        <Copy size={16} strokeWidth={1.5} />
      </Button>
      <Button iconOnly aria-label="Share" variant="ghost">
        <Share2 size={16} strokeWidth={1.5} />
      </Button>
      <Button iconOnly aria-label="Open in a new tab">
        <ArrowUpRight size={16} strokeWidth={1.5} />
      </Button>
    </div>
  )
}
