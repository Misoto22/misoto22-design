'use client'

import { ArchitectureFigure, DiagramCanvas } from '@misoto22/design/diagrams'

const SPEC = {
  meta: { title: 'Request path' },
  components: [
    { id: 'client', type: 'external' as const, label: 'Browser', row: 0, col: 0 },
    { id: 'edge', type: 'cloud' as const, label: 'CloudFront', sublabel: 'CDN', row: 0, col: 1 },
    { id: 'api', type: 'backend' as const, label: 'API', sublabel: 'FastAPI', row: 0, col: 2 },
    { id: 'db', type: 'database' as const, label: 'Postgres', row: 0, col: 3 },
  ],
  connections: [
    { id: 'a', from: 'client', to: 'edge', label: 'HTTPS' },
    { id: 'b', from: 'edge', to: 'api' },
    { id: 'c', from: 'api', to: 'db', label: 'SQL' },
  ],
}

export function Example() {
  return (
    <DiagramCanvas height="16rem" label="Request path">
      <ArchitectureFigure spec={SPEC} heading={false} legend="hidden" cards={false} />
    </DiagramCanvas>
  )
}
