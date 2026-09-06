'use client'

import { BigNumber } from '@misoto22/design/charts'

export function Example() {
  // Direction is stated by the call site, never inferred from the sign:
  // "errors down 12%" is good news and "revenue down 12%" is not, and no
  // component can tell which it is holding. The arrow and the words carry the
  // reading; the status tint is the third signal, never the only one.
  return (
    <div className="grid w-full gap-10 sm:grid-cols-3">
      <BigNumber
        label="Monthly revenue"
        value="$48,210"
        delta={{ value: 0.124, label: 'vs last month', intent: 'up-is-good' }}
      />
      <BigNumber
        label="Error rate"
        value="2.4%"
        delta={{ value: 0.08, label: 'vs last week', intent: 'down-is-good' }}
      />
      <BigNumber
        label="Active projects"
        value="1,204"
        delta={{ value: 0, label: 'vs last month', intent: 'neutral' }}
      />
    </div>
  )
}
