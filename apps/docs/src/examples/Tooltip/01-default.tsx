'use client'

import { Button, Tooltip, TooltipProvider } from '@misoto22/design'
import { Check, Copy, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Example() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {/* The tooltip text, the icon and the button's own accessible name all
            change together. A copy control that looks identical before and
            after leaves the reader clicking it twice to be sure. */}
        <Tooltip content={copied ? 'Copied' : 'Copy to clipboard'}>
          <Button
            iconOnly
            aria-label={copied ? 'Copied' : 'Copy'}
            variant="secondary"
            onClick={() => setCopied(true)}
          >
            {copied ? (
              <Check size={16} strokeWidth={2} className="text-(--ok)" />
            ) : (
              <Copy size={16} strokeWidth={1.5} />
            )}
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
