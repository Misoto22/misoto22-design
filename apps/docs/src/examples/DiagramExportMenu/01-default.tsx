'use client'

import { useRef } from 'react'
import { ArchitectureFigure, DiagramExportMenu } from '@misoto22/design/diagrams'

const SPEC = {
  meta: { title: 'Request path' },
  components: [
    { id: 'edge', type: 'cloud' as const, label: 'CloudFront', sublabel: 'CDN', row: 0, col: 0 },
    { id: 'api', type: 'backend' as const, label: 'API', sublabel: 'FastAPI', row: 0, col: 1 },
  ],
  connections: [{ id: 'a', from: 'edge', to: 'api', label: 'HTTPS' }],
}

export function Example() {
  const figure = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-start gap-4">
      <DiagramExportMenu targetRef={figure} title="Request path" />
      <div ref={figure} className="w-full">
        <ArchitectureFigure spec={SPEC} heading={false} legend="hidden" />
      </div>
    </div>
  )
}
