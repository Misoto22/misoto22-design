import { Alert, Button } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Alert title="Read-only mode">A migration is running; edits are paused until it finishes.</Alert>
      <Alert tone="success" title="Deployed">misoto22-site is live at commit a1b2c3d.</Alert>
      <Alert tone="warning" title="Token expires in 6 days">Rotate it before the next release.</Alert>
      <Alert
        tone="danger"
        title="Upload failed"
        action={<Button size="sm" variant="secondary">Try again</Button>}
      >
        The file exceeds the 25 MB limit.
      </Alert>
    </div>
  )
}
