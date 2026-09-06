'use client'

import { Button } from '@misoto22/design'
import { DiagramToolbar, DiagramToolbarGroup } from '@misoto22/design/diagrams'

export function Example() {
  return (
    <DiagramToolbar label="Diagram actions">
      <DiagramToolbarGroup>
        <Button size="sm" variant="ghost">
          Theme
        </Button>
        <Button size="sm" variant="ghost">
          Style
        </Button>
      </DiagramToolbarGroup>
      <DiagramToolbarGroup>
        <Button size="sm" variant="ghost">
          Present
        </Button>
        <Button size="sm" variant="secondary">
          Export
        </Button>
      </DiagramToolbarGroup>
    </DiagramToolbar>
  )
}
