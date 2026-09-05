import { Field, NativeSelect } from '@misoto22/design'

export function Example() {
  return (
    <Field
      label="Density"
      hint="The platform's own picker — better on a phone, and it works without JavaScript."
      className="w-full max-w-xs"
    >
      <NativeSelect defaultValue="mid">
        <option value="tight">Tight</option>
        <option value="mid">Comfortable</option>
        <option value="loose">Loose</option>
      </NativeSelect>
    </Field>
  )
}
