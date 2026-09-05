import { FigureBand } from '@misoto22/design'

export function Example() {
  return (
    <FigureBand
      label="Deploys, last 30 days"
      figures={[
        { id: 'releases', label: 'Releases', value: '12' },
        { id: 'duration', label: 'Median build', value: '2m 14s', note: 'down from 3m 40s' },
        { id: 'rollbacks', label: 'Rollbacks', value: '0' },
        { id: 'uptime', label: 'Uptime', value: '99.98%', note: 'measured at the edge' },
      ]}
    />
  )
}
