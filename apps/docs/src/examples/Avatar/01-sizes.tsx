import { Avatar } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm" alt="" fallback="HC" />
      <Avatar size="md" alt="" fallback="MI" />
      <Avatar size="lg" alt="" fallback="22" />
    </div>
  )
}
