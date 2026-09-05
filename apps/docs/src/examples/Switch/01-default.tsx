import { Switch } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-col gap-3 text-sm text-(--ink-2)">
      <label className="flex cursor-pointer items-center gap-3">
        <Switch defaultChecked /> Email notifications
      </label>
      <label className="flex cursor-pointer items-center gap-3">
        <Switch /> Weekly digest
      </label>
    </div>
  )
}
