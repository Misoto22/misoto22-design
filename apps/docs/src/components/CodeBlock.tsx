'use client'

import { Button, cn } from '@misoto22/design'
import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface CodeBlockProps {
  /** Shiki output, highlighted at build time. */
  html: string
  /** The raw text, for the copy button. */
  source: string
  /** Names the scroll region. Defaults to something generic; pass better. */
  label?: string
  className?: string
}

/**
 * A highlighted snippet with a copy control.
 *
 * The markup is produced by Shiki during `generate.mjs`, not in the browser: a
 * highlighter is a few hundred kilobytes of grammar, and shipping it to
 * re-derive spans that never change would be the largest thing on the page.
 */
export function CodeBlock({ html, source, label = 'Code', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
    } catch {
      // Clipboard access is denied in some embedded contexts. The snippet is
      // still selectable, so there is nothing to recover — and a thrown error
      // here would take the page down with it.
    }
  }

  return (
    <div
      className={cn(
        // `min-w-0` is what lets the scroller inside actually scroll. A grid or
        // flex item defaults to `min-width: auto`, so without it the block grew
        // to the min-content width of its longest line — an unbroken install
        // command — and pushed the whole page sideways on a phone.
        'group relative min-w-0 overflow-hidden rounded-(--radius) border border-(--rule) bg-(--paper-2)',
        className,
      )}
    >
      <Button
        iconOnly
        size="sm"
        variant="ghost"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy the snippet'}
        // Hidden until hover on a mouse; always there, and tappable, on a touch
        // screen. A control that only appears on hover does not exist on a
        // phone, and 36px is under the pointer-target floor once it does.
        className="absolute end-2 top-2 z-1 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:opacity-100"
      >
        {copied ? (
          <Check size={14} strokeWidth={1.5} aria-hidden />
        ) : (
          <Copy size={14} strokeWidth={1.5} aria-hidden />
        )}
      </Button>
      {/* Focusable, because a snippet that scrolls sideways and contains
          nothing focusable is unreachable by keyboard — there is no element to
          Tab to, so the right-hand half of a long line does not exist for
          anyone not using a mouse. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={label}
        className="overflow-x-auto px-4 py-3.5 scroll-slim [&_pre]:m-0 [&_pre]:bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
