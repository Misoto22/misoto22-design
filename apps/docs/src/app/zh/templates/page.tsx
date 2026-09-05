import type { Metadata } from 'next'
import { TemplatesIndex } from '@/views/TemplatesIndex'

export const metadata: Metadata = {
  title: '模板',
  description: '用这套组件搭出来的完整界面，两种相反的密度。',
}

export default function Page() {
  return <TemplatesIndex locale="zh" />
}
