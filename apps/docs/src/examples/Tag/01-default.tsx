import { Tag } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag active>All</Tag>
      <Tag>TypeScript</Tag>
      <Tag>Rust</Tag>
      <Tag>Photography</Tag>
    </div>
  )
}
