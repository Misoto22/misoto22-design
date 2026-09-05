import { StatusPill } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusPill>Available for work</StatusPill>
      <StatusPill tone="warning" pulse={false}>Partial outage</StatusPill>
    </div>
  )
}
