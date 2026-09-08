import type { Metadata } from 'next'
import { PatternsIndex } from '@/views/PatternsIndex'
import { PATTERNS } from '@/content/registry'

export const metadata: Metadata = {
  title: '网站模式',
  description: `由 @misoto22/design 组件组合的 ${PATTERNS.length} 个页面模式。`,
}

export default function Page() {
  return <PatternsIndex locale="zh" />
}
