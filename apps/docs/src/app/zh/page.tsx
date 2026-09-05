import type { Metadata } from 'next'
import { Home } from '@/views/Home'

export const metadata: Metadata = {
  // Absolute, so the layout's template does not append the site name twice.
  title: { absolute: 'misoto22 design — 白色重置' },
}

export default function Page() {
  return <Home locale="zh" />
}
