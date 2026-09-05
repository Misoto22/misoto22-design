'use client'

import { Button, Toaster, toast } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toaster />
      <Button variant="secondary" onClick={() => toast('Draft saved')}>Neutral</Button>
      <Button variant="secondary" onClick={() => toast.success('Deployed to production')}>Success</Button>
      <Button variant="secondary" onClick={() => toast.error('Could not reach the API')}>Error</Button>
    </div>
  )
}
