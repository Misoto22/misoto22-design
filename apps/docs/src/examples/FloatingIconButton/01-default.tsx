import { FloatingIconButton } from '@misoto22/design'
import { ArrowUp } from 'lucide-react'

export function Example() {
  // Pinned to the viewport in real use; boxed here so it stays inside the frame.
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-(--radius) border border-(--rule) [&>button]:absolute">
      <FloatingIconButton position="end" label="Back to top">
        <ArrowUp size={16} strokeWidth={1.5} />
      </FloatingIconButton>
    </div>
  )
}
