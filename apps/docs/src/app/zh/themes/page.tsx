import type { Metadata } from 'next'
import { Themes } from '@/views/Themes'

export const metadata: Metadata = {
  title: '主题',
  description: '同一套 token 的五种面貌——底色、圆角、描边、字体、动效与密度。',
}

export default function Page() {
  return <Themes locale="zh" />
}
