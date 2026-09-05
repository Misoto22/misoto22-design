import { Button, Spinner } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button loading>Saving…</Button>
      <span className="inline-flex items-center gap-2.5 rounded-(--radius) bg-(--feature-surface) px-4 py-3 text-sm text-(--on-feature)">
        <Spinner size="sm" tone="current" label={null} />
        Indexing 1,204 frames
      </span>
    </div>
  )
}
