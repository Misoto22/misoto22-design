'use client'

import { CollapsibleSection, Field, Input } from '@misoto22/design'

export function Example() {
  return (
    <div className="w-full max-w-md divide-y divide-(--rule) border-y border-(--rule)">
      <CollapsibleSection title="Advanced settings">
        <Field label="Retries" hint="How many times a failed job is tried again.">
          <Input type="number" defaultValue={3} />
        </Field>
      </CollapsibleSection>
    </div>
  )
}
