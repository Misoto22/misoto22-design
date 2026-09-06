import type { Metadata } from 'next'
import { Principles } from '@/views/Principles'

export const metadata: Metadata = {
  title: '设计原则',
  description: '归白建立在哪八条规则上，以及每一条排除了什么。',
}

export default function Page() {
  return <Principles locale="zh" />
}
