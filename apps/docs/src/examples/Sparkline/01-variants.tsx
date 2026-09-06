'use client'

import { Sparkline, type SparklineVariant } from '@misoto22/design/charts'

const data = [12, 18, 9, 24, 30, 22, 41, 36, 48, 44, 57, 61]

const VARIANTS: SparklineVariant[] = ['line', 'area', 'bars']

export function Example() {
  // Axis-less, gridless and label-less by design: every piece of chrome that
  // would let it answer "what value exactly" also makes it too big to sit
  // inline, which was the only reason to reach for it.
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <span className="w-12 shrink-0 mono-meta text-(--ink-3-aa)">{variant}</span>
          <Sparkline label={`Weekly signups, ${variant}`} data={data} variant={variant} value="61" />
        </div>
      ))}
    </div>
  )
}
