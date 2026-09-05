import { SkeletonBlock, SkeletonCircle, SkeletonLine, SkeletonPage, SkeletonText } from '@misoto22/design'

export function Example() {
  return (
    <SkeletonPage label="Loading the example" className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <SkeletonCircle />
        <SkeletonLine className="w-32" />
      </div>
      <SkeletonBlock className="h-20" />
      <SkeletonText lines={3} />
    </SkeletonPage>
  )
}
