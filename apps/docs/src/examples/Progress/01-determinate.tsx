import { Progress } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Progress value={62} label="Uploading photos" showValue />
      <Progress label="Rebuilding the search index" />
    </div>
  )
}
