import { Field, Input, Select, Textarea } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <Field label="Email" required hint="We never share it.">
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Field label="Full name" error="Name is required.">
        <Input />
      </Field>
      <Field label="Region">
        <Select defaultValue="au">
          <option value="au">Australia</option>
          <option value="nz">New Zealand</option>
        </Select>
      </Field>
      <Field label="Notes" hint="Markdown is fine.">
        <Textarea rows={3} placeholder="Anything else?" />
      </Field>
    </div>
  )
}
