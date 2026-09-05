import { Input } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Input placeholder="Resting" aria-label="Resting" />
      <Input invalid defaultValue="not-an-email" aria-label="Invalid" />
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
    </div>
  )
}
