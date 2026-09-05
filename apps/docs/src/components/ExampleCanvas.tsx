'use client'

import { Button, cn } from '@misoto22/design'
import { Code2, Eye } from 'lucide-react'
import { useState } from 'react'
import { EXAMPLES } from '@/generated/example-registry'
import { CodeBlock } from './CodeBlock'

export interface ExampleCanvasProps {
  /**
   * `Directory/example-id` — the key into the generated import map.
   *
   * A key rather than the component itself: React cannot pass a function from a
   * server component into a client one, and the canvas has to be a client
   * component because it owns the preview/code toggle. Looking the component up
   * on this side of the boundary is the whole fix.
   */
  exampleKey: string
  html: string
  snippet: string
}

/**
 * A live component beside the code that produced it.
 *
 * The preview and the snippet come from ONE file: the example is a real `.tsx`
 * module that this canvas renders, and `generate.mjs` reads the same module's
 * text for the code block. A documentation site that keeps the two apart always
 * ends up showing code that no longer produces the picture beside it.
 */
export function ExampleCanvas({ exampleKey, html, snippet }: ExampleCanvasProps) {
  const [showCode, setShowCode] = useState(false)
  const Example = EXAMPLES[exampleKey]

  if (!Example) {
    // Generated data and registry disagreeing is a build-time mistake, not a
    // runtime state; say so where it is visible rather than rendering a gap.
    return (
      <p className="m-0 rounded-(--radius) border border-(--danger) p-4 text-sm text-(--danger)">
        No example is registered for <code className="font-mono text-xs">{exampleKey}</code>.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-(--radius-lg) border border-(--rule)">
      <div className="flex items-center justify-end border-b border-(--rule) bg-(--paper-2) px-2 py-1.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowCode((previous) => !previous)}
          aria-expanded={showCode}
          className="gap-2"
        >
          {showCode ? (
            <Eye size={14} strokeWidth={1.5} aria-hidden />
          ) : (
            <Code2 size={14} strokeWidth={1.5} aria-hidden />
          )}
          {showCode ? 'Preview' : 'Code'}
        </Button>
      </div>

      <div className={cn('flex min-h-32 items-center justify-center p-8', showCode && 'hidden')}>
        <div className="flex w-full max-w-full justify-center">
          <Example />
        </div>
      </div>

      {showCode && <CodeBlock html={html} source={snippet} className="rounded-none border-0" />}
    </div>
  )
}
