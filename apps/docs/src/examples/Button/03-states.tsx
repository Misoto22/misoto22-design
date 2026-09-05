import { Button } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button loading>Saving…</Button>
      <Button disabled>Disabled</Button>
      <Button variant="secondary" keycap="P">View projects</Button>
    </div>
  )
}
