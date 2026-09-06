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
    docs: 'Docs',
    start: 'Start',
    guide: 'Guide',
    overview: 'Overview',
    principles: 'Principles',
    allComponents: 'All components',
    templates: 'Templates',
    allTemplates: 'All templates',
    changelog: 'Changelog',
    foundations: 'Foundations',
    documentation: 'Documentation',
    sections: 'Sections',
    sidebar: 'Sidebar',
    openNav: 'Open the navigation',
    closeNav: 'Close the navigation',
    collapseNav: 'Collapse the sidebar',
    expandNav: 'Show the sidebar',
    skip: 'Skip to content',
  },
  footer: {
    blurb:
      'A pure-white monochrome design system for software, writing and photography: portable tokens and accessible React primitives.',
    forAgents: 'For agents:',
    theSystem: 'The system',
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
    agents: 'Reading this as an agent?',
  },
  table: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    description: 'Description',
    key: 'Key',
    does: 'Does',
    swatch: 'Sample',
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
    presetsTab: 'Presets',
    customTab: 'Customise',
    axesNote:
      'Six axes, each an attribute on the root that re-points tokens the package already defines — no component reads any of them.',
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
  agents: {
    note: 'This site is written twice. The pages are for people; the files below are the same content for a reader that does not render CSS — every prop with its type, the keyboard contract and the whole example source, arranged for one sequential read.',
    index: 'The index — what the system is, and a link per component.',
    full: 'Everything inline, in one file.',
    perComponent: 'One component, on its own.',
  },
  themes: {
    title: 'Themes',
    lead: 'The same components, the same tokens, seven looks. Nothing below required a component to change — each is a handful of attributes on the root element. Pick one in the rail and the whole site follows.',
    axesTitle: 'The axes',
    axesLead: 'A preset is a combination of these, not a block of its own, so a look nobody shipped is still reachable.',
    axes: {
      surface: 'Surface',
      radius: 'Corners',
      rules: 'Rules',
      type: 'Type',
      motion: 'Motion',
      density: 'Density',
      chartPalette: 'Chart palette',
    },
    values: {
      paper: 'Paper', warm: 'Warm', cool: 'Cool', glass: 'Glass',
      sharp: 'Sharp', soft: 'Soft', round: 'Round',
      quiet: 'Quiet', hairline: 'Hairline', firm: 'Firm',
      editorial: 'Editorial', grotesk: 'Grotesk', bookish: 'Bookish',
      still: 'Still', calm: 'Calm', snappy: 'Snappy',
      comfortable: 'Comfortable', compact: 'Compact',
      mono: 'Mono', chroma: 'Chroma',
    } as Record<string, string>,
    presets: {} as Record<string, { name: string; note: string }>,
    previewLabel: 'Theme preview',
    railNote: 'Picking one here applies it to this whole site, and it is remembered. The panel in the masthead sets the six axes one at a time.',
  },
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
    docs: '文档',
    start: '开始',
    guide: '指南',
    overview: '概览',
    principles: '设计原则',
    allComponents: '全部组件',
    templates: '模板',
    allTemplates: '全部模板',
    changelog: '更新日志',
    foundations: '基础',
    documentation: '文档导航',
    sections: '分区',
    sidebar: '侧边栏',
    openNav: '打开导航',
    closeNav: '关闭导航',
    collapseNav: '收起侧栏',
    expandNav: '展开侧栏',
    skip: '跳到正文',
  },
  footer: {
    blurb: '一套面向软件、写作与摄影的纯白单色设计系统：可移植的 token，加上一批无障碍的 React 原语。',
    forAgents: '给 agent：',
    theSystem: '这套系统',
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
    agents: '你是 agent 在读这一页？',
  },
  table: {
    prop: '属性',
    type: '类型',
    default: '默认值',
    description: '说明',
    key: '按键',
    does: '作用',
    swatch: '样例',
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
    presetsTab: '预设',
    customTab: '自定义',
    axesNote:
      '六项轴。每一项都是根元素上的一个属性，只是把包里已有的 token 重新指向别处——没有任何组件读它们。',
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
  agents: {
    note: '这个站点写了两遍。页面给人看；下面这些文件是同样的内容，写给不渲染 CSS 的读者——每个属性连同类型、键盘约定、完整示例源码，按一次顺序读排好。',
    index: '索引——这套系统是什么，以及每个组件一条链接。',
    full: '全部内容合成一个文件。',
    perComponent: '单个组件，单独一份。',
  },
  themes: {
    title: '主题',
    lead: '同一批组件、同一套 token，七种面貌。下面每一种都没有改动任何组件——各自只是根元素上的几个属性。在左边选一个，整个站点就跟着走。',
    axesTitle: '各项轴',
    axesLead: '预设只是这些轴的一种组合，而不是自成一块，所以没人做过的搭配你照样调得出来。',
    axes: {
      surface: '底色',
      radius: '圆角',
      rules: '描边',
      type: '字体',
      motion: '动效',
      density: '密度',
      chartPalette: '图表色板',
    },
    values: {
      paper: '纸白', warm: '暖白', cool: '冷白', glass: '玻璃',
      sharp: '直角', soft: '微圆', round: '大圆',
      quiet: '克制', hairline: '细线', firm: '明确',
      editorial: '书刊', grotesk: '无衬线', bookish: '通篇衬线',
      still: '静止', calm: '从容', snappy: '利落',
      comfortable: '宽松', compact: '紧凑',
      mono: '单色', chroma: '彩色',
    },
    presets: {
      reset: { name: '白色重置', note: '系统出厂的样子。纸白底、细描边、衬线标题，强调色就是墨色。' },
      broadsheet: { name: '大报', note: '暖色纸、直角、明确的描边。报纸读起来是一张网格，不是一叠卡片。' },
      console: { name: '控制台', note: '冷色底、紧凑行距、干脆的动效、单一界面字体。密集操作界面要的全在这。' },
      salon: { name: '沙龙', note: '大圆角、克制的描边，衬线一路用到正文。这是读的界面，不是干活的界面。' },
      clinic: { name: '诊室', note: '纸白底配单一无衬线，一点暖意都没有。圆角把它从“表单”里拉回来。' },
      atelier: { name: '工作室', note: '暖色纸、克制的描边，衬线只留给标题。作品集的样子——颜色由作品来给。' },
      aqua: { name: '流光', note: '冷色底上的磨砂面板。全系统唯一花掉一次模糊的主题，而且只用在真正浮起来的表面背后。' },
      ledger: { name: '账册', note: '冷白底、直角、宽松行距。要连读一小时的报表界面，不是扫一眼就走的那种。' },
    },
    previewLabel: '主题预览',
    railNote: '在这里选一个，整个站点都会跟着变，并且会记住。顶栏那个面板可以逐项调六条轴。',
  },
}

const MESSAGES: Record<Locale, Messages> = { en, zh }

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale]
}

/** `t('{count} matching', { count: 3 })`. Deliberately the smallest thing that works. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`))
}
