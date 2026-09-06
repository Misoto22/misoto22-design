import type { ComponentGroup } from '@/content/registry'
import type { Locale } from './locales'
import { catalogCopy } from './translate'

/**
 * The editorial layer, translated.
 *
 * What IS translated: everything this site wrote — group names, the foundations
 * prose, the principles, the templates — plus the site's own headings for each
 * page.
 *
 * What used to be here and is not any more: the component catalogue. Its
 * English is authored in the PACKAGE and reaches this site as a build artifact,
 * so its Chinese cannot sit beside it and has to be a separate table — and a
 * separate table shaped like the English is one that drifts silently, which it
 * did. It now lives in `zh.ts`, keyed and fingerprinted, with `deferred.ts`
 * recording what is deliberately still English and `translation-gate.test.ts`
 * failing on everything else. Reach for `catalogCopy` from `translate.ts`.
 *
 * The API reference is translated in `api.ts` for the same reason, and predates
 * the mechanism `zh.ts` generalises.
 *
 * What is NOT translated: type signatures and identifiers. They are code.
 *
 * Anything missing here falls back to English rather than rendering blank,
 * which is the same rule misoto22.com follows for its own translated content.
 */

const GROUPS_ZH: Record<ComponentGroup, string> = {
  Actions: '动作',
  Forms: '表单',
  Navigation: '导航',
  Overlays: '浮层',
  Feedback: '反馈',
  Display: '展示',
  Surfaces: '容器',
  Data: '数据',
  Charts: '图表',
  Diagrams: '图示',
}
/**
 * A component's name on a Chinese page: `Button 按钮`.
 *
 * Both, in that order, which is what every Chinese design system settled on —
 * Ant Design, Arco, Semi and TDesign all print the English identifier first and
 * the Chinese name after it. The reason is that the English word is not a label
 * here, it is the IMPORT: a reader who translates `Button` to 按钮 in the
 * sidebar then has to translate it back to type `import { Button }`, and the
 * one thing a component page must never do is hide the name of the thing it is
 * documenting. The Chinese is what makes it findable; the English is what makes
 * it usable, and neither substitutes for the other.
 */
export function componentName(locale: Locale, slug: string, name: string): string {
  const zh = catalogCopy(locale, `component.${slug}.name`, name)
  return zh === name ? name : `${name} ${zh}`
}

export function groupName(locale: Locale, group: ComponentGroup): string {
  return locale === 'zh' ? GROUPS_ZH[group] : group
}

export const PAGE_ZH = {
  home: {
    eyebrow: 'misoto22 design',
    title: '归白',
    summary:
      '一套给软件、写作与摄影用的纯白单色设计系统。底是纸白，记号是近黑，文件里剩下的唯一彩色是状态——它绑定在状态上，永远不绑定品牌。',
    browse: '浏览组件',
    readPrinciples: '阅读设计原则',
    componentsCount: '{count} 个组件',
    figures: {
      components: '组件',
      tokens: 'Token',
      tokensNote: '亮色与暗色',
      radius: '圆角级数',
      radiusNote: '一个系数带动全部',
      shadow: '带模糊的阴影',
      shadowNote: '深度是一条细线',
    },
    installNote:
      '六个运行时依赖——Radix 负责没人该重写的行为，cmdk 负责 combobox 模式，react-day-picker 负责日历，lucide 负责图标，sonner 负责 toast，clsx 加 tailwind-merge 负责让类名冲突按调用方的意思解决。没有路由、没有状态库、没有 CSS-in-JS。',
    tailwindNote:
      '把可移植的 token 层单独拿走，省掉第二份工具类。模式是 <html> 上的一个属性，所以它可以在首次绘制前写好，永远不会闪出错误的主题。',
  },
  principles: {
    title: '设计原则',
    summary: '八条规则，每一条都写成“可以拿一件具体的作品去指认它违反了哪条”。只说该往哪儿努力的原则，什么争论都解决不了。',
    rulesOut: '它排除了',
  },
  components: {
    title: '组件',
    summary: '{count} 个基础组件，按“它们做什么”分组，而不是按“它们由什么构成”。每一个都针对 token 层书写，所以没有一个自带颜色。',
  },
  templates: {
    title: '模板',
    summary:
      '组件目录回答“一张表格长什么样”。模板回答下一个问题——一个真实的屏幕需要哪些组件同时在场，以及当它们有十二个而不是一个时，彼此之间如何排布。',
    builtNote:
      '这里没有任何东西是为模板单独写的样式。只有这样它才能随着系统变化而保持诚实——带自己 CSS 的模板不再是对组件的检验，只是一张截图。',
  },
  changelog: {
    title: '更新日志',
    summary:
      '每一个对使用者可见的改动都随一个 changeset 一起发布，所以这些话是做这个改动的人在他理解它的那一刻写下的，而不是一个月后从提交标题里拼回来的。',
  },
} as const
