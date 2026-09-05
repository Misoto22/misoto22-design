'use client'

import { Button, Dialog, DialogClose, DialogContent, DialogTrigger } from '@misoto22/design'

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">Delete frame</Button>
      </DialogTrigger>
      <DialogContent
        title="Delete this frame?"
        description="It will be removed from the archive and from every collection it appears in."
      >
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="danger">Delete</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
