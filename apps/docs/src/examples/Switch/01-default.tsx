'use client'

import { Switch } from '@misoto22/design'
import { useState } from 'react'

const SETTINGS = [
  { id: 'email', label: 'Email notifications', on: true },
  { id: 'digest', label: 'Weekly digest', on: false },
]

export function Example() {
  const [state, setState] = useState(() =>
    Object.fromEntries(SETTINGS.map((setting) => [setting.id, setting.on])),
  )

  return (
    <div className="flex flex-col gap-3">
      {SETTINGS.map((setting) => (
        <label key={setting.id} className="flex cursor-pointer items-center gap-3 text-sm">
          <Switch
            checked={state[setting.id]}
            onCheckedChange={(next) => setState((previous) => ({ ...previous, [setting.id]: next }))}
          />
          {/* The label follows the state. A switch that is off beside a label
              at full strength reads as "on" at a glance, and the control is
              the smaller of the two things on the row. */}
          <span
            className={
              state[setting.id]
                ? 'text-(--ink) transition-colors duration-(--duration-fast)'
                : 'text-(--ink-3-aa) transition-colors duration-(--duration-fast)'
            }
          >
            {setting.label}
          </span>
          <span className="ms-auto mono-meta text-(--ink-3-aa)">
            {state[setting.id] ? 'On' : 'Off'}
          </span>
        </label>
      ))}
    </div>
  )
}
