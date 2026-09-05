'use client'

import { ScrollArea } from '@misoto22/design'

const LINES = Array.from({ length: 18 }, (_, index) => ({
  sha: (0x1a2b3c4 + index * 7919).toString(16).slice(0, 7),
  state: index % 5 === 3 ? 'rolled back' : 'deployed',
}))

export function Example() {
  return (
    <ScrollArea label="Deploy log" className="h-40 w-full max-w-sm rounded-(--radius) border border-(--rule)">
      <ul className="m-0 list-none p-3 text-sm">
        {LINES.map((line) => (
          <li key={line.sha} className="flex justify-between gap-4 py-1 mono-meta text-(--ink-2)">
            <span>{line.sha}</span>
            <span className="text-(--ink-3-aa)">{line.state}</span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
