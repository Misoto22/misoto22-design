import type { Metadata } from 'next'
import { PatternsIndex } from '@/views/PatternsIndex'
import { PATTERNS } from '@/content/registry'

export const metadata: Metadata = {
  title: 'Website patterns',
  description: `${PATTERNS.length} application-shaped compositions built from @misoto22/design components.`,
}

export default function Page() {
  return <PatternsIndex locale="en" />
}
