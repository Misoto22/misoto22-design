import { Checkbox } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-col gap-3 text-sm text-(--ink-2)">
      <label className="flex cursor-pointer items-center gap-2.5">
        <Checkbox checked="indeterminate" /> Select all
      </label>
      <label className="flex cursor-pointer items-center gap-2.5">
        <Checkbox defaultChecked /> Ship on merge
      </label>
      <label className="flex cursor-pointer items-center gap-2.5">
        <Checkbox /> Notify the channel
      </label>
      <label className="flex items-center gap-2.5 opacity-(--disabled-opacity)">
        <Checkbox disabled /> Requires admin
      </label>
    </div>
  )
}
