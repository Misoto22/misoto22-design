import type { Locale } from './locales'

/**
 * The site's own chrome, in both languages.
 *
 * Deliberately flat and typed off the English object: a key that exists in one
 * language and not the other is a compile error rather than a blank on a page.
 * Everything here is the SITE speaking — navigation, headings, the words around
 * the content. What the package itself says about a component is a separate
 * question, handled in `content.ts`.
 */
const en = {
  tagline: 'the White Reset',
  search: 'Search',
  searchAria: 'Search the documentation',
  searchEmpty: 'Nothing matches “{query}”. The index covers names, summaries, props, keyboard keys and the accessibility notes.',
  matching: '{count} matching',
  nav: {
    start: 'Start',
    overview: 'Overview',
    principles: 'Principles',
    allComponents: 'All components',
    templates: 'Templates',
    changelog: 'Changelog',
    foundations: 'Foundations',
    documentation: 'Documentation',
    sidebar: 'Sidebar',
    openNav: 'Open the navigation',
    closeNav: 'Close the navigation',
    skip: 'Skip to content',
  },
  section: {
    examples: 'Examples',
    notes: 'Notes',
    props: 'Props',
    parts: 'Parts',
    reexports: 'Re-exports',
    types: 'Types',
    keyboard: 'Keyboard',
    accessibility: 'Accessibility',
    related: 'Related',
    whenToReach: 'When to reach for it',
    builtFrom: 'Built from',
    source: 'Source',
    install: 'Install',
    components: 'Components',
    tailwind: 'Already using Tailwind?',
  },
  table: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    description: 'Description',
    key: 'Key',
    does: 'Does',
    token: 'Token',
    value: 'Value',
    dark: 'Dark',
    notes: 'Notes',
    required: 'required',
    same: 'same',
    noProps: 'Takes no props of its own.',
    passthrough: 'Also accepts everything in {types}. Those are forwarded to the underlying element and are not listed row by row.',
  },
  canvas: {
    preview: 'Preview',
    code: 'Code',
    edit: 'Edit',
    done: 'Done',
    direction: 'Text direction',
    density: 'Density',
    comfortable: 'Comfortable',
    compact: 'Compact',
  },
  appearance: {
    toDark: 'Switch to the dark theme',
    toLight: 'Switch to the light theme',
    accent: 'Change the accent',
    theme: 'Theme',
    reset: 'Reset',
    axesNote:
      'Or set the axes yourself. Each one is an attribute on the root that re-points tokens the package already defines — no component reads any of them.',
    accentTitle: 'Accent',
    accentNote: 'One token, --clay. Every surface that marks a choice — a primary button, a checked box, the active tab, the current page — reads it through --accent. The system ships monochrome; these show what re-pointing it does.',
    current: 'current',
    language: 'Language',
  },
  palette: {
    label: 'Command palette',
    placeholder: 'Jump to a component, a page, or change the theme…',
    empty: 'Nothing matches that. Try a component name, a group, or “dark”.',
    goTo: 'Go to',
    components: 'Components',
    appearance: 'Appearance',
    toggleTheme: 'Toggle light / dark',
    navigate: 'navigate',
    open: 'open',
    close: 'close',
  },
  themes: {
    title: 'Themes',
    lead: 'The same components, the same tokens, five looks. Nothing below required a component to change — each is a handful of attributes on the root element.',
    axesTitle: 'The axes',
    axesLead: 'A preset is a combination of these, not a block of its own, so a look nobody shipped is still reachable.',
    axes: {
      surface: 'Surface',
      radius: 'Corners',
      rules: 'Rules',
      type: 'Type',
      motion: 'Motion',
      density: 'Density',
    },
    values: {
      paper: 'Paper', warm: 'Warm', cool: 'Cool',
      sharp: 'Sharp', soft: 'Soft', round: 'Round',
      quiet: 'Quiet', hairline: 'Hairline', firm: 'Firm',
      editorial: 'Editorial', grotesk: 'Grotesk', bookish: 'Bookish',
      still: 'Still', calm: 'Calm', snappy: 'Snappy',
      comfortable: 'Comfortable', compact: 'Compact',
    } as Record<string, string>,
    presets: {} as Record<string, { name: string; note: string }>,
    previewLabel: 'Theme preview',
  },
  apiNote:
    'The API reference below — prop descriptions, notes and type signatures — is read straight out of the package source and stays in English.',
} as const

/**
 * The English catalogue's SHAPE, with the literal types widened back to string.
 *
 * `as const` above is what makes a missing key an error — the shape is derived
 * from English rather than declared twice. Without this widening it would also
 * demand that the Chinese for "Search" be the string "Search", which is a
 * compile error saying the translation is wrong for being a translation.
 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }

export type Messages = Widen<typeof en>

const zh: Messages = {
  tagline: '白色重置',
  search: '搜索',
  searchAria: '搜索文档',
  searchEmpty: '没有匹配“{query}”的内容。索引覆盖名称、摘要、属性、快捷键与无障碍说明。',
  matching: '{count} 项匹配',
  nav: {
    start: '开始',
    overview: '概览',
    principles: '设计原则',
    allComponents: '全部组件',
    templates: '模板',
    changelog: '更新日志',
    foundations: '基础',
    documentation: '文档导航',
    sidebar: '侧边栏',
    openNav: '打开导航',
    closeNav: '关闭导航',
    skip: '跳到正文',
  },
  section: {
    examples: '示例',
    notes: '说明',
    props: '属性',
    parts: '组成部分',
    reexports: '再导出',
    types: '类型',
    keyboard: '键盘操作',
    accessibility: '无障碍',
    related: '相关组件',
    whenToReach: '什么时候用它',
    builtFrom: '由这些组件搭成',
    source: '源码',
    install: '安装',
    components: '组件',
    tailwind: '已经在用 Tailwind？',
  },
  table: {
    prop: '属性',
    type: '类型',
    default: '默认值',
    description: '说明',
    key: '按键',
    does: '作用',
    token: 'Token',
    value: '值',
    dark: '暗色',
    notes: '备注',
    required: '必填',
    same: '相同',
    noProps: '这个组件没有自己的属性。',
    passthrough: '同时接受 {types} 里的全部属性，它们会直接透传给底层元素，不再逐条列出。',
  },
  canvas: {
    preview: '预览',
    code: '代码',
    edit: '编辑',
    done: '完成',
    direction: '文字方向',
    density: '密度',
    comfortable: '宽松',
    compact: '紧凑',
  },
  appearance: {
    toDark: '切换到暗色主题',
    toLight: '切换到亮色主题',
    accent: '更换主色',
    theme: '主题',
    reset: '重置',
    axesNote:
      '也可以自己逐项调。每一项都是根元素上的一个属性，只是把包里已有的 token 重新指向别处——没有任何组件读它们。',
    accentTitle: '主色',
    accentNote: '只有一个 token：--clay。所有表示“被选中”的表面——主按钮、勾选框、当前标签页、当前页码——都通过 --accent 读它。系统默认是单色的，这些选项展示的是改掉这一个指针会发生什么。',
    current: '当前',
    language: '语言',
  },
  palette: {
    label: '命令面板',
    placeholder: '跳到某个组件、某个页面，或切换主题…',
    empty: '没有匹配的结果。试试组件名、分组，或者输入 “dark”。',
    goTo: '前往',
    components: '组件',
    appearance: '外观',
    toggleTheme: '切换亮色 / 暗色',
    navigate: '移动',
    open: '打开',
    close: '关闭',
  },
  themes: {
    title: '主题',
    lead: '同一批组件、同一套 token，五种面貌。下面每一种都没有改动任何组件——各自只是根元素上的几个属性。',
    axesTitle: '各项轴',
    axesLead: '预设只是这些轴的一种组合，而不是自成一块，所以没人做过的搭配你照样调得出来。',
    axes: {
      surface: '底色',
      radius: '圆角',
      rules: '描边',
      type: '字体',
      motion: '动效',
      density: '密度',
    },
    values: {
      paper: '纸白', warm: '暖白', cool: '冷白',
      sharp: '直角', soft: '微圆', round: '大圆',
      quiet: '克制', hairline: '细线', firm: '明确',
      editorial: '书刊', grotesk: '无衬线', bookish: '通篇衬线',
      still: '静止', calm: '从容', snappy: '利落',
      comfortable: '宽松', compact: '紧凑',
    },
    presets: {
      reset: { name: '白色重置', note: '系统出厂的样子。纸白底、细描边、衬线标题，强调色就是墨色。' },
      broadsheet: { name: '大报', note: '暖色纸、直角、明确的描边。报纸读起来是一张网格，不是一叠卡片。' },
      console: { name: '控制台', note: '冷色底、紧凑行距、干脆的动效、单一界面字体。密集操作界面要的全在这。' },
      salon: { name: '沙龙', note: '大圆角、克制的描边，衬线一路用到正文。这是读的界面，不是干活的界面。' },
      clinic: { name: '诊室', note: '纸白底配单一无衬线，一点暖意都没有。圆角把它从“表单”里拉回来。' },
    },
    previewLabel: '主题预览',
  },
  apiNote:
    '下方的 API 参考——属性说明、注释与类型签名——直接来自包的源码，保持英文。',
}

const MESSAGES: Record<Locale, Messages> = { en, zh }

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale]
}

/** `t('{count} matching', { count: 3 })`. Deliberately the smallest thing that works. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`))
}
