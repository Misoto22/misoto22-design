import type { Metadata } from 'next'
import { TemplatesIndex } from '@/views/TemplatesIndex'

export const metadata: Metadata = {
  title: 'Templates',
  description: 'Whole screens assembled from the set, at two opposite densities.',
}

export default function Page() {
  return <TemplatesIndex locale="en" />
}
