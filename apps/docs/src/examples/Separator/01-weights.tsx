import { Separator } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div>
        <p className="m-0 mb-2 mono-meta text-(--ink-3-aa)">hairline — between rows</p>
        <Separator />
      </div>
      <div>
        <p className="m-0 mb-2 mono-meta text-(--ink-3-aa)">edge — between blocks</p>
        <Separator weight="edge" />
      </div>
      <div>
        <p className="m-0 mb-2 mono-meta text-(--ink-3-aa)">hard — under a masthead</p>
        <Separator weight="hard" />
      </div>
    </div>
  )
}
