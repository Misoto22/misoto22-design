import { Button, EmptyState } from '@misoto22/design'
import { Inbox } from 'lucide-react'

export function Example() {
  return (
    <EmptyState
      icon={Inbox}
      title="No projects yet"
      description="Everything you publish will show up here. Start with the one you are already building."
      action={<Button>New project</Button>}
    />
  )
}
