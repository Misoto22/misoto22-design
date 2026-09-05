'use client'

import { Button, Tooltip, TooltipProvider } from '@misoto22/design'
import { Copy, Share2 } from 'lucide-react'

export function Example() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <Tooltip content="Copy to clipboard">
          <Button iconOnly aria-label="Copy" variant="secondary">
            <Copy size={16} strokeWidth={1.5} />
          </Button>
        </Tooltip>
        <Tooltip content="Share this frame" side="bottom">
          <Button iconOnly aria-label="Share" variant="secondary">
            <Share2 size={16} strokeWidth={1.5} />
          </Button>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
