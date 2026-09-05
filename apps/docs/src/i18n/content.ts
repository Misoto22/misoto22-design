import type { ComponentGroup } from '@/content/registry'
import type { Locale } from './locales'

/**
 * The editorial layer, translated.
 *
 * What IS translated: everything this site wrote — group names, component
 * summaries, the "when to reach for it" note, the foundations prose, the
 * principles, the templates.
 *
 * What is NOT: the API reference. Prop descriptions, the "Notes" section and
 * the type signatures are parsed out of the package's own source, and a
 * translation of them would be a second copy that drifts the first time
 * somebody edits a doc comment. The Chinese pages say so in a line at the top
 * rather than leaving a reader to wonder.
 *
 * Anything missing here falls back to English rather than rendering blank,
 * which is the same rule misoto22.com follows for its own translated content.
 */

export interface ComponentCopy {
  summary?: string
  when?: string
  accessibility?: string[]
}

const GROUPS_ZH: Record<ComponentGroup, string> = {
  Actions: '动作',
  Display: '展示',
  Feedback: '反馈',
  Forms: '表单',
  Overlays: '浮层',
  Navigation: '导航',
  Surfaces: '容器',
}

const COMPONENTS_ZH: Record<string, ComponentCopy> = {
  button: {
    summary: '系统的动作，一颗不会在悬停时移动的胶囊。',
    when: '任何“会做点什么”的东西。如果它是跳转、而且长得像文字，那它是链接，不是幽灵按钮。',
    accessibility: [
      '默认渲染原生 <button>，所以 Enter 和 Space 都能触发。',
      'loading 会设置 aria-busy 并禁用控件；标签保持不变，按钮不会在刚被点下时缩掉、把页面往上抽。',
      '链接无法被 disabled，所以 href + loading 用 aria-disabled 并挡掉指针事件。',
      'iconOnly 没有文字，因此必须给 aria-label——这是设计系统交付一个不可用控件最常见的方式。',
    ],
  },
  'floating-icon-button': {
    summary: '钉在屏幕角落的圆形动作。',
    when: '需要在滚动时始终够得到的页面级操作——回到顶部、移动端目录。',
    accessibility: ['label 是这个控件唯一的名字，所以它是必填而不是可选。', '44px 见方，是指针目标的下限（WCAG 2.5.8）。'],
  },
  badge: {
    summary: '一个计数或一种状态，用等宽字，所以它读起来像元数据。',
    when: '关于某一条记录的一个事实。如果它说的是“这东西是关于什么的”，那是 Tag。',
    accessibility: ['不可交互。带 onClick 的 badge 是键盘够不到的控件。', '状态色都由文字和图标重复表达，所以在单色打印和色盲下含义不丢。'],
  },
  tag: {
    summary: '主题标签——一个话题、一项技术、一个筛选面。',
    when: '若干个并排出现、供人扫读。关于一条记录的一个事实是 Badge。',
    accessibility: ['纯展示。要用它做筛选，就把它包进 button 并传 active——焦点圈和按下状态该留在真正拥有它们的元素上。'],
  },
  kbd: { summary: '键盘上的一个键，就按键来排版。', accessibility: ['渲染 <kbd>，它带有语义，而加了样式的 <span> 没有。'] },
  avatar: {
    summary: '一个人，画成一个圆；图片没到之前先显示缩写。',
    accessibility: ['alt 描述的是人，不是这张图。旁边已经印了名字时，空字符串才是对的。', '缩写是 aria-hidden 的——念出来只是噪音。'],
  },
  'status-dot': {
    summary: '状态词旁边的那个点。',
    accessibility: ['一律 aria-hidden：它重复的是旁边标签已经说过的状态。', '光晕只在 motion-safe 下运行，要求减少动效的读者看到的是静止的点。'],
  },
  'status-pill': { summary: '一种活着的状态：一个点，加一行大写等宽标签。' },
  'link-arrow': {
    summary: '标记“这条链接会离开本页”的记号。',
    accessibility: ['aria-hidden，所以它不会在句子中间被念成“东北方向箭头”。', '以 em 为单位，跟随它旁边的字号，而不是跟它抢。'],
  },
  separator: {
    summary: '一条线，三种粗细——单色页面需要它们。',
    when: '细线分行，边线分块，实线压在报头下面。',
    accessibility: ['默认 role="none"。只是把东西在视觉上分组的线，不应该被念出来。'],
  },
  'figure-band': {
    summary: '一排被数出来的事实，只用细线分隔，此外什么都没有。',
    accessibility: ['用 <dl>：每个格子是一个词条和它的值，这是一堆 div 表达不了的。'],
  },
  spinner: {
    summary: '系统唯一的“正在处理”指示——一个环，永远不是流光。',
    when: '短到不必交代“接下来是什么形状”的等待。再长一点，就该用 Skeleton。',
    accessibility: [
      'label 要写明在等什么；三个都写“Loading”的转圈对读屏用户等于什么都没说。',
      'label={null} 让它闭嘴，用在本身已经会播报操作的控件里。',
      '只在 motion-safe 下旋转；静止时前四分之一仍然更深，所以照样读作“还没完”。',
    ],
  },
  skeleton: {
    summary: '页面到来之前，页面的形状。',
    when: '长到读者会以为页面坏了的等待。描述“接下来是什么”的形状，胜过什么都不描述的一个点。',
    accessibility: ['一个 live region 在外层，里面每个形状都是 aria-hidden。', '脉冲也只有外层一个，所以整页一起呼吸，而不是各闪各的。'],
  },
  progress: {
    summary: '一条会填充的进度条；终点未知时它来回扫。',
    accessibility: ['不传 value 会去掉 aria-valuenow，读屏听到的是“不确定”，而不是一个猜出来的数字。', 'label 必填——一条没有名字的进度条什么也没说。'],
  },
  alert: {
    summary: '关于这个页面的一条消息，就地显示。',
    when: '读者需要看见、可能需要处理的事。只需要注意一下的，是 Toast。',
    accessibility: ['danger 是 role="alert"，会打断；其余三种是 role="status"，等读屏说完这句话。', '颜色由图标和文字双重表达。'],
  },
  'empty-state': { summary: '一个还什么都没有的集合。', when: '这里没有出错，所以文案说“接下来做什么”，而不是“什么失败了”。' },
  'error-state': { summary: '一个没能显示出来的页面。', accessibility: ['巨大的状态码是 aria-hidden 的；紧随其后的标题用文字说了同一件事。'] },
  toast: { summary: '一次性的确认，在应用根部挂一次。', when: '某件事成功了、且不需要回应。Toast 是被时间关掉的，而时间不算确认。' },
  field: {
    summary: '一行带标签的表单：标签、控件，和下面那一条消息。',
    accessibility: [
      '没传 id 时会自己生成一个，所以标签永远指向某个东西。',
      '把 aria-describedby、aria-required、aria-invalid 接到控件上，所以校验是被念出来的，不只是被画出来的。',
      'hint 和 error 是同一个位置，不是两条叠着：字段错了的时候，该读的是它哪里错了。',
    ],
  },
  input: { summary: '一行文本输入。', accessibility: ['placeholder 不是标签——只要有人开始打字它就消失了。请配合 Field 使用。'] },
  textarea: { summary: '多行文本输入，只能纵向拉伸。' },
  select: {
    summary: '从一个列表里选一项，从头到尾都由我们绘制。',
    when: '大约十几个选项以内。再多就该用 Combobox——一个没法筛的列表，扫起来比能打字筛的更慢。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', 
      '选项列表是我们自己的，所以它不会在打开的一瞬间换掉字体、间距和选中色——那正是原生 select 会做的事。',
      '键盘行为仍是平台的那一套：首字母跳转、方向键、Home 和 End、Escape 关闭且不选。',
      'label 必填。触发器上显示的是值，值不是名字。',
    ],
  },
  'native-select': {
    summary: '平台自己的选择器，能改的地方改了。',
    when: '这是逃生口，不是默认值。用在平台确实更好的地方：手机上很长的列表、必须在没有 JavaScript 时也能用的表单、要抠最后一个 KB 的页面。',
    accessibility: ['首字母跳转和手机滚轮是浏览器白送的。', '它做不到的是打开之后仍然像这套系统——选项列表由操作系统绘制，带不上任何 token。'],
  },
  checkbox: {
    summary: '一个在表单提交时才生效的选择。',
    when: '立刻生效的开关是 Switch。',
    accessibility: ['支持不确定态，这正是“全选”表头在只选了一部分时需要的——普通的未勾选状态在那里表达的是相反的意思。'],
  },
  'radio-group': {
    summary: '一组互斥的选项。',
    accessibility: ['整组只有一个 Tab 停靠点，方向键在选项之间移动，符合 ARIA radiogroup 模式。', '标签在 <label> 里面，所以整行都是点击目标。'],
  },
  switch: { summary: '一个立刻生效的设置。', when: '放在带保存按钮的表单里，开关就是在骗人——那种情况用 Checkbox。' },
  combobox: {
    summary: '一个能打字的 select，可以选一个，也可以选多个。',
    when: '大约十几个选项以上。更少的时候 Select 更好：不用思考就能扫完。',
    accessibility: ['高亮通过 aria-activedescendant 移动，焦点留在输入框里——这是 ARIA combobox 模式。自己手搓的会把焦点挪进列表，然后打的字就没法改了。', 'label 必填：触发器上是值，值不是名字。'],
  },
  'date-picker': {
    summary: '一个日期——或者一段日期——从日历里选。',
    when: '刻意不做成“输入框加日历”：解析手打的日期需要格式，而 03/04 在一个国家是 3 月 4 日，在下一个国家是 4 月 3 日。日期很久远时，日历的月份和年份是下拉。',
    accessibility: ['触发器按访问者自己的地区格式打印日期，而不是写死的 dd/mm/yyyy。', 'DateRangePicker 会等到两端都选完才关——一段范围在有第二个日期之前不算一个值。'],
  },
  slider: {
    summary: '在一段范围里选一个值。',
    accessibility: ['label 必填。一个只报“42”的滑块，给读屏用户留下一个数字和不知道它在量什么。', '16px 的滑块外面有一个看不见的 44px 命中区。', '方向键走一步，Page 键走一大步，Home 和 End 到两端。'],
  },
  'toggle-group': {
    summary: '分段控件：若干选项，一条。',
    when: '它改的是一个值。切换面板的是 Tabs。',
    accessibility: ['type="single" 有 radio 语义，type="multiple" 是彼此独立的开关。选错会告诉读屏用户：选中一个就会取消另一个。'],
  },
  dialog: {
    summary: '一个模态表面：portal、遮罩、居中面板。',
    accessibility: ['焦点陷阱、Escape、滚动锁定和 aria-modal 都由 Radix 负责。', '没有可见标题的对话框仍然会渲染一个隐藏标题，而不是交付一个没有名字的模态。'],
  },
  'dropdown-menu': {
    summary: '一组动作构成的菜单。',
    when: '动作。会跳转的项属于导航；会设定某个值的是 Select 或 RadioGroup。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', '高亮由 data-highlighted 驱动，同时覆盖悬停和键盘焦点——只写 :hover 会让键盘用户看不见自己在哪。'],
  },
  tooltip: {
    summary: '悬停和获得焦点时出现的一句短标签。',
    when: '任何读者“需要”的东西都不能只放在这里：触屏摸不到它，扫读的人也看不见它。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', '触发器用 asChild，所以子元素必须可聚焦——一个 div 触发器就是没有键盘 tooltip，这个 API 形状让它显性而不是无声。', '它不是无障碍名称。只有图标的按钮仍然需要自己的 aria-label。'],
  },
  popover: {
    summary: '锚在控件上的面板，里面装可以交互的内容。',
    when: '任何带链接、字段或按钮的东西。tooltip 描述而不能被进入——把控件放进 tooltip，它就再也够不到了。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', 'label 必填：popover 是一个 dialog，没有名字的 dialog 什么都没播报。', '里面的内容像页面其他部分一样用 Tab 走，不像菜单那样用方向键。'],
  },
  sheet: {
    summary: '停靠在视口某一边的面板。',
    when: '需要空间的模态——筛选面板、详情视图。它本身就是一个 Dialog，只是靠边；边名按阅读顺序取，所以 end 在英文里是右、在阿拉伯语里是左。',
    accessibility: ['复用 Dialog 的焦点陷阱、Escape 与滚动锁定，而不是再实现一遍——第二个焦点陷阱就是第二个会出错的焦点陷阱。', '标题必填，无论可不可见。'],
  },
  'context-menu': { summary: '右键打开的菜单。', when: '永远不能是通往某个动作的唯一路径。触屏、触控板和纯键盘用户可能根本打不开它。' },
  'searchable-menu': {
    summary: '一个能打字筛选的动作菜单。',
    when: 'DropdownMenu 超过十几行就不再能扫读，而用二级菜单去救只会更糟。这就是同一份列表加上一个过滤框。它不是 Command 面板：那个是页面级的、模态的；这个锚在某个控件上。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', 
      '行是 listbox 里的 option 而不是 menuitem，因为过滤这件事要求如此——高亮通过 aria-activedescendant 移动，焦点留在输入框里，而菜单做不到。',
      '这个取舍是刻意的：一个没法筛的菜单，对读者来说比一个会执行动作的 listbox 更糟。',
    ],
  },
  command: {
    summary: '可筛选的动作列表——⌘K 那个面。',
    accessibility: ['列表随打字过滤，高亮随方向键移动，焦点始终留在输入框里。最后这条是 ARIA combobox 模式，也是自制面板一定会做错的地方。'],
  },
  tabs: {
    summary: '一条，若干面板。',
    accessibility: ['这条会横向滚动而不是折行：折到第二行会把下面每个标签都推走，读者刚要点的那个就没了。', '高 44px，标签页也是指针目标。'],
  },
  accordion: { summary: '就地展开的折叠行。', when: '标记是加号不是尖角：加号说“这会展开”，尖角说“下面还有”。' },
  collapsible: { summary: '一个自己开合的东西。', when: '和 Accordion 的差别是算术：手风琴是一个集合，集合才能协同。只有一项的手风琴在管理一个没人读的值。' },
  breadcrumb: {
    summary: '你在哪，画成一条路径。',
    accessibility: ['最后一节是带 aria-current="page" 的文字，永远不是指向自己的链接。', '分隔符是 aria-hidden 的，所以这条路径不会被念成“首页 斜杠 作品 斜杠”。'],
  },
  pagination: {
    summary: '带页码的分页，中间省略。',
    accessibility: ['当前页是带 aria-current 的按钮，不是加了样式的 span——按控件跳转的读者需要能找到它。', '只有一页时什么都不渲染。为一页做的分页器是摆设。'],
  },
  'nav-item': { summary: '侧边栏里的一行。', accessibility: ['aria-current="page"，而且不只靠颜色：当前行同时由字重和填充底色承担。'] },
  card: { summary: '一块有边界的表面，下面没有阴影。', when: '需要读作“浮起来”的卡片是 plate，它靠反色分离，而不是靠模糊。' },
  table: {
    summary: '一张数据表——对齐、排序、边框都可以按列配置。',
    when: '对齐按列设置，数字靠尾边，这样每一位才能对齐。排序按列开启：每个表头都是按钮，等于在邀请读者去排一个数据本来就排不了的列。',
    accessibility: [
      '可排序的表头是 th 里面的 button，而不是给单元格挂 onClick——带 onClick 的单元格既不可聚焦也不会被播报，那个排序就只对鼠标存在。',
      'aria-sort 由 sortDirection 设置，这是读屏用户得知这张表已被排序的唯一途径。',
      '任何边框设置下都没有斑马纹：在单色系统里，一条被染色的行是又一个和页面底色抢注意力的表面。','caption 必填：一个页面上三张表，其中没有名字的那张是没法导航的。', '列标题是 <th scope="col">，所以一个单元格能被追溯回它的表头。'],
  },
  'scroll-area': {
    summary: '一个会滚动的盒子，滚动条在哪都长一样。',
    when: '有边界的面板——很长的选项列表、一段日志。页面级或正文滚动用 scroll-slim 工具类更轻，也不需要组件。',
    accessibility: ['视口保持可聚焦。一个内容本身不可聚焦的滚动区域没有 Tab 停靠点，折线之外的一切对没有鼠标的人等于不存在。', 'label 必填，因为一个没有名字的键盘停靠点只会播报“group”。'],
  },
  calendar: {
    summary: '一个月，画成一格一格的天。',
    when: '单独用来看范围或排期；放进 DatePicker 里用来选一天。',
    accessibility: ['方向键走一天，Page 键走一个月，Home 和 End 到这一周的两端。', '“今天”是描边，“选中”是填充——一个是日历自身的事实，一个是读者做的选择，两者不能长得一样。'],
  },
  'app-shell': {
    summary: '桌面上两栏，手机上一栏加抽屉。',
    accessibility: ['抽屉除了点遮罩，也能用 Escape 关闭，所以键盘用户不会被困在里面。', '遮罩是 <button>，因为带 onClick 的 div 既够不到也不会被播报。'],
  },
}

/** Component copy for a locale, falling back to whatever the registry holds. */
export function componentCopy(locale: Locale, slug: string): ComponentCopy {
  if (locale === 'en') return {}
  return COMPONENTS_ZH[slug] ?? {}
}

export function groupName(locale: Locale, group: ComponentGroup): string {
  return locale === 'zh' ? GROUPS_ZH[group] : group
}

/** Foundations pages: title, summary, the intro paragraphs, and category headings. */
export interface FoundationCopy {
  title?: string
  summary?: string
  intro?: string[]
  categories?: Record<string, { title?: string; note?: string }>
}

const FOUNDATIONS_ZH: Record<string, FoundationCopy> = {
  colour: {
    title: '色彩',
    summary: '一张白纸做底，一个近黑的记号，三种线的粗细，以及状态色。',
    intro: [
      '这套系统是单色的。底是纸白，记号是近黑，文件里剩下的唯一彩色是状态——它绑定在状态上，永远不绑定品牌。过去由色相承担的事，现在由字重、线条和反色承担。',
      '文字只有两级，再往下就没有了。下限是 --ink-3-aa，它在白底上以 6.7:1 通过 WCAG AA；比它高的每一级都更深。会落到这条线以下的浅色，不是这套系统可以做的选择。',
      '暗色模式是同一批名字的换值，不是第二套配色。这正是组件从不直接读原始 token 的原因：它读的是语义别名，模式属性一翻，别名自己就重新解析了。',
    ],
    categories: {
      colour: { title: '色彩 token' },
      depth: { title: '深度', note: '其中三个刻意解析为空。这套系统里的 box-shadow 永远不带模糊；--lift 是取代高度阶梯的那道硬墨偏移。' },
      focus: { title: '焦点' },
    },
  },
  typography: {
    title: '字体排印',
    summary: '三种字体，一条标题阶梯，页面标题之上什么都没有。',
    intro: [
      'Hanken Grotesk 用于界面，Newsreader 用于标题与编辑性声音，IBM Plex Mono 用于标签与数据。每条字体栈都指名了 CJK 回退，所以中文页面用的是配好的字，而不是平台随手替换的那个。',
      '标题是一条所有界面共用的阶梯，在手机与 1288px 页面之间流体变化。--fs-title 之上什么都没有：一个页面只有一样东西比它自己的记录更大。各级之间刻意靠得很近——这条阶梯分的是同类记录，不是标题和它自己的子标题，所以嵌套的两个标题必须跳一级。',
    ],
    categories: { type: { title: '排印 token' } },
  },
  space: {
    title: '空间与形状',
    summary: '页面的边距、几种度量宽度，以及四个圆角。',
    intro: [
      '度量宽度以 ch 而不是 px 为上限，所以它跟随它所排的字。--measure-record 是列表记录描述文字的天花板，不是宽度：更窄的栏依然胜出。',
      '圆角只有四级，没有第五级。50% 的圆是几何形状而不是圆角，所以它不算一级。',
      '每个组件都用逻辑属性书写——ps-/pe- 而不是 pl-/pr-，start-/end- 而不是 left-/right-——所以从右到左的文档不需要自己的样式表就能镜像。构建时有测试会因为一个物理属性而失败：事后给四十个组件补方向支持，是没人会排期的清扫，而且它出错时没有任何声音。上面任何一个例子都可以切到 RTL 看看。',
    ],
    categories: {
      space: { title: '布局' },
      radius: { title: '圆角' },
      density: {
        title: '密度',
        note: '第二条主题轴，也是唯一的另一条。在任何容器上写 data-density="compact"，它下面所有控件一起收紧，不需要逐个告知。默认状态下一个中号控件是 44px，也就是 WCAG 2.5.5 要求的指针目标；紧凑模式降到 36px，仍然宽裕地通过 2.5.8，但不再满足 2.5.5。它是给鼠标驱动的密集桌面工具用的，是一笔真实的取舍而不是白拿。上面任何一个例子都可以切过去看。',
      },
      icon: { title: '图标' },
      layer: { title: '层叠顺序' },
    },
  },
  motion: {
    title: '动效',
    summary: '一条曲线，三档时长，以及一条不可选的减少动效规则。',
    intro: [
      '整套系统一条缓动曲线。三档时长：--fast 用于状态翻转，--mid 用于面板，--slow 用于页面大小的东西。需要第四档的组件，通常是在做两件事。',
      '包里每一个动画都挡在 motion-safe 后面，动效层还带一条减少动效规则，会停掉任何标了 data-m22-animated 的东西。要求少一点动效的读者拿到的是终态，而不是同一段动作的快进版。',
    ],
    categories: { motion: { title: '动效 token' } },
  },
}

export function foundationCopy(locale: Locale, slug: string): FoundationCopy {
  return locale === 'zh' ? (FOUNDATIONS_ZH[slug] ?? {}) : {}
}

/** The eight laws. */
export interface LawCopy {
  title: string
  body: string
  rules_out: string
}

const LAWS_ZH: LawCopy[] = [
  {
    title: '底是纸。',
    body: '白色，不是米白，而且每一个表面都是同一个白。没有卡片色，没有抬升面板的色调，也没有那种悄悄变成第二种底色的“淡背景”。',
    rules_out: '一张靠“比页面白一点点”来把自己和页面分开的卡片。',
  },
  {
    title: '阴影永远不带模糊。',
    body: '这套系统没有光源，所以它没有高度阶梯。深度是一条细线、一次换底，或者一道没有模糊半径的硬墨偏移。',
    rules_out: 'box-shadow: 0 2px 8px rgba(0,0,0,.08)——以及它所属的整条刻度。',
  },
  {
    title: '线承担了色彩本该承担的工作。',
    body: '三种粗细，各自由它分隔的东西决定：细线分行，边线分块，实线压在报头下面。一个单色页面没有别的东西可以用来分隔。',
    rules_out: '五种逐个手调、谁也分不出差别的灰。',
  },
  {
    title: '文字只有两级，再往下就没有了。',
    body: '下限在白底上以 6.7:1 通过 AA。比它高的每一级都更深。第三种更浅的灰不是这里可以做的设计决定。',
    rules_out: '白底上的 #999，用来做一半读者看不见的“次要文字”。',
  },
  {
    title: '彩色绑定在状态上。',
    body: '绿、琥珀、红分别意味着成功、需要注意、失败。它们从不是装饰，而且含义永远被重复表达一次——用图标、用文字，或者两者都用。',
    rules_out: '因为这一行需要一点颜色，所以放了个蓝色徽章。',
  },
  {
    title: '一条阶梯，顶端属于页面自己。',
    body: '五级标题，在手机与整页之间流体变化，页面标题之上什么都没有。嵌套的两个标题必须跳一级，否则这套层级读起来不成立。',
    rules_out: '某个页面的卡片标题，比另一个页面自己的 h1 还大。',
  },
  {
    title: '主色就是墨色。',
    body: '在单色系统里，唯一的编辑性指针收拢到记号本身。过去由色相承担的，改由字重、下划线、填充胶囊或反色承担。',
    rules_out: '通过链接色或悬停态把品牌色重新引进来。',
  },
  {
    title: '暗色模式是换值，不是第二套配色。',
    body: '同一批 token 名字，不同的值。这正是组件读语义别名而从不读原始 token 的原因：模式一翻，别名自己就重新解析了。两个例外——照片上的文字，以及第三方品牌标——都在它们被定义的地方写明了，因为它们的底不是主题。',
    rules_out: '在某个组件自己的样式表里写一个 .dark 块，把这次换值的一侧冻住。',
  },
]

export function lawCopy(locale: Locale, index: number): LawCopy | undefined {
  return locale === 'zh' ? LAWS_ZH[index] : undefined
}

/** Templates. */
const TEMPLATES_ZH: Record<string, { name?: string; summary?: string; tests?: string }> = {
  dashboard: {
    name: '控制台',
    summary: '一个后台：侧边栏、数字带、标签页、可筛选的表格，以及两张任务卡。',
    tests: '密度。十二个组件挤在一栏里，近到任何只在孤立状态下检查过的间距决定都会露出来。',
  },
  landing: {
    name: '落地页',
    summary: '一个营销页：主视觉、数字带、三个支点、一块反色定价板，以及一组常见问题。',
    tests: '留白。组件极少，空间极大，页面主要由排印阶梯撑着——和控制台恰好相反的失败模式。',
  },
}

export function templateCopy(locale: Locale, slug: string) {
  return locale === 'zh' ? (TEMPLATES_ZH[slug] ?? {}) : {}
}

/** The pages that are mostly prose. */
export const PAGE_ZH = {
  home: {
    eyebrow: 'misoto22 design',
    title: '白色重置',
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
      radiusNote: '没有第五级',
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
