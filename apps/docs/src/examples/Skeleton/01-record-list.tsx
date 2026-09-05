import { SkeletonBlock, SkeletonLine, SkeletonPage, SkeletonText } from '@misoto22/design'

export function Example() {
  return (
    <SkeletonPage label="Loading projects">
      <div className="border-t border-(--rule-hard)">
        {[0, 1].map((row) => (
          <div key={row} className="grid gap-x-8 gap-y-4 border-b border-(--rule) py-6 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <SkeletonBlock className="h-24" />
            <div>
              <SkeletonLine className="h-2.5 w-24" />
              <SkeletonBlock className="mt-4 h-5 w-[min(100%,16rem)]" />
              <SkeletonText className="mt-5" lines={2} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPage>
  )
}
