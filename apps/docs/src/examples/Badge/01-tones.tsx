import { Badge } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>12</Badge>
      <Badge tone="outline">Draft</Badge>
      <Badge tone="success">Deployed</Badge>
      <Badge tone="warning">Degraded</Badge>
      <Badge tone="danger">Failed</Badge>
    </div>
  )
}
