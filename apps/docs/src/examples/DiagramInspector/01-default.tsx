import { DiagramInspector } from '@misoto22/design/diagrams'

export function Example() {
  return (
    <DiagramInspector
      eyebrow="Service"
      title="API"
      description="FastAPI, behind the load balancer. Owns every read the cache misses."
      facts={[
        { label: 'Port', value: '8000', mono: true },
        { label: 'Region', value: 'ap-southeast-2', mono: true },
        { label: 'Id', value: 'api', mono: true },
      ]}
      links={[
        { direction: 'in', label: 'HTTPS', peer: 'CloudFront' },
        { direction: 'out', label: 'read-through', peer: 'Redis' },
        { direction: 'out', label: 'SQL', peer: 'Postgres' },
      ]}
      onClose={() => {}}
    />
  )
}
