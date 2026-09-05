import { Select } from '@misoto22/design'

export function Example() {
  return (
    <Select className="max-w-xs" defaultValue="mid" aria-label="Density">
      <option value="tight">Tight</option>
      <option value="mid">Comfortable</option>
      <option value="loose">Loose</option>
    </Select>
  )
}
