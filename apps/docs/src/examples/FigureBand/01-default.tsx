import { FigureBand } from '@misoto22/design'

export function Example() {
  return (
    <FigureBand
      label="At a glance"
      figures={[
        { id: 'components', label: 'Components', value: '34' },
        { id: 'tokens', label: 'Tokens', value: '96', note: 'two themes' },
        { id: 'deps', label: 'Runtime deps', value: '3', note: 'Radix, lucide, clsx' },
        { id: 'shadow', label: 'Blurred shadows', value: '0' },
      ]}
    />
  )
}
