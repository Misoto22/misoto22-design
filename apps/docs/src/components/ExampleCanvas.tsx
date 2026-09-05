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

type Direction = 'ltr' | 'rtl'
type Density = 'comfortable' | 'compact'

/**
 * A live component beside the code that produced it, and the two axes that
 * change how it renders.
 *
 * The preview and the snippet come from ONE file: the example is a real `.tsx`
 * module that this canvas renders, and `generate.mjs` reads the same module's
 * text for the code block. A documentation site that keeps the two apart always
 * ends up showing code that no longer produces the picture beside it.
 *
 * The direction and density switches are not a novelty. Both are properties a
 * consumer sets on a container and every component below inherits — so the
 * only honest way to document them is to let a reader flip them and watch. A
 * screenshot of a compact button proves nothing about whether the input beside
 * it also shrank.
 */
export function ExampleCanvas({ exampleKey, html, snippet }: ExampleCanvasProps) {
  const [showCode, setShowCode] = useState(false)
  const [direction, setDirection] = useState<Direction>('ltr')
  const [density, setDensity] = useState<Density>('comfortable')
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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--rule) bg-(--paper-2) px-2 py-1.5">
        <div className="flex items-center gap-1">
          <Toggle
            label="Text direction"
            options={[
              { value: 'ltr', label: 'LTR' },
              { value: 'rtl', label: 'RTL' },
            ]}
            value={direction}
            onChange={setDirection}
          />
          <Toggle
            label="Density"
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
            value={density}
            onChange={setDensity}
          />
        </div>
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

      <div
        dir={direction}
        data-density={density}
        className={cn('flex min-h-32 items-center justify-center p-8', showCode && 'hidden')}
      >
        <div className="flex w-full max-w-full justify-center">
          <Example />
        </div>
      </div>

      {showCode && (
        <CodeBlock html={html} source={snippet} label={exampleKey} className="rounded-none border-0" />
      )}
    </div>
  )
}

/**
 * A two-state switch, as a radiogroup rather than a pair of buttons.
 *
 * The two options are mutually exclusive views of one setting, which is what a
 * radiogroup means. Two independent buttons would be two tab stops and would
 * announce no relationship between them.
 */
function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center rounded-(--radius-pill) border border-(--rule)"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-(--radius-pill) px-2.5 py-1 mono-meta transition-colors duration-(--duration-fast)',
            value === option.value
              ? 'bg-(--ink) text-(--paper)'
              : 'text-(--ink-3-aa) hover:text-(--ink)',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
