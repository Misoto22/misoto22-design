'use client'

import { Button, cn } from '@misoto22/design'
import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface CodeBlockProps {
  /** Shiki output, highlighted at build time. */
  html: string
  /** The raw text, for the copy button. */
  source: string
  className?: string
}

/**
 * A highlighted snippet with a copy control.
 *
 * The markup is produced by Shiki during `generate.mjs`, not in the browser: a
 * highlighter is a few hundred kilobytes of grammar, and shipping it to
 * re-derive spans that never change would be the largest thing on the page.
 */
export function CodeBlock({ html, source, className }: CodeBlockProps) {
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
        'group relative overflow-hidden rounded-(--radius) border border-(--rule) bg-(--paper-2)',
        className,
      )}
    >
      <Button
        iconOnly
        size="sm"
        variant="ghost"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy the snippet'}
        className="absolute right-2 top-2 z-1 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? (
          <Check size={14} strokeWidth={1.5} aria-hidden />
        ) : (
          <Copy size={14} strokeWidth={1.5} aria-hidden />
        )}
      </Button>
      <div
        className="overflow-x-auto px-4 py-3.5 scroll-slim [&_pre]:m-0 [&_pre]:bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
