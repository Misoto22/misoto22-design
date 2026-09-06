'use client'

import { Field, Input, Slider } from '@misoto22/design'
import { useState } from 'react'

const MAX = 5000

/**
 * The slider for the neighbourhood, the input for the number. A slider cannot
 * be typed into, so someone who needs 1,150 rather than roughly 1,200 is
 * dragging a 16px thumb across a hundred steps to get there — put an Input
 * beside it whenever the exact figure is the point. Both drive one piece of
 * state, so neither can go stale, and the typed value is clamped on the way in
 * because a number past the maximum is not one the track can draw.
 */
export function Example() {
  const [budget, setBudget] = useState(1200)

  return (
    <div className="flex w-full max-w-sm items-end gap-4">
      <Slider
        label="Monthly budget in dollars"
        value={[budget]}
        onValueChange={([next]) => setBudget(next ?? 0)}
        max={MAX}
        step={50}
        showValue
        format={(n) => `$${n}`}
      />
      <Field label="Exact" htmlFor="budget-exact" className="w-24 shrink-0">
        <Input
          id="budget-exact"
          inputMode="numeric"
          value={String(budget)}
          onChange={(event) => setBudget(Math.min(MAX, Math.max(0, Number(event.target.value) || 0)))}
        />
      </Field>
    </div>
  )
}
