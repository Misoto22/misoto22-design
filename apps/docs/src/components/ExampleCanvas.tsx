'use client'

import { Button, OverlayContainer, cn } from '@misoto22/design'
import { Code2, Eye, Pencil } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { EXAMPLES } from '@/generated/example-registry'
import { useMessages } from '@/i18n/useLocale'
import { CodeBlock } from './CodeBlock'

/**
 * Lazily loaded, because react-live carries a transpiler and nobody should
 * download one to look at a button. It arrives when a reader asks to edit.
 */
const Playground = lazy(() =>
  import('./Playground').then((module) => ({ default: module.Playground })),
)

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
  /** Extra room the open state needs — see `previewHeight` in the registry. */
  previewHeight?: string
}

type Direction = 'ltr' | 'rtl'
type Density = 'comfortable' | 'compact'
type View = 'preview' | 'code' | 'edit'

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
export function ExampleCanvas({ exampleKey, html, snippet, previewHeight }: ExampleCanvasProps) {
  const [view, setView] = useState<View>('preview')
  const [frame, setFrame] = useState<HTMLElement | null>(null)
  const [direction, setDirection] = useState<Direction>('ltr')
  const [density, setDensity] = useState<Density>('comfortable')
  const t = useMessages()
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
    // The key, on the element. A component page now carries several examples of
    // the same component plus the Properties panel's own preview, so "the tab
    // strip" or "the Layout group" on `/components/tabs/` names three or four
    // different controls — and a test that reaches for one of them positionally
    // is a test that no longer knows what it is driving. This is the handle that
    // says WHICH example, and it is the same string the import map is keyed by.
    <div
      data-example={exampleKey}
      className="overflow-hidden rounded-(--radius-lg) border border-(--rule)"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--rule) bg-(--paper-2) px-2 py-1.5">
        <div className="flex items-center gap-1">
          <Toggle
            label={t.canvas.direction}
            options={[
              { value: 'ltr', label: 'LTR' },
              { value: 'rtl', label: 'RTL' },
            ]}
            value={direction}
            onChange={setDirection}
          />
          <Toggle
            label={t.canvas.density}
            options={[
              { value: 'comfortable', label: t.canvas.comfortable },
              { value: 'compact', label: t.canvas.compact },
            ]}
            value={density}
            onChange={setDensity}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setView(view === 'code' ? 'preview' : 'code')}
            aria-pressed={view === 'code'}
            className="gap-2"
          >
            {view === 'code' ? (
              <Eye size={14} strokeWidth={1.5} aria-hidden />
            ) : (
              <Code2 size={14} strokeWidth={1.5} aria-hidden />
            )}
            {view === 'code' ? t.canvas.preview : t.canvas.code}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setView(view === 'edit' ? 'preview' : 'edit')}
            aria-pressed={view === 'edit'}
            className="gap-2"
          >
            <Pencil size={14} strokeWidth={1.5} aria-hidden />
            {view === 'edit' ? t.canvas.done : t.canvas.edit}
          </Button>
        </div>
      </div>

      {view === 'preview' && (
        <div
          ref={setFrame}
          dir={direction}
          data-density={density}
          className={cn('relative flex min-h-32 items-start justify-center p-8', previewHeight)}
        >
          {/* An overlay portalled to the body is positioned against the viewport,
              so it flipped above this card whenever the card sat low on the
              screen — and it never saw the direction and density set here. */}
          <OverlayContainer container={frame}>
            <div className="flex w-full max-w-full justify-center">
              <Example />
            </div>
          </OverlayContainer>
        </div>
      )}

      {view === 'code' && (
        // No language strip here: the canvas already has a toolbar directly
        // above, and two bars stacked read as a header for a header.
        <CodeBlock html={html} source={snippet} label={exampleKey} className="rounded-none border-0" />
      )}

      {view === 'edit' && (
        <div dir={direction} data-density={density}>
          <Suspense
            fallback={
              <div className="grid min-h-32 place-items-center text-sm text-(--ink-3-aa)">
                Loading the editor…
              </div>
            }
          >
            <Playground code={snippet} />
          </Suspense>
        </div>
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
              ? 'bg-(--accent) text-(--accent-foreground)'
              : 'text-(--ink-3-aa) hover:text-(--ink)',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
