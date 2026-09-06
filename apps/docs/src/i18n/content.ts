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

export const COMPONENTS_ZH: Record<string, ComponentCopy> = {
  'bar-list': {
    summary: '一个排行榜——条形在名字**后面**，而不是旁边。',
    when: '来源排行、最慢的接口、最大的客户。横向柱状图会把三分之一的宽度花在一根重复标签的坐标轴上，而这些标签本来就可以直接写在行里。',
    accessibility: [
      '是真正的 <table>，两列、一行一个条目——因为排行榜本来就是这个结构。条形是名字那一格的**背景**，所以它不会变成读屏软件还要多走一遍的第二个元素。',
      'limit 会把尾巴**加总**成一行「Other」，而不是丢掉——一个悄悄扔掉另外四十项的「前五」是在错误陈述整体，而读者根本看不出来。',
      '两个榜要并排比较时一定要固定 max：各自独立取刻度的话，两边的第一名都会填满整条轨道，两个差得很远的数字看起来一模一样。',
    ],
  },
  'big-number': {
    summary: '一个数字，用标题的字号。',
    when: '要报的就只有一个数。给单个值画图，图形本身不承载任何信息，读者还得去解码一根坐标轴，才能拿回那个本可以直接印出来的数字。',
    accessibility: [
      '变化的方向由调用处通过 intent 明说，绝不从正负号推断：「错误率降了 12%」是好消息，「收入降了 12%」不是，而组件无从判断自己手上拿的是哪一个。',
      '方向由箭头和文字承担，状态色是第三重信号、绝不是唯一的一重——所以这个读法在灰度、强制颜色和色盲情况下都还成立。',
      'value 接收的是**已经格式化好**的值。这个组件不去猜单位、货币或地区格式。',
    ],
  },
  'bullet-chart': {
    summary: '一个度量、它的目标，以及说明这个数好不好的几条背景带。',
    when: '一页要盯十个数的状态页。Stephen Few 设计它就是为了替掉仪表盘上的表盘——那种东西花掉整张卡片，只把一个数说得很差。',
    accessibility: [
      '纯 HTML + 逻辑属性写成，不需要渲染引擎，可服务端渲染，在从右到左的文档里也是对的。recharts 不在场时照样能用。',
      '几条带子是一个**判断**，却和被测量的那个数用同一种墨画出来，所以页面必须交代它们从哪来。只是把量程三等分的带子会让图看起来「已经被评估过」，其实并没有。',
      '它呈现的是一个瞬间，除了 target 之外不携带任何比较。「我们是怎么走到这儿的」要的是 LineChart。',
      '共用的带子只有在几个度量共用同一把尺时才有意义——延迟和转化率并排时，要给每个度量各自的 ranges 和 domain。',
    ],
  },

  'scatter-chart': {
    summary: '两个度量互相对照，每个观测一个点。',
    when: '相关性、聚类、离群点——这些问题一旦被塞进柱状图的桶里就答不出来了。这也是这里唯一一张横轴是数值而不是分类的图。',
    accessibility: [
      'title 必填。表格视图是显式声明的、不是推断出来的：散点的数据挂在每条序列上，根节点上并没有一份统一的数据行可读。',
      '在这里承担别处由色相承担的工作的是**形状**。两团重叠的点，用圆形对十字形去分远比用两级灰阶好认——而且形状在叠印时仍然成立，灰阶不行。',
      '实心点自带一圈页面色描边，所以两个落在同一位置的观测仍然数得清。',
      'ZAxis 把它的度量映射到点的**面积**、不是半径：半径翻倍会让墨量变成四倍，这是气泡图最常见的说谎方式。',
    ],
  },
  'funnel-chart': {
    summary: '只会越来越窄的若干阶段。',
    when: '注册流程、招聘管线、结账流程。当流量会**分叉**而不只是收窄时，那是 SankeyChart——漏斗从构造上只有一条路径。',
    accessibility: [
      'title 必填；各阶段同样会渲染成一份视觉隐藏的表格。',
      '收窄编码的是相邻两阶段之间的**比例**，而眼睛读的是围出来的面积，所以漏斗会放大一次平缓的下滑。组合一个 Label 把数字印上去——那就是补救。',
      '默认样式让每个阶段共用同一种填充、把落差交给形状去说。再让每个阶段依次加深，等于把同一个事实编码两遍。',
    ],
  },
  'treemap-chart': {
    summary: '整体的组成部分——当部分多到饼图撑不住、而且还会嵌套时。',
    when: '饼图在六项时就已经失效，矩形树图在五十项时还读得动。项目少于十几个、而且要读排名时，柱状图的长度是更精确的编码。',
    accessibility: [
      'title 必填。表格视图列的是**叶子**以及命名它的路径：一棵嵌套的树被逐行念出来，没人跟得上。',
      '编码用的是面积，所以数据必须非负，而且加总起来要是读者认得出的那个“整体”。',
      '色块之间的缝隙是一道页面色描边、而不是把矩形画小——各部分不再相接的树图，就不再读作对一个整体的划分了。',
    ],
  },
  heatmap: {
    summary: '一格一格按轻重去读的值。',
    when: '活跃度日历、混淆矩阵、按小时与星期分布的负载。这是单色系统反而比彩色系统渲染得更好的那一种图。',
    accessibility: [
      '是真正的 <table>，不是 SVG：读屏软件走的结构就是眼睛读的结构，每个格子都会念出自己的行、列和值。',
      '明度是唯一一个顺序毫无歧义的通道——这正是别处那句“单一色相，由浅到深”的来历。而在这里，根本没有色相可以搞错。',
      'null 画成一圈虚线轮廓，绝不画成最浅的那一格——缺测不是零。',
      '两张网格要对照时一定要固定 domain：各自独立取域的两张图长得一样、含义却不同，这是共享图例也补不了的错。',
    ],
  },
  sparkline: {
    summary: '一个词那么大的一串数字。',
    when: '表格单元格里、数字旁边、一行的末尾。要精确读趋势时，它需要的是 LineChart 和属于自己的空间。',
    accessibility: [
      'label 必填，而且它就是全部的可访问名称：迷你折线没有坐标轴也没有图例，再没有别的东西描述它。',
      '刻意不画坐标轴。任何能让它回答“到底是多少”的装饰，同时也会让它大到没法内嵌——而内嵌正是选它的唯一理由。',
      '一列迷你折线一定要固定 domain：各自独立取域的话，每一行的波峰波谷看起来都一模一样，表格就开始主动误导人了。',
      '一条 path，不需要渲染引擎——所以在表格里放一百个也不花什么代价。',
    ],
  },

  // ─── 数据 ───
  'area-chart': {
    summary: '连续轴上的一条填充序列，面积本身是有意义的。',
    when: '看一个量随时间的变化。要把几条序列拿来互相比较，用 LineChart——四层半透明的填充叠在一起，哪个问题都答不了。',
    accessibility: [
      'title 是必填的，它就是这张图的可访问名称，无论是否显示出来。',
      '数据行会再渲染一份视觉隐藏的表格，所以数字是可以被读到的，而不只是被画出来。页面自己已经列了数据时，用 hideDataTable 关掉。',
      '六种填充样式的存在是有原因的：在默认的单色方案里，纹理才是身份的第一载体，灰阶只是第二层——这也是两条序列在黑白打印和强制颜色模式下仍能被区分的原因。',
      '入场揭示是一层逐帧的 SVG 蒙版，在 prefers-reduced-motion 下会被完全去掉，爬行虚线同理。',
    ],
    keyboard: [
      '进入图表，Recharts 的可访问层让它可以被导航。',
      '在数据点之间移动光标，并逐个播报。',
    ],
  },
  'bar-chart': {
    summary: '按长度比较的离散分类。',
    when: '分类是一个个桶而不是连续区间。如果横轴是时间、读者关心的是趋势，AreaChart 或 LineChart 读起来更快。',
    accessibility: [
      'title 必填；数据行同样会渲染成一份视觉隐藏的表格。',
      '每根柱子都带一块看不见的通高命中区，所以刻度底部那根 3px 的柱子和满高的一样好点。',
      '可点击的图例项是真正的 button 并带 aria-pressed，不是挂了点击事件的 div。',
      '错峰生长动画锚定在图表自身的起始时刻、而不是每根柱子的挂载时刻，所以悬停不会让它重播——减少动态偏好下则整个去掉。',
    ],
  },
  'line-chart': {
    summary: '连续轴上互相比较的多条序列。',
    when: '读者在把序列互相比较。当某条线下方的面积才是重点时，就把它填起来——那是 AreaChart。',
    accessibility: [
      'title 必填；数据行同样会渲染成一份视觉隐藏的表格。',
      '可点击的线下面会垫一条 15px 的透明线，因为 1.6px 的描边不构成指针目标。',
      'buffer 通过测量真实路径长度把最后一段画成虚线，所以在任何曲线类型下，“预测”都明确是另一种性质的事实。',
    ],
  },
  'composed-chart': {
    summary: '同一根轴上的柱与线——体量，以及它变化的速度。',
    when: '两个共享同一刻度的度量。不共享刻度的两个度量应该拆成两张图、或统一到同一基准：这里没有第二根 Y 轴，这是刻意的。',
    accessibility: [
      'title 必填；数据行同样会渲染成一份视觉隐藏的表格。',
      '只有一根值轴。双轴图让作者自己决定两条线在哪里相交，这是一张图能做的最具误导性的事。',
      'enableHoverHighlight 会把悬停列之外的柱子调暗，驱动它的是图表自己的 tooltip 索引。',
    ],
  },
  'pie-chart': {
    summary: '一个整体的若干部分。',
    when: '只回答“大概占多少”，再精确就不行了。要排序或比较扇区——尤其是跨两张饼图比较——那是 BarChart 的活。',
    accessibility: [
      'title 必填；数据行同样会渲染成一份视觉隐藏的表格。',
      '图例默认放在饼图下方，因为饼图没有一根给扇区命名的分类轴。',
      '组合一个 Label 把数字印在扇区上：饼图的弱点就是角度难读，印出来的数字直接消掉了这次猜测。',
      '只有一种填充样式，这是刻意的。扇区又小又不规则，往里塞纹理只会读成噪声。',
    ],
  },
  'radar-chart': {
    summary: '若干个具名维度上的一张侧写。',
    when: '识别一个轮廓。雷达图围出的面积取决于辐条恰好排成什么顺序，所以它不适合用来比较量级。',
    accessibility: [
      'title 必填；数据行同样会渲染成一份视觉隐藏的表格。',
      '最多两三条序列：填充多边形会互相重叠，而透过两层半透明去判断面积正是雷达图最不擅长的事。再多就用 variant="lines"。',
    ],
  },
  'radial-chart': {
    summary: '弧上的值——一个仪表，或几个共用一把刻度的总量。',
    when: '单个值对照一个固定总量。超过大约四根柱子就该老实用 BarChart，因为径向柱的半径并不代表它的值。',
    accessibility: [
      'title 必填；传入 valueKey，数据行同样会渲染成一份视觉隐藏的表格。',
      '要设置 max，否则刻度会从数据推出来、最大的那根永远填满整段弧——这会让 62% 和 98% 看起来一模一样。',
      'showTrack 画出未填充的剩余部分，仪表全靠它才读得懂。',
    ],
  },
  'sankey-chart': {
    summary: '一个量在流经各个阶段时去了哪里。',
    when: '漏斗、预算、能耗或流量拆解。这是这里唯一一张数据是图（graph）而不是表的图表。',
    accessibility: [
      'title 必填。隐藏表格列的是“流”而不是节点——一张节点合计表会丢掉这张图存在的全部理由：每一条“从哪到哪”。',
      '四种连接样式：gradient 读起来像流动，source 与 target 把整条带归属到某一端，solid 放弃颜色、让节点去承担身份。',
    ],
  },

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
    summary: '主题标签——一个话题、一项技术、一个筛选面。',
    when: '若干个并排出现、供人扫读。关于一条记录的一个事实是 Badge。',
    accessibility: ['纯展示。要用它做筛选，就把它包进 button 并传 active——焦点圈和按下状态该留在真正拥有它们的元素上。'],
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
    summary: '一条线，三种粗细——单色页面需要它们。',
    when: '细线分行，边线分块，实线压在报头下面。',
    accessibility: ['默认 role="none"。只是把东西在视觉上分组的线，不应该被念出来。'],
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
    summary: '一行带标签的表单：标签、控件，和下面那一条消息。',
    accessibility: [
      '没传 id 时会自己生成一个，所以标签永远指向某个东西。',
      '把 aria-describedby、aria-required、aria-invalid 接到控件上，所以校验是被念出来的，不只是被画出来的。',
      'hint 和 error 是同一个位置，不是两条叠着：字段错了的时候，该读的是它哪里错了。',
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
      '样式全是低优先级的元素选择器，所以放进去的组件仍然用自己的类。',
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
  'architecture-figure': {
    name: '架构图',
    summary: '一张组件地图：服务、数据存储、信任边界，以及谁在跟谁说话。',
    when: '问题是“谁跟谁说话”时用它。问题是“按什么顺序”，那是流程图或时序图；问题是“这根箭头里装的是什么”，那是数据流图。',
    accessibility: [
      '<svg> 是 role="img" 并带名字，所以读屏软件播报的是一张图，而不是按绘制顺序把两百个 <text> 节点走一遍。',
      '图的内容以普通列表的形式发布在图旁边——每个节点连同它的种类，每条关系写成「A → B：走 HTTPS」。对看不到这张图的人来说，意思就活在那份列表里。',
      '传了 onSelectNode，那份列表就变成真按钮——这是键盘唯一能选中节点的路径：图里的板块按设计就是纯装饰的。',
    ],
  },
  'workflow-figure': {
    name: '流程图',
    summary: '按泳道和阶段排的流程，主路径画得比它的分支重。',
    when: '运行手册、审批链、CI 流水线——任何每一步都有归属的东西。mainPath 才是把十四个方框变成一张有主语的图的那一下。',
    accessibility: [
      '和每张图一样的约定：一张有名字的图，节点和关系以文字发布在旁边。',
      '异常泳道是这套系统的图里唯一带底色的带子，而且它仍然有标签——底色不是单独在承载意思。',
    ],
  },
  'sequence-figure': {
    name: '时序图',
    summary: '一条随时间展开的调用链：谁问谁、按什么顺序、又回来了什么。',
    when: '唯一一张纵轴有含义的图。消息带显式的 y，所以相隔八个单位的两次调用是同时发生的，相隔两百个单位的不是。',
    accessibility: [
      '返回消息既是虚线、又用空心箭头——两个信号，因为在一条密集的调用链里，读者最常要挑出来的就是回包。',
      '图旁边的消息列表按顺序读，那就是纵轴的绘制顺序。',
    ],
  },
  'dataflow-figure': {
    name: '数据流图',
    summary: '一条管线：数据从哪来、经过了什么、最后落到谁手里。',
    when: '结构上跟架构图很像，读的却是另一个问题。classification 单独占一个标签，因为做治理审查的人找的正是那一项。',
    accessibility: [
      '一条流的 classification 会并进它的摘要行，所以「clickstream — PII touch」能传达给看不到那枚标签的人。',
    ],
  },
  'lifecycle-figure': {
    name: '生命周期图',
    summary: '一台状态机：一个东西可能处于什么状态，以及什么让它在状态之间移动。',
    when: '唯一会花颜色的图，而且它只花系统留给状态的那两个 token。其余区分全靠形状，所以黑白打印还留得下八种里的六种。',
    accessibility: [
      'success 和 failure 是这个包的图里仅有的两处彩色标记，而且各自还有独立的板块形状——颜色从来不是唯一的载体。',
      '就算 spec 没有列出这些转移，主轨也会在第一条泳道的相邻状态之间画出来，因为那是图的脊梁，不是它的例外。',
    ],
  },
  'diagram-canvas': {
    name: '图画布',
    summary: '一个能让比它更大的画在里面平移和缩放的框。',
    when: '任何超尺寸的图形——一张 SVG、一张图片、一张折不下来的表。它不知道什么是节点，这正是它能复用的原因。',
    accessibility: [
      '这个框本身是真正的 Tab 停靠点，键盘控制才按得下去。',
      '不带修饰键的滚轮滚的是页面。缩放需要平台修饰键，所以这个画布永远不会变成文章中间的滚动陷阱。',
    ],
    keyboard: ['以框的中心为原点放大。', '缩小。', '同时把缩放和偏移复位。', '平移。按住 Shift 每次走得更远。'],
  },
  'diagram-toolbar': {
    name: '图工具条',
    summary: '一排属于它下面那个界面的动作。',
    when: 'FloatingIconButton 是一个钉住的动作。这个是装好几个的容器，让它们读起来像一个物件，而不是散落的几颗按钮。',
    accessibility: [
      'role="toolbar" 播报的是一个工具条，而不是六个互不相干的按钮。它不实现漫游焦点——Tab 会逐个访问，对只有三个控件的一条来说这是诚实的做法。',
    ],
  },
  'diagram-export-menu': {
    name: '导出菜单',
    summary: '把图带走：PNG、JPEG、WebP、SVG，以及 1200×630 的分享卡。',
    when: '它自己做导出，而不是抛出一个格式名，因为最难的那一半——序列化之前把自定义属性烘成真实颜色——正是调用方不会知道要写的那一半。',
    accessibility: [
      '导出失败会通过 onResult 报出来而不是被吞掉：一次悄无声息的点击，和一个坏掉的按钮是分不出来的。',
    ],
  },
  'diagram-inspector': {
    name: '检查面板',
    summary: '读者刚刚选中的东西，写在图旁边。',
    when: '一个节点大概能装八个词，再多它就不是节点了。超出这八个的——端口、归属团队、它参与的六条关系——都归这里。',
    accessibility: [
      '是一个带 aria-live="polite" 的具名区域，不是对话框：读者点的是节点，他们没有“打开”任何东西，所以焦点从不被劫持或索要。',
      '关系带了 onSelect 时是真按钮，这样这张图就能用键盘一个邻居一个邻居地走下去。',
    ],
  },
  'diagram-minimap': {
    name: '缩略图',
    summary: '在一个比窗口更大的东西里，你现在在哪。',
    when: '和 DiagramCanvas 搭配。视口矩形是从画布自己的 view 推出来的，从不另存一份——一张跟它的疆域对不上的地图，比没有地图更糟。',
    accessibility: [
      '缩略图是 aria-hidden 的。它映照的那张图已经发布了自己的摘要，再来一份会把整张图念两遍。',
    ],
  },
  'diagram-legend': {
    name: '图例',
    summary: '钥匙：哪一种画法代表哪一类东西。',
    when: '在一套单色系统里它不是可选的装饰。当队列和缓存的区别是一个符号而不是一种颜色时，这里是读者唯一能被告知那个符号是什么意思的地方。',
    accessibility: [
      '是一份成对的列表而不是一排 span，所以“有几项”也是读屏软件会说出来的一部分。',
      'kindLegend、variantLegend 和 stateLegend 都用渲染器自己的绘制代码来造标准集合，所以图例永远不会和图漂移开。',
    ],
  },
  'app-shell': {
    name: '应用外壳',
    summary: '桌面上两栏，手机上一栏加抽屉。',
    accessibility: ['抽屉除了点遮罩，也能用 Escape 关闭，所以键盘用户不会被困在里面。', '遮罩是 <button>，因为带 onClick 的 div 既够不到也不会被播报。'],
  },

  // ─── The statistical family, and small multiples ───
  'box-plot': {
    summary: '一个度量在各个分类上的分布范围。',
    when: '「这东西波动有多大」，而且要一次看六个。要看**单个**分布的形状，用 Histogram；观测点少到能全画出来，用 ScatterChart。',
    accessibility: [
      '一个箱子就是五个数，而五个数分不出一个峰和两个峰。双峰分布画出来的箱子，和一个中心相同的光滑分布**一模一样**——组件把这一点写进了自己的说明里，而不是塞在脚注里。',
      '它同样隐藏样本量：六个点画出来的箱子和六千个点画出来的一样。所以 count 值得带上，而在比较中位数时一定要打开 notched。',
      '原始数值用 Tukey 栅栏归纳，这件事写在页面上而不是默认读者知道——换一套栅栏规则，同一份数据会画出不同的离群点。',
      '隐藏的表格视图带着每个分类完整的五个数，所以不看图形也读得懂这张图。',
    ],
  },
  histogram: {
    summary: '一个分布长什么形状。',
    when: '要弄懂**一个**分布——两个聚集、一道硬底、在超时值上堆成一摞。几个分布要并排比较，那是 BoxPlot 的活。',
    accessibility: [
      '形状是**分箱宽度**的属性，不只是数据的属性：同一批数切成 8 个桶和切成 80 个桶，是两张不同的图。画出这张图的规则——默认 Freedman–Diaconis——写在页面上。',
      '横轴是数值轴，每根柱子由它自己的两条边画出来，所以宽度不均的桶就是它真实的宽度，而不会被压成和邻居一样的等宽槽位。',
      'mode="density" 修的正是不等宽分箱制造的陷阱：在 frequency 下，同样的底层密度，宽一倍的桶会高一倍。',
      '隐藏的表格视图印出每个桶的两条边和它的计数——这是一张分箱图唯一能给出的精确读数。',
    ],
  },
  'waterfall-chart': {
    summary: '一个总数是怎么从一个数走到另一个数的。',
    when: '「为什么变了」，而且贡献项可以是负的。饼图放不下负的扇形；各部分不必刚好补齐两个总数之间的差额时，用 BarChart。',
    accessibility: [
      '连接线是要小心对待的那个断言：它把各步画成一个**序列**，可绝大多数拆解根本不是序列——同一个月里的流失和扩张是同时发生的，而读者会把最左边那根柱子当成第一个原因。顺序是任意的时候，在 description 里说出来。',
      '中间那些柱子是悬空的长度，没有基线可读，所以级联上方一个小的变动很难和接近零处一个大的变动作比较。只有 total 柱坐在坐标轴上，也只有它们能被绝对地读出来。',
      '方向由标签的正负号和柱子的纹理承担，不只靠位置——所以在灰度和强制颜色下这个读法仍然成立。',
      '不给 value 的收尾柱由各个增减量算出来，把这道算术留在数据里，而不是留在调用者脑子里。',
    ],
  },
  facet: {
    summary: '同一张图按分组各画一遍，共用同一把尺。',
    when: '八条序列挤在一个画框里会变成一团乱麻。真的需要逐点比较的两三条序列，还是该待在同一张图里。',
    accessibility: [
      '共享取值域是默认，也是这件事的全部意义：各自独立取刻度的话，峰值 40 的一组和峰值 4,000 的一组会画出同样的形状，读者要来做的那个比较不只是丢了，是被**反转**了。',
      '每一格都是一个有自己可访问名称的 figure，所以读屏软件走过的是八张各有其名的图，而不是一整块没有名字的网格。',
      '超过 max 的格子会折进一条明说的 overflow 里，而不是被丢掉，而且数量会印出来——一个悄悄少了四组的网格，读者是察觉不到的。',
      '格子的顺序由调用处通过 sort 明确选定，因为读者会把阅读顺序当成排名。',
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
      data: {
        title: '数据',
        note: '这是整套系统唯一一处必须回答一个单色方案宁愿不被问到的问题的地方：没有色相可以花，怎么把六条序列分开？答案是纹理——每张图都提供填充样式，而下面这条色阶是**第二**层编码，不是第一层。八级是交错排列的，所以相邻序列在明度上尽可能拉开（ΔE 21，下限是 15），而且每一级在自己的底色上都过 3:1。彩色色板能通过的六项检查里，有两项在这里是**刻意**不通过的，而且是明说而不是藏着：色度下限（这些都是灰）和明度带（--series-1 就是墨色本身）。真的需要色相的使用者，是去设 data-chart-palette="chroma"，而不是自己挑十六进制。--chart-fill 和 --chart-texture 是全系统唯一一对在两种底色上取值不同的 token：墨色以 14% 压在纸白上是一条读得出的带，纸白以 14% 压在近黑上什么都不是。',
      },
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
  architecture: {
    name: '架构浏览器',
    summary: '把整块屏幕交给一张图：浮动工具条、可平移的画布、检查面板、缩略图、图例，以及它下面的结论。',
    tests: '围绕一个界面**排布**的 chrome，而不是和它堆在一栏里。画布之上的浮动条、出现在读者视线已经在的地方的面板、远角上的缩略图——只在一栏里检查过的间距决定，撑不过这一关。',
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
