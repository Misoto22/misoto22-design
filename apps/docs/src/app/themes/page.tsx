import type { Metadata } from 'next'
import { Themes } from '@/views/Themes'

export const metadata: Metadata = {
  title: 'Themes',
  description: 'Five looks from one set of tokens — surface, corners, rules, type, motion and density.',
}

export default function Page() {
  return <Themes locale="en" />
}
