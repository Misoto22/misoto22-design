import type { ComponentGroup } from '@/content/registry'
import type { Locale } from './locales'

/**
 * The editorial layer, translated.
 *
 * What IS translated: everything this site wrote — group names, component
 * summaries, the "when to reach for it" note, the foundations prose, the
 * principles, the templates.
 *
 * The API reference — prop descriptions and the "Notes" section — is translated
 * too, and lives in `api.ts` rather than here because it is parsed out of the
 * package's source and therefore needs a drift guard this layer does not.
 *
 * What is NOT translated: type signatures and identifiers. They are code.
 *
 * Anything missing here falls back to English rather than rendering blank,
 * which is the same rule misoto22.com follows for its own translated content.
 */

export interface ComponentCopy {
  /** The Chinese name, printed after the English one — see `componentName`. */
  name?: string
  summary?: string
  when?: string
  accessibility?: string[]
  /**
   * The `does` column of the keyboard table, in the registry's own order.
   *
   * Positional rather than keyed by the keys themselves, because a key list is
   * `['↑', '↓']` and would make a poor object key. `content.test.ts` fails when
   * the two lists are different lengths, which is the drift this shape risks.
   */
  keyboard?: string[]
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

export const COMPONENTS_ZH: Record<string, ComponentCopy> = {
  button: {
    name: '按钮',
    summary: '系统的动作，和它旁边那个输入框用同一个圆角。',
    when: '任何“会做点什么”的东西。如果它是跳转、而且长得像文字，那它是链接，不是幽灵按钮。',
    accessibility: [
      '默认渲染原生 <button>，所以 Enter 和 Space 都能触发。',
      'loading 会设置 aria-busy 并禁用控件；标签保持不变，按钮不会在刚被点下时缩掉、把页面往上抽。',
      '链接无法被 disabled，所以 href + loading 用 aria-disabled 并挡掉指针事件。',
      'iconOnly 没有文字，因此必须给 aria-label——这是设计系统交付一个不可用控件最常见的方式。',
    ],
    keyboard: ['激活按钮。', '激活按钮。原生 <button> 两个键都认；套了样式的 <div> 一个都不认。'],
  },
  'floating-icon-button': {
    name: '浮动图标按钮',
    summary: '钉在屏幕角落的圆形动作。',
    when: '需要在滚动时始终够得到的页面级操作——回到顶部、移动端目录。',
    accessibility: ['label 是这个控件唯一的名字，所以它是必填而不是可选。', '44px 见方，是指针目标的下限（WCAG 2.5.8）。'],
  },
  badge: {
    name: '徽章',
    summary: '一个计数或一种状态，用等宽字，所以它读起来像元数据。',
    when: '关于某一条记录的一个事实。如果它说的是“这东西是关于什么的”，那是 Tag。',
    accessibility: ['不可交互。带 onClick 的 badge 是键盘够不到的控件。', '状态色都由文字和图标重复表达，所以在单色打印和色盲下含义不丢。'],
  },
  tag: {
    name: '标签',
    summary: '主题标签——一个话题、一项技术、一个筛选面——当它表示一次选择时，还能被移除。',
    when: '若干个并排出现、供人扫读。关于一条记录的一个事实是 Badge。读者能关掉的那种 chip，就是这个组件加上 onRemove，不是第四个组件。',
    accessibility: [
      '传 onRemove 之前都是纯展示。要用它做筛选，就把它包进 button 并传 active——焦点圈和按下状态该留在真正拥有它们的元素上。',
      '移除控件是一个真正的 <button type="button">，所以 Tab 走得到它，Enter 和 Space 都能触发它，而且它不会去提交碰巧套着它的那个表单。',
      '传了 onRemove 就必须传 removeLabel，它是这个按钮全部的可访问名称——那个 X 本身是 aria-hidden 的。',
    ],
  },
  kbd: { name: '按键', summary: '键盘上的一个键，就按键来排版。', accessibility: ['渲染 <kbd>，它带有语义，而加了样式的 <span> 没有。'] },
  avatar: {
    name: '头像',
    summary: '一个人，画成一个圆；图片没到之前先显示缩写。',
    accessibility: ['alt 描述的是人，不是这张图。旁边已经印了名字时，空字符串才是对的。', '缩写是 aria-hidden 的——念出来只是噪音。'],
  },
  'status-dot': {
    name: '状态点',
    summary: '状态词旁边的那个点。',
    accessibility: ['一律 aria-hidden：它重复的是旁边标签已经说过的状态。', '光晕只在 motion-safe 下运行，要求减少动效的读者看到的是静止的点。'],
  },
  steps: {
    name: '步骤条',
    summary: '一串带编号的步骤，画成一条轨——一件接一件，中间有条线穿过去。',
    when: '流水线、迁移、配方：有先后、没有分叉。一旦出现分叉或者要指向别处，那就是 Diagram；把分叉画成列表等于把它藏起来。',
    accessibility: [
      '用 <ol>，因为顺序本身就是内容——一堆 div 说明不了先后。',
      'aria-current="step" 标出被填充的那一个，这是这里唯一一件读者没法从阅读顺序推出来的事。',
      '编号圆点和连接线都是 aria-hidden：那个数字就是列表序号，读屏软件本来就会念。',
    ],
  },
  'status-pill': { name: '状态胶囊', summary: '一种活着的状态：一个点，加一行大写等宽标签。' },
  'link-arrow': {
    name: '链接箭头',
    summary: '标记“这条链接会离开本页”的记号。',
    accessibility: ['aria-hidden，所以它不会在句子中间被念成“东北方向箭头”。', '以 em 为单位，跟随它旁边的字号，而不是跟它抢。'],
  },
  separator: {
    name: '分隔线',
    summary: '一条线，三种粗细——单色页面需要它们；断口本身有话要说时，还能往里放字。',
    when: '细线分行，边线分块，实线压在报头下面。label 把字放进断口里：“或使用以下方式继续”、“更早”。',
    accessibility: [
      '默认 role="none"。只是把东西在视觉上分组的线，不应该被念出来。',
      '带了 label，字就是内容，两截线是 aria-hidden 的装饰——所以 decorative 不再适用，也不会有谁在这段文字头上再播报一条分隔线。',
      '竖线上的 label 会被忽略，而不是被悄悄改画成一条横线：一列一像素宽的东西里，没有任何一个位置适合放字。',
    ],
  },
  diagram: {
    name: '示意图',
    summary: '一张流程图或架构图，用系统自己的零件画出来。',
    when: '在页面里画结构，而不是在终端里。嵌套表示包含，箭头表示相邻两步之间的顺序——需要任意连线的图想要的是一张画，不是这个。',
    accessibility: [
      '一个 role="group" 的 <figure>，由 caption 命名，所以整张图对读者是一个可以整体跳过的东西。',
      '箭头是 aria-hidden：辅助技术本来就按文档顺序读节点，用不上一个指向下一个的字形。',
      '服务端渲染出来的标记，不是 canvas——每一个标签都是读屏和搜索引擎读得到的真文字。',
    ],
  },
  'figure-band': {
    name: '数字带',
    summary: '一排被数出来的事实，只用细线分隔，此外什么都没有。',
    accessibility: ['用 <dl>：每个格子是一个词条和它的值，这是一堆 div 表达不了的。'],
  },
  text: {
    name: '文本',
    summary: '这套系统的段落，落在墨色阶的第二级。',
    when: '一个段落，或者一段跑在阅读栏之外的文字。一整列正文是 Article。',
    accessibility: [
      'as 只换元素，别的什么都不换，所以标记可以照实说这段内容是什么，而外观不会在底下跟着变。',
      '每一种 tone 都是过得了 AA 的一级；muted 那一档是 --ink-3-aa，不是半透明的 --ink-3。',
    ],
  },
  heading: {
    name: '标题',
    summary: '一个标题，元素和字号是两个各自独立的决定。',
    when: '任何标题。level 跟着文档大纲走，size 跟着设计走，并且默认从 level 推出来。',
    accessibility: [
      'level 渲染的是真正的标题元素，所以这份大纲是能被导航的，而不只是看得见。',
      '两个决定是两个 prop，正是这一点让一个语义上正确的 h3 可以长得像页面标题，而不必把大纲掰弯。',
      '带 scroll-margin-top，所以锚点跳过去的标题不会被固定的顶栏盖住（实践中的 WCAG 2.4.7）。',
    ],
  },
  code: {
    name: '行内代码',
    summary: '句子里的一个函数名，或者一个 flag。',
    when: '正文当中的行内代码。多行片段是 CodeBlock。',
    accessibility: ['渲染 <code>，辅助技术靠它才知道这一段是字面量而不是正文。'],
  },
  'code-block': {
    name: '代码块',
    summary: '一段多行片段，摆在 plate 上，并配一条把它带走的路。',
    when: '任何超过一个词的片段。构建期的高亮器已经跑过就传 html，没跑过就只传 code。',
    accessibility: [
      '会滚动的主体可以被 Tab 到，并且带一个有名字的 role="group"，所以溢出的部分用键盘够得着，Tab 到的时候也会念出它是什么。刻意不用 role="region"：那是地标，一个页面上放两段代码，就会往地标表里塞进两个同名的条目。',
      '复制按钮是一个 iconOnly 的 Button，aria-label 必填，成功后变成“Copied”——状态变化是被播报出来的，不只是被画出来的。',
      '在粗指针设备上，复制控件够到了 44px 的指针目标下限，而只靠那条紧凑的带子是够不到的（WCAG 2.5.5）。',
    ],
  },
  markdown: {
    summary: '一段 Markdown 字符串，用这套系统的组件渲染出来。',
    when: '不是这边写的内容——一条评论、一份 README、一个模型的回答。来自你自己管线的可信 HTML 是 Article。',
    accessibility: [
      'headingLevelStart 一次挪动整份文档，所以嵌进去的内容保持一份合法的大纲，而不是从 h1 重新来过。',
      '每个标题都拿到一个稳定的、保留原文字符的 id，并按文档顺序去重，所以目录能链进去。',
      'href 的协议不是 http、https、mailto 或 tel 的链接会渲染成纯文本——javascript: 永远不会变成一个控件。',
      '通往别的站点的链接带着 rel="noreferrer nofollow"，所以一个不可信的作者既花不掉这个页面的权重，也没法从 Referer 里读出它的 URL。这一条不可配置；markExternalLinks 加的是那个看得见的站外箭头，默认关闭。',
      '格式不对或者空的字符串渲染成什么都没有，而不是抛错——读者写出来的内容，本来就常常是这样。',
    ],
  },
  timestamp: {
    name: '时间戳',
    summary: '一个日期或一个时间，按这套系统渲染它们的唯一方式渲染。',
    when: '屏幕上任何一个时刻。另一条路是在调用处写 toLocaleString()，一个产品的一屏上凑齐四种日期格式就是这么来的。',
    accessibility: [
      'datetime 属性从第一次渲染起就带着精确的 ISO 时刻，所以读机器值的辅助技术从不依赖某个 effect 跑没跑过。',
      '看得见的文字在挂载后变一次，机器值从头到尾不变，播报出来的值和解析出来的值因此始终一致。',
      '解析不了的值渲染成一个破折号，而不是浏览器那句原样的“Invalid Date”——那是工程的残渣，不是该摆到读者面前的东西。',
    ],
  },
  spinner: {
    name: '加载环',
    summary: '系统唯一的“正在处理”指示——一个环，永远不是流光。',
    when: '短到不必交代“接下来是什么形状”的等待。再长一点，就该用 Skeleton。',
    accessibility: [
      'label 要写明在等什么；三个都写“Loading”的转圈对读屏用户等于什么都没说。',
      'label={null} 让它闭嘴，用在本身已经会播报操作的控件里。',
      '只在 motion-safe 下旋转；静止时前四分之一仍然更深，所以照样读作“还没完”。',
    ],
  },
  skeleton: {
    name: '骨架屏',
    summary: '页面到来之前，页面的形状。',
    when: '长到读者会以为页面坏了的等待。描述“接下来是什么”的形状，胜过什么都不描述的一个点。',
    accessibility: ['一个 live region 在外层，里面每个形状都是 aria-hidden。', '脉冲也只有外层一个，所以整页一起呼吸，而不是各闪各的。'],
  },
  progress: {
    name: '进度条',
    summary: '一条会填充的进度条；终点未知时它来回扫。',
    accessibility: ['不传 value 会去掉 aria-valuenow，读屏听到的是“不确定”，而不是一个猜出来的数字。', 'label 必填——一条没有名字的进度条什么也没说。'],
  },
  alert: {
    name: '提示条',
    summary: '关于这个页面的一条消息，就地显示。',
    when: '读者需要看见、可能需要处理的事。只需要注意一下的，是 Toast。',
    accessibility: ['danger 是 role="alert"，会打断；其余三种是 role="status"，等读屏说完这句话。', '颜色由图标和文字双重表达。'],
  },
  'empty-state': { name: '空状态', summary: '一个还什么都没有的集合。', when: '这里没有出错，所以文案说“接下来做什么”，而不是“什么失败了”。' },
  'error-state': { name: '错误状态', summary: '一个没能显示出来的页面。', accessibility: ['巨大的状态码是 aria-hidden 的；紧随其后的标题用文字说了同一件事。'] },
  toast: { name: '轻提示', summary: '一次性的确认，在应用根部挂一次。', when: '某件事成功了、且不需要回应。Toast 是被时间关掉的，而时间不算确认。' },
  field: {
    name: '表单项',
    summary: '一行带标签的表单：标签、控件，和下面那一条消息——在 row 布局下，它就是那一行设置项。',
    when: '任何带标签的控件。layout="row" 就是设置行——标签和 description 在行首，控件在行尾——它在这里是一种布局而不是第二个组件，因为不管哪种排法，标签接线、必填标记和消息插槽都还是同样这三件事。',
    accessibility: [
      '没传 id 时会自己生成一个，所以标签永远指向某个东西。',
      '把 aria-describedby、aria-required、aria-invalid 接到控件上，所以校验是被念出来的，不只是被画出来的。',
      'hint 和 error 是同一个位置，不是两条叠着：字段错了的时候，该读的是它哪里错了。',
      'description 排在消息前面一起进 aria-describedby，所以一行设置项先说这个设置是干什么的，再说它哪里错了。',
      'row 布局把标签挪到行的另一头，关联关系一点没变——仍然是 htmlFor 指向那个克隆进去的 id，这也是为什么这一行对 Switch、Checkbox、Input、Textarea 和 NativeSelect 成立，对上面那六个复合控件不成立。',
    ],
  },
  input: { name: '输入框', summary: '一行文本输入。', accessibility: ['placeholder 不是标签——只要有人开始打字它就消失了。请配合 Field 使用。'] },
  textarea: { name: '多行输入', summary: '多行文本输入，只能纵向拉伸。' },
  select: {
    name: '选择器',
    summary: '从一个列表里选一项，从头到尾都由我们绘制。',
    when: '大约十几个选项以内。再多就该用 Combobox——一个没法筛的列表，扫起来比能打字筛的更慢。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', 
      '选项列表是我们自己的，所以它不会在打开的一瞬间换掉字体、间距和选中色——那正是原生 select 会做的事。',
      '键盘行为仍是平台的那一套：首字母跳转、方向键、Home 和 End、Escape 关闭且不选。',
      'label 必填。触发器上显示的是值，值不是名字。',
    ],
    keyboard: ['展开列表。', '在选项之间移动。', '首字母跳转——跳到下一个以该字母开头的选项。', '跳到第一个或最后一个选项。', '不选中直接关闭。'],
  },
  'native-select': {
    name: '原生选择器',
    summary: '平台自己的选择器，能改的地方改了。',
    when: '这是逃生口，不是默认值。用在平台确实更好的地方：手机上很长的列表、必须在没有 JavaScript 时也能用的表单、要抠最后一个 KB 的页面。',
    accessibility: ['首字母跳转和手机滚轮是浏览器白送的。', '它做不到的是打开之后仍然像这套系统——选项列表由操作系统绘制，带不上任何 token。'],
    keyboard: ['打开系统自带的选择器。', '首字母跳转，由浏览器自己实现。'],
  },
  checkbox: {
    name: '复选框',
    summary: '一个在表单提交时才生效的选择。',
    when: '立刻生效的开关是 Switch。',
    accessibility: ['支持不确定态，这正是“全选”表头在只选了一部分时需要的——普通的未勾选状态在那里表达的是相反的意思。'],
    keyboard: ['切换勾选状态。'],
  },
  'radio-group': {
    name: '单选组',
    summary: '一组互斥的选项。',
    accessibility: ['整组只有一个 Tab 停靠点，方向键在选项之间移动，符合 ARIA radiogroup 模式。', '标签在 <label> 里面，所以整行都是点击目标。'],
    keyboard: ['进入和离开这一组——整组只占一个 Tab 停靠点。', '在选项间移动，并且移到哪就选中哪。'],
  },
  switch: { name: '开关', summary: '一个立刻生效的设置。', when: '放在带保存按钮的表单里，开关就是在骗人——那种情况用 Checkbox。', keyboard: ['切换开关，改动立即生效。'] },
  combobox: {
    name: '可搜索选择器',
    summary: '一个能打字的 select，可以选一个，也可以选多个。',
    when: '大约十几个选项以上。更少的时候 Select 更好：不用思考就能扫完。',
    accessibility: ['高亮通过 aria-activedescendant 移动，焦点留在输入框里——这是 ARIA combobox 模式。自己手搓的会把焦点挪进列表，然后打的字就没法改了。', 'label 必填：触发器上是值，值不是名字。'],
    keyboard: ['展开列表。', '移动高亮，焦点始终留在筛选框里。', '选中高亮那一项；再选一次当前项就是取消。', '不选中直接关闭。'],
  },
  'date-picker': {
    name: '日期选择器',
    summary: '一个日期——或者一段日期——从日历里选。',
    when: '刻意不做成“输入框加日历”：解析手打的日期需要格式，而 03/04 在一个国家是 3 月 4 日，在下一个国家是 4 月 3 日。日期很久远时，日历的月份和年份是下拉。',
    accessibility: ['触发器按访问者自己的地区格式打印日期，而不是写死的 dd/mm/yyyy。', 'DateRangePicker 会等到两端都选完才关——一段范围在有第二个日期之前不算一个值。', '右侧快捷选项是普通按钮，不是菜单：它们设的值和旁边的日历格设的是同一个，所以它们属于同一个控件，Tab 也在同一轮里走到。', '快捷值是点击那一刻才算的，所以标签页开了一整夜，“今天”仍然是今天。'],
    keyboard: ['打开日历。', '不选日期直接关闭。'],
  },
  slider: {
    name: '滑块',
    summary: '在一段范围里选一个值。',
    accessibility: ['label 必填。一个只报“42”的滑块，给读屏用户留下一个数字和不知道它在量什么。', '16px 的滑块外面有一个看不见的 44px 命中区。', '方向键走一步，Page 键走一大步，Home 和 End 到两端。'],
    keyboard: ['移动一个步长。', '移动一个更大的步长。', '跳到最小值或最大值。'],
  },
  'toggle-group': {
    name: '分段控件',
    summary: '分段控件：若干选项，一条。',
    when: '它改的是一个值。切换面板的是 Tabs。',
    accessibility: ['type="single" 有 radio 语义，type="multiple" 是彼此独立的开关。选错会告诉读屏用户：选中一个就会取消另一个。'],
    keyboard: ['进入这一条——整组一个停靠点。', '在各段之间移动。', '切换当前聚焦的那一段。'],
  },
  dialog: {
    name: '对话框',
    summary: '一个模态表面：portal、遮罩、居中面板。',
    accessibility: ['焦点陷阱、Escape、滚动锁定和 aria-modal 都由 Radix 负责。', '没有可见标题的对话框仍然会渲染一个隐藏标题，而不是交付一个没有名字的模态。'],
    keyboard: ['关闭对话框，焦点回到它来的那个触发器。', '在对话框内部循环；打开期间焦点出不去。'],
  },
  'dropdown-menu': {
    name: '下拉菜单',
    summary: '一组动作构成的菜单。',
    when: '动作。会跳转的项属于导航；会设定某个值的是 Select 或 RadioGroup。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', '高亮由 data-highlighted 驱动，同时覆盖悬停和键盘焦点——只写 :hover 会让键盘用户看不见自己在哪。'],
    keyboard: ['打开菜单并落到第一项。', '在菜单项之间移动。', '跳到下一个以该字母开头的项。', '关闭菜单并把焦点还给触发器。'],
  },
  tooltip: {
    name: '文字提示',
    summary: '悬停和获得焦点时出现的一句短标签。',
    when: '任何读者“需要”的东西都不能只放在这里：触屏摸不到它，扫读的人也看不见它。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', '触发器用 asChild，所以子元素必须可聚焦——一个 div 触发器就是没有键盘 tooltip，这个 API 形状让它显性而不是无声。', '它不是无障碍名称。只有图标的按钮仍然需要自己的 aria-label。'],
    keyboard: ['显示提示——聚焦就会出现，不是只有悬停才行。', '关掉提示。'],
  },
  popover: {
    name: '气泡卡片',
    summary: '锚在控件上的面板，里面装可以交互的内容。',
    when: '任何带链接、字段或按钮的东西。tooltip 描述而不能被进入——把控件放进 tooltip，它就再也够不到了。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', 'label 必填：popover 是一个 dialog，没有名字的 dialog 什么都没播报。', '里面的内容像页面其他部分一样用 Tab 走，不像菜单那样用方向键。'],
    keyboard: ['打开它。', '像页面其他地方一样用 Tab 走过里面的内容。', '关闭它，并把焦点还给触发器。'],
  },
  sheet: {
    name: '抽屉',
    summary: '停靠在视口某一边的面板。',
    when: '需要空间的模态——筛选面板、详情视图。它本身就是一个 Dialog，只是靠边；边名按阅读顺序取，所以 end 在英文里是右、在阿拉伯语里是左。',
    accessibility: ['复用 Dialog 的焦点陷阱、Escape 与滚动锁定，而不是再实现一遍——第二个焦点陷阱就是第二个会出错的焦点陷阱。', '标题必填，无论可不可见。'],
    keyboard: ['关闭它，焦点回到触发器。', '在面板内部循环。'],
  },
  'context-menu': { name: '右键菜单', summary: '右键打开的菜单。', when: '永远不能是通往某个动作的唯一路径。触屏、触控板和纯键盘用户可能根本打不开它。', keyboard: ['在平台支持的地方，用键盘打开菜单。', '在菜单项之间移动。', '关闭它。'] },
  'searchable-menu': {
    name: '可搜索菜单',
    summary: '一个能打字筛选的动作菜单。',
    when: 'DropdownMenu 超过十几行就不再能扫读，而用二级菜单去救只会更糟。这就是同一份列表加上一个过滤框。它不是 Command 面板：那个是页面级的、模态的；这个锚在某个控件上。',
    accessibility: ['在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。', 
      '行是 listbox 里的 option 而不是 menuitem，因为过滤这件事要求如此——高亮通过 aria-activedescendant 移动，焦点留在输入框里，而菜单做不到。',
      '这个取舍是刻意的：一个没法筛的菜单，对读者来说比一个会执行动作的 listbox 更糟。',
    ],
    keyboard: ['打开菜单。', '移动高亮，焦点始终留在筛选框里。', '执行高亮那一项动作。', '什么都不执行，直接关闭。'],
  },
  command: {
    name: '命令面板',
    summary: '可筛选的动作列表——⌘K 那个面。',
    accessibility: ['列表随打字过滤，高亮随方向键移动，焦点始终留在输入框里。最后这条是 ARIA combobox 模式，也是自制面板一定会做错的地方。'],
    keyboard: ['移动高亮。焦点留在输入框里，所以你打的字还能继续改。', '执行高亮那一项。', '关闭面板。'],
  },
  tabs: {
    name: '标签页',
    summary: '一条，若干面板。',
    accessibility: ['这条会横向滚动而不是折行：折到第二行会把下面每个标签都推走，读者刚要点的那个就没了。', '高 44px，标签页也是指针目标。'],
    keyboard: ['进入和离开标签条——整条只占一个 Tab 停靠点。', '在标签之间移动，面板跟着换。', '跳到第一个或最后一个标签。'],
  },
  accordion: { name: '手风琴', summary: '就地展开的折叠行。', when: '标记是加号不是尖角：加号说“这会展开”，尖角说“下面还有”。', keyboard: ['在各行之间移动。', '展开或收起当前聚焦的那一行。'] },
  collapsible: { name: '折叠面板', summary: '一个自己开合的东西。', when: '和 Accordion 的差别是算术：手风琴是一个集合，集合才能协同。只有一项的手风琴在管理一个没人读的值。', keyboard: ['展开或收起。'] },
  breadcrumb: {
    name: '面包屑',
    summary: '你在哪，画成一条路径。',
    accessibility: ['最后一节是带 aria-current="page" 的文字，永远不是指向自己的链接。', '分隔符是 aria-hidden 的，所以这条路径不会被念成“首页 斜杠 作品 斜杠”。'],
  },
  pagination: {
    name: '分页',
    summary: '带页码的分页，中间省略。',
    accessibility: ['当前页是带 aria-current 的按钮，不是加了样式的 span——按控件跳转的读者需要能找到它。', '只有一页时什么都不渲染。为一页做的分页器是摆设。'],
    keyboard: ['能走到每一个控件，包括当前页。', '跳到那一页。'],
  },
  'nav-item': { name: '导航项', summary: '侧边栏里的一行。', accessibility: ['aria-current="page"，而且不只靠颜色：当前行同时由字重和填充底色承担。'] },
  article: {
    name: '长文',
    summary: '长文阅读面——Markdown 能产出的一切，都套上这套系统的字体、颜色和线。',
    when: '一篇文章、一条更新日志、一份文档。不是给界面文案用的：卡片里的一段话就是一段话，这是一整列有自己节奏的正文。',
    accessibility: [
      '默认渲染成 <article>，所以整篇内容是读者可以直接跳到的地标。',
      '每个标题都带 scroll-margin，锚点跳过去时不会被固定的顶栏盖住。',
      '样式是不分层引入的，所以在文章里它们赢过组件的分层工具类——正是这一点让一个 Markdown 段落把外边距让给文章的节奏。',
    ],
  },
  card: { name: '卡片', summary: '一块有边界的表面，下面没有阴影。', when: '需要读作“浮起来”的卡片是 plate，它靠反色分离，而不是靠模糊。' },
  table: {
    name: '表格',
    summary: '一张数据表——对齐、排序、边框都可以按列配置。',
    when: '对齐按列设置，数字靠尾边，这样每一位才能对齐。排序按列开启：每个表头都是按钮，等于在邀请读者去排一个数据本来就排不了的列。',
    accessibility: [
      '可排序的表头是 th 里面的 button，而不是给单元格挂 onClick——带 onClick 的单元格既不可聚焦也不会被播报，那个排序就只对鼠标存在。',
      'aria-sort 由 sortDirection 设置，这是读屏用户得知这张表已被排序的唯一途径。',
      '任何边框设置下都没有斑马纹：在单色系统里，一条被染色的行是又一个和页面底色抢注意力的表面。','caption 必填：一个页面上三张表，其中没有名字的那张是没法导航的。', '列标题是 <th scope="col">，所以一个单元格能被追溯回它的表头。'],
    keyboard: ['走到滚动区域，以及每一个可排序的表头。', '区域拿到焦点后，横向滚动表格。'],
  },
  'scroll-area': {
    name: '滚动区域',
    summary: '一个会滚动的盒子，滚动条在哪都长一样。',
    when: '有边界的面板——很长的选项列表、一段日志。页面级或正文滚动用 scroll-slim 工具类更轻，也不需要组件。',
    accessibility: ['视口保持可聚焦。一个内容本身不可聚焦的滚动区域没有 Tab 停靠点，折线之外的一切对没有鼠标的人等于不存在。', 'label 必填，因为一个没有名字的键盘停靠点只会播报“group”。'],
    keyboard: ['把焦点移进这个区域——没有鼠标时，这一步才让它能滚。', '滚动它。'],
  },
  calendar: {
    name: '日历',
    summary: '一个月，画成一格一格的天。',
    when: '单独用来看范围或排期；放进 DatePicker 里用来选一天。',
    accessibility: ['方向键走一天，Page 键走一个月，Home 和 End 到这一周的两端。', '“今天”是描边，“选中”是填充——一个是日历自身的事实，一个是读者做的选择，两者不能长得一样。', '月份和年份用的是系统自己的 Select，不是平台的：一百年的原生列表是在滚动而不是在选择，而且样式由操作系统决定。', '默认前后各十年。生日需要更宽的范围，用 startMonth 去要。'],
    keyboard: ['移动一天。', '移动一周。', '移动一个月。', '跳到本周的第一天或最后一天。', '选中当前聚焦的那一天。'],
  },
  'app-shell': {
    name: '应用外壳',
    summary: '桌面上两栏，手机上一栏加抽屉。',
    accessibility: ['抽屉除了点遮罩，也能用 Escape 关闭，所以键盘用户不会被困在里面。', '遮罩是 <button>，因为带 onClick 的 div 既够不到也不会被播报。'],
  },
  'description-list': {
    name: '描述列表',
    summary: '一条记录的各个字段，用真正的 <dl>，不是一堆 div 拼的网格。',
    when: '正面看一条记录——详情页、摘要面板。从上往下看好几条记录，那是 Table。',
    accessibility: [
      '真正的 <dl>、<dt> 和 <dd>，读屏软件靠它才知道一个标签命名的是它旁边那个值。',
      '每一对包在一个 <div> 里，规范允许 <dl> 里出现它，辅助技术也会直接读穿过去。',
      '空列表渲染成 null，而不是一个空的 <dl>，所以不会有谁去播报一个一项都没有的列表。',
    ],
  },
  toolbar: {
    name: '工具栏',
    summary: '贴在工作区边缘的那条动作栏。',
    when: '表单滚动时仍然要够得着的那几个动作，或者一个列表上方的筛选条。不是页面头部——那是 AppShell。',
    accessibility: [
      'label 必填，它就是这个 group 的可访问名称，所以一个同时有筛选条和动作条的页面播报出来的是两个不同的东西。',
      '每个控件都保留自己在 Tab 顺序里的位置，因为这条栏刻意不去声明 role="toolbar"，也就不去认它那份“只占一个 Tab 停靠点”的约定。',
      '底是不透明的，所以栏上的控件对比度永远是对着 --paper 算的，而不是对着此刻正从背后滚过去的随便什么东西。',
    ],
    keyboard: ['依次走到每一个控件——这条栏本身不是一个停靠点。'],
  },
  'aspect-ratio': {
    name: '宽高比',
    summary: '一个盒子，不管里面装什么都保持形状。',
    when: '高度必须在内容加载之前就知道——否则每来一张图就要重排一次的媒体网格。',
    accessibility: [
      '一个没有 role 的普通盒子：它只约束几何，什么都不说，所以里面的 <img> 留着自己的 alt，无障碍树上不会多出任何东西。',
      '在内容到达之前先把高度占住，下面的东西才不会在指针或读者点下去的那一刻从底下挪走。',
    ],
  },
}

/** Component copy for a locale, falling back to whatever the registry holds. */
export function componentCopy(locale: Locale, slug: string): ComponentCopy {
  if (locale === 'en') return {}
  return COMPONENTS_ZH[slug] ?? {}
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
  const zh = locale === 'zh' ? COMPONENTS_ZH[slug]?.name : undefined
  return zh ? `${name} ${zh}` : name
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
      '只有一条阶梯，以及带动整条阶梯的一个系数：每一级都是 --radius-factor 的倍数，所以主题只改一个数，各级之间的比例不变。这正是嵌套能对上的前提——两条相隔 p 的圆角边只有在“内圆角 = 外圆角 − p”时才是同心的，--radius-row 和 --radius-frame 分别给出了这两个方向。50% 的圆是几何形状而不是圆角，它压根不在这条阶梯上。',
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
  blog: {
    name: '博客列表',
    summary: '一个出版物索引：一条筛选栏、一篇头条，以及一列用细线分隔的记录。',
    tests: '长短不一的记录。卡片网格会把它们藏在等大的盒子里，细线列表不会——所以某一条摘要三行、下一条一行，立刻就看得出来。',
  },
  post: {
    name: '文章',
    summary: '一篇文章，由真正的 Markdown 文件经站点自己的管线渲染出来。',
    tests: '阅读面，面对的是这个仓库里没人手写过的标记：标题、表格、脚注、渲染成 MathML 的 LaTeX、任务列表、代码块和一张流程图，全部出自一个 .md 文件。',
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
