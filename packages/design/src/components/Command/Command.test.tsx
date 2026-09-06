import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Settings } from 'lucide-react'
import { Command, CommandGroup, CommandItem, CommandList } from './Command'

function palette(children: React.ReactNode) {
  return render(
    <Command label="Command palette">
      <CommandList>
        <CommandGroup heading="Navigate">{children}</CommandGroup>
      </CommandList>
    </Command>,
  )
}

/**
 * The other end of the `icon` mismatch. `CommandItem.icon` is a `ReactNode` and
 * documents "pass the icon element"; the two menu items one import away take
 * the component. Both spellings now work in all three, so the near-miss that
 * used to render nothing — or throw — costs nothing to correct.
 */
describe('CommandItem icon', () => {
  it('takes the element, which is what the type has always said', () => {
    const { container } = palette(<CommandItem icon={<Settings size={16} />}>Settings</CommandItem>)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('takes the component too', () => {
    const { container } = palette(<CommandItem icon={Settings}>Settings</CommandItem>)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
