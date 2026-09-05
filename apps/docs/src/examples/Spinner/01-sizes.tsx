import { Spinner } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex items-center gap-6">
      <Spinner size="sm" label="Loading, small" />
      <Spinner size="md" label="Loading, medium" />
      <Spinner size="lg" label="Loading, large" />
    </div>
  )
}
