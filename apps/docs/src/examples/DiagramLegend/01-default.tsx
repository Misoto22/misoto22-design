import { DiagramLegend, kindLegend, stateLegend } from '@misoto22/design/diagrams'

export function Example() {
  return (
    <div className="flex flex-col gap-6">
      <DiagramLegend entries={kindLegend(['frontend', 'backend', 'database', 'messagebus', 'security'])} />
      <DiagramLegend title="States" entries={stateLegend(['start', 'active', 'decision', 'success', 'failure'])} />
    </div>
  )
}
