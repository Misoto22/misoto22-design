import { StatusDot } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm text-(--ink-2)">
      <span className="inline-flex items-center gap-2"><StatusDot /> Live</span>
      <span className="inline-flex items-center gap-2"><StatusDot tone="warning" pulse={false} /> Degraded</span>
      <span className="inline-flex items-center gap-2"><StatusDot tone="danger" pulse={false} /> Down</span>
      <span className="inline-flex items-center gap-2"><StatusDot tone="neutral" pulse={false} /> Idle</span>
    </div>
  )
}
