'use client'

import { Slider } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider label="Quality" defaultValue={[80]} max={100} step={5} showValue format={(n) => `${n}%`} />
      <Slider
        label={['Minimum price', 'Maximum price']}
        defaultValue={[20, 70]}
        max={100}
        step={5}
        showValue
        format={(n) => `$${n}`}
      />
    </div>
  )
}
