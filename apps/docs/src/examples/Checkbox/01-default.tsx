'use client'

import { Checkbox } from '@misoto22/design'
import { useState } from 'react'

const JOBS = ['Ship on merge', 'Notify the channel', 'Run the smoke tests']

export function Example() {
  const [checked, setChecked] = useState<string[]>([JOBS[0]!])

  // "Some, but not all" is the indeterminate state — the one a plain unchecked
  // box would report as the opposite of the truth.
  const all = checked.length === JOBS.length
  const some = checked.length > 0 && !all

  return (
    <div className="flex flex-col gap-3 text-sm text-(--ink-2)">
      <label className="flex cursor-pointer items-center gap-2.5">
        <Checkbox
          checked={some ? 'indeterminate' : all}
          onCheckedChange={(next) => setChecked(next === true ? JOBS : [])}
        />
        Select all
      </label>

      <div className="ms-6 flex flex-col gap-3 border-s border-(--rule) ps-4">
        {JOBS.map((job) => (
          <label key={job} className="flex cursor-pointer items-center gap-2.5">
            <Checkbox
              checked={checked.includes(job)}
              onCheckedChange={(next) =>
                setChecked((previous) =>
                  next === true ? [...previous, job] : previous.filter((item) => item !== job),
                )
              }
            />
            {job}
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2.5 text-(--ink-3-aa)">
        <Checkbox disabled /> Requires admin
      </label>
    </div>
  )
}
