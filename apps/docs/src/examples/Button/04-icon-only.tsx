import { Button } from '@misoto22/design'
import { ArrowUpRight, Copy, Share2 } from 'lucide-react'

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
