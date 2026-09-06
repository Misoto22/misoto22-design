/**
 * The Charts group of the Chinese catalogue — 图表 — and nothing else.
 *
 * `content.ts` is still the module every consumer imports. It keeps
 * `ComponentCopyZh`, the foundations, the page copy and the lookups, and
 * assembles `COMPONENTS_ZH` by spreading these ten files in `GROUPS_ZH`
 * order. Nothing imports this one directly.
 *
 * A group is the unit for the same reason it is in the package's own
 * `agent/catalog/charts.mjs`, which this file mirrors slug for slug and in the
 * same order: an entry is prose — an anatomy row and a practice line per part —
 * and ninety-two of them in one file is a file only one hand can be writing at
 * a time. `content.test.ts` fails if the assembly loses a slug or if two of
 * these files claim the same one.
 *
 * Every line here carries a fingerprint of the English it was written from —
 * the `['a1b2c3d4', '……']` in front of the prose, and `hash` on an anatomy row.
 * It is what makes a REWRITTEN English line fail the build rather than leave a
 * Chinese sentence saying what the English no longer says; `content.ts` has the
 * reasoning. Never write one by hand: fix the prose, then regenerate the hash
 * beside it from `agent/catalog/`.
 */

import type { ComponentCopyZh } from '../content'

export const CHARTS_ZH: Record<string, ComponentCopyZh> = {
  'area-chart': {
    name: '面积图',
    summary: ['3b463a69', '连续轴上的一条填充序列，面积本身是有意义的。'],
    when: ['0e0cd1dd', '看一个量随时间的变化。要把几条序列拿来互相比较，用 LineChart——四层半透明的填充叠在一起，哪个问题都答不了。'],
    accessibility: [
      ['00d6e267', 'title 是必填的，它就是这张图的可访问名称，无论是否显示出来。'],
      ['80efd0f1', '数据行会再渲染一份视觉隐藏的表格，所以数字是可以被读到的，而不只是被画出来。页面自己已经列了数据时，用 hideDataTable 关掉。'],
      ['01be909b', '六种填充样式的存在是有原因的：在默认的单色方案里，纹理才是身份的第一载体，灰阶只是第二层——这也是两条序列在黑白打印和强制颜色模式下仍能被区分的原因。'],
      ['e33b5f7d', '入场揭示是一层逐帧的 SVG 蒙版，在 prefers-reduced-motion 下会被完全去掉，爬行虚线同理。'],
    ],
    keyboard: [
      ['1f64e603', '进入图表，Recharts 的可访问层让它可以被导航。'],
      ['2e30cc3e', '在数据点之间移动光标，并逐个播报。'],
    ],
    anatomy: [
      { hash: '5e131d9f', element: '图框', description: 'ChartFigure 画出来的那个 <figure>，名称走 aria-labelledby，而不是交给 figcaption——从 <figcaption> 推名称，只在部分读屏软件里能生效。caption 把 title 和 description 装在一起，在设置 showTitle 之前是 sr-only 的，所以写进 description 的告诫会被播报出来，却永远不会印在页面上。' },
      { hash: 'fe1511d2', element: '绘图区', description: 'ChartContainer：一个 16:9 的盒子，下限 13rem、上限 26rem，也是唯一把 Recharts 写死的 #ccc 坐标轴与网格描边重新指向 --chart-grid 和 --chart-axis 的地方。' },
      { hash: '5666c9b5', element: '面积', description: '<AreaChart.Area>，一条序列一个。每个都会自己生成 id，并把渐变、纹理图案和揭示蒙版都挂在这个 id 之下，所以六种 variant 共处一张图时，谁也不会覆盖谁的定义。' },
      { hash: '391e7526', element: '刷选条', description: '<AreaChart.Brush>，渲染在容器的页脚里、而不是 SVG 内部。两个把手都是 role="slider"，并用 aria-valuetext 报出自己所在的那一行，所以这个窗口用方向键就能够到。' },
      { hash: '64a12e6a', element: '工具栏', description: '<AreaChart.Toolbar>，绘图区上方一排 role="group" 的图标按钮，最多五个、每个 44px。组合它的同时也会打开绘图区自己的滚轮、拖拽和键盘缩放，两者驱动的是同一个窗口，不是两个。' },
      { hash: 'ff578b0c', element: '隐藏数据表', description: '一张 sr-only 的 <table>，取的是完整数据、而不是刷选出来的窗口，所以读表格的人拿到的绝不会比 CSV 导出里的少。hideDataTable 会把它去掉，零行则什么都不渲染。' },
    ],
    practices: [
      ['7c4c04fb', '只堆叠那些真的能相加的量。在 stackType="stacked" 下，一条带的高度是它自己的值，但它的位置是它下面所有值的和，所以把四个互不相干的比率堆起来，画出的是一条没人测量过的累计线。'],
      ['262889f2', '读的是占比而不是体量时，用 stackType="expanded"：它会设置 Recharts 的 expand 偏移，<AreaChart.YAxis> 也会自己换上 percentTick，所以调用处不写格式化函数，坐标轴也是从 0% 读到 100%。你自己传的 tickFormatter 仍然胜出——坐标轴会让位给它，而不是把它丢掉，从前它正是一声不吭地把它丢掉的。'],
      ['0cf077a9', '只有两块面积的图上，先换 variant，再动灰阶梯度。在单色默认方案里，六种填充才是主要编码；而在强制颜色模式下，每一个 --series-* 令牌都会解析成 CanvasText——到那一步，能把两块面积分开的就只剩纹理了。'],
      ['9064ff73', '要传 xDataKey。它是隐藏表格的 rowKey，不传的话表格根本不会渲染行表头那一列：读屏用户拿到的是一列数字，旁边没有月份。'],
      ['f7e51666', '四层半透明的填充叠在一起，正是这种图形的失效方式——第三块面积要透过两层 --chart-fill 去看，它自己的高度已经还原不出来了。几条序列互相比较，那是 LineChart 的事，在那里谁也不遮挡谁。'],
      ['0ce02d44', 'connectNulls 默认是 false，这是有原因的：打开之后，数据里的缺口会被画成一条直线段，和一段真实测出来的平稳期分辨不出来。只有当缺口是渲染产生的假象、而不是缺失的观测时，才去设它。'],
      ['3073f167', '只有一行数据什么都画不出来。一个点没有可填充的线段，dot 在没有组合 <AreaChart.Dot> 时是 false，而空状态也不会触发——因为数据行确实存在——于是坐标轴就画在一张空白的绘图区上。'],
    ],
  },
  'bar-chart': {
    name: '柱状图',
    summary: ['9042e682', '按长度比较的离散分类。'],
    when: ['228c9c61', '分类是一个个桶而不是连续区间。如果横轴是时间、读者关心的是趋势，AreaChart 或 LineChart 读起来更快。'],
    accessibility: [
      ['bd285eb5', 'title 必填；数据行同样会渲染成一份视觉隐藏的表格。'],
      ['8f13371b', '每根柱子都带一块看不见的通高命中区，所以刻度底部那根 3px 的柱子和满高的一样好点。'],
      ['cbf98044', '可点击的图例项是真正的 button 并带 aria-pressed，不是挂了点击事件的 div。'],
      ['f7187b5b', '错峰生长动画锚定在图表自身的起始时刻、而不是每根柱子的挂载时刻，所以悬停不会让它重播——减少动态偏好下则整个去掉。'],
    ],
    anatomy: [
      { hash: '5097893a', element: '图框', description: 'ChartFigure 的那个 <figure>，由 title 命名，无论页面在它上方有没有印出标题。' },
      { hash: '883037d5', element: '柱子', description: '<BarChart.Bar>，通过自定义 shape 绘制：先是一块透明矩形充当命中区，再是比自己槽位矮三个像素的实际柱体，这样堆叠的分段和上面那一段之间就留着一线页面底色。比这道修剪量还短的柱子会被垫到一个像素、而不是缩成没有，所以一个很小的计数永远不会和一个根本不存在的计数在像素上一模一样。' },
      { hash: '846f284d', element: '坐标轴', description: '<BarChart.XAxis> 和 <BarChart.YAxis>，默认都是素面的——没有刻度线，也没有轴线。Recharts 的每一个属性都会直接透传，domain 也在内，而这正是被截断的基线进来的那扇门。' },
      { hash: '17e4319b', element: '图例', description: '<BarChart.Legend>。开了 isClickable，每一项就是一个真正的、带 aria-pressed 的 <button>，而不是挂了事件的 div——这就是键盘够得到的筛选器和够不到的筛选器之间的差别。' },
      { hash: '9193ff54', element: '数值标签', description: '<BarChart.Values>，组合在柱子内部的插槽。show 默认是 last；all 用在五六根柱子、而且确切数字才是重点的场合，再多就是一张披着图表外衣的表格了。' },
      { hash: '2aef9fc8', element: '隐藏数据表', description: '完整数据的那张 sr-only 表格，取的不是刷选出来的窗口，所以读表格的人拿到的绝不会比 CSV 导出里的少。hideDataTable 会把它去掉，零行则什么都不渲染。' },
      { hash: 'fd95ed1f', element: '空状态', description: 'ChartEmpty，data 为空时顶替绘图区渲染——一个标题、一个原因，外加一个可选的动作，这样「筛选没命中」才和「加载失败」区分得开。empty={false} 则保留光秃秃的坐标轴。' },
    ],
    practices: [
      ['71103902', '一个还没结束的周期，用 buffer。它画斜纹的是最后一行数据、不是屏幕上最后一根柱子，所以把刷选拉回区间中段时不会有任何斜纹——一个三月就已经收官的月份，永远不会被画成还在计数。'],
      ['f9f04558', '值轴要锚在零上。柱子编码的是从基线量起的长度，所以经 <BarChart.YAxis> 传进来的 ["dataMin", "dataMax"] 取值域，会把百分之二的差距画成翻倍的柱子。这是柱状图扛不住、而 LineChart 扛得住的那种扭曲：折线编码的是斜率，所以裁剪它的取值域只是把读数重新放大，而不是凭空造一个出来。'],
      ['c071e1d5', '分类名很长时，用 orientation="horizontal"。另一条路是让每一列底下都躺着一个旋转过的刻度标签，而一个旋转的标签比它所命名的那根柱子还难读。'],
      ['141079ab', '在 stackType="percent" 下要给 <BarChart.YAxis> 传 tickFormatter。AreaChart 的 expanded 堆叠会自己换上 percentTick，柱状图的轴不会，它保留 defaultTick——于是一张归一化的图读出来是 0 到 1，而不是 0% 到 100%。'],
      ['3fe06134', '需要跨分类比较的那条序列，要放在堆叠的最底层。只有最下面那一段是从零开始的；它上面每一条带都浮在下面几条之上，而横跨十二个月去读第三条带，是眼睛做不到的比较。这个比较才是重点时，就改用分组柱状图。'],
      ['9af5c862', 'hideDataTable 会让确切数字在任何地方都不复存在。defaultTick 从一万起就开始简写，所以坐标轴写的是 1.2M，<BarChart.Values> 标签也一样；而每一格都是完整 toLocaleString 的那张 sr-only 表格，是真实数字唯一被写出来的地方。'],
      ['cbe75896', '二十根 variant="default" 的柱子是一堵墙，不是二十个值。stripped 在一层淡底上画一道 2px 的顶盖，在这个密度下仍然数得清——它存在的理由就是这个密度。'],
      ['f8154c02', '不要把 barCategoryGap 收掉。组与组之间的空隙，是唯一在告诉读者「相邻两根柱子是两条序列、而不是两个分类」的东西，所以没有分类间隙的分组图会被读成堆叠图。'],
    ],
  },
  'line-chart': {
    name: '折线图',
    summary: ['19dc8914', '连续轴上互相比较的多条序列。'],
    when: ['669af7e6', '读者在把序列互相比较。当某条线下方的面积才是重点时，就把它填起来——那是 AreaChart。'],
    accessibility: [
      ['bd285eb5', 'title 必填；数据行同样会渲染成一份视觉隐藏的表格。'],
      ['740e24e9', '可点击的线下面会垫一条 15px 的透明线，因为 1.6px 的描边不构成指针目标。'],
      ['075291ee', 'buffer 通过测量真实路径长度把最后一段画成虚线，所以在任何曲线类型下，“预测”都明确是另一种性质的事实。'],
    ],
    anatomy: [
      { hash: '08d4a8e8', element: '图框', description: 'ChartFigure 的那个 <figure>，以及它那句 sr-only 的 caption。description 会和 title 一起被播报，只有在 showTitle 下才印出来——而关于坐标轴被裁剪的说明，正该写在这里。' },
      { hash: 'e2707dbe', element: '线', description: '<LineChart.Line>，一条序列一根，描边 1.6px。isClickable 会在可见的那根下面再加一根完全透明的 15px 线，因为一根发丝般的细线不构成指针目标。' },
      { hash: 'fd7c1a3b', element: '数据点标记', description: '<LineChart.Dot> 和 <LineChart.ActiveDot>，都是插槽，也都默认关闭。静止的点共用入场擦除的蒙版，所以它和自己那根线一起到达；激活的点从不被蒙版遮住，因为它只在悬停时出现，那时擦除早就结束了。' },
      { hash: '6e6d37a3', element: '预测段', description: 'buffer 用 getPointAtLength 量出真实路径，把最后一段画成虚线，所以在任何曲线类型下，一个预测读起来都是另一种性质的事实。可绘制的点少于两个时，它退回成一条普通曲线。' },
      { hash: '62f766f2', element: '声化控件', description: '<LineChart.Sonify>，绘图区上方一个真正的 <button>，把可见的数据行播成音高。声音从不由副作用启动，只由这次点击启动，而且它读的是刷选出来的窗口、不是整条序列。' },
      { hash: '7443cb19', element: '隐藏数据表', description: '完整数据的那张 sr-only 表格。Recharts 的 accessibilityLayer 给的是一个每次播报一个点的键盘光标，那是导航；这里才是数字。' },
    ],
    practices: [
      ['a0c0aea4', '这是这一族里唯一扛得住值轴被截断的图。折线编码的是斜率，所以把取值域裁到数据自己的范围内，往往正是让百分之二的变动能被看见的原因——这么做的时候，在 description 里把范围说出来。'],
      ['c4d38c5d', '一个还没结束的周期，用 buffer，别把它丢掉。半个月的数据画成实线读起来像是崩了；画成虚线的最后一段，读起来才是它本来的样子——不完整。'],
      ['ec4712dd', '序列稀疏时，组合 <LineChart.Dot>。点默认是关的，那五个点就是四条线段，读者分不出哪个是测出来的值、哪个只是插值拐了个弯。'],
      ['7bcd4f9b', '只有一行数据什么都画不出来：一个点没有线段，dot 在没有组合时是 false，而空状态也不会触发，因为数据行是存在的。一行的情况要在调用处挡掉。'],
      ['467bda9b', '一个画框里八条线是一团乱麻，而 1.6px 的描边配上八级灰阶梯度，比一张彩色图还要更乱。超过大约五条序列，答案是 Facet，不是第九个梯度槽位——SERIES_SLOTS 是 8，没有第九个。'],
      ['ef069a3f', 'connectNulls 会把缺口变成一条看上去像测出来的直线段。它在这里的代价比在面积图上更大，因为读者会把这段被造出来的线的斜率读成一个变化率。'],
    ],
  },
  'composed-chart': {
    name: '组合图',
    summary: ['32f4e7e4', '同一根轴上的柱与线——体量，以及它变化的速度。'],
    when: ['d8163075', '两个共享同一刻度的度量。不共享刻度的两个度量应该拆成两张图、或统一到同一基准：这里没有第二根 Y 轴，这是刻意的。'],
    accessibility: [
      ['bd285eb5', 'title 必填；数据行同样会渲染成一份视觉隐藏的表格。'],
      ['e93e19d7', '只有一根值轴。双轴图让作者自己决定两条线在哪里相交，这是一张图能做的最具误导性的事。'],
      ['13c94167', 'enableHoverHighlight 会把悬停列之外的柱子调暗，驱动它的是图表自己的 tooltip 索引。'],
    ],
    anatomy: [
      { hash: '7ebb15be', element: '图框', description: 'ChartFigure 的那个 <figure>，由 title 命名，组合起来的各种标记都装在同一个测过尺寸的 ChartContainer 里。' },
      { hash: '7e9caa7e', element: '唯一那根值轴', description: '<ComposedChart.YAxis>。只有一根，这就是整个设计：这里没有双轴的入口，也没有第二把刻度可配，所以两个度量是对着同一组数字读的。' },
      { hash: 'b8d2ef7b', element: '柱子', description: '<ComposedChart.Bar>，体量。和 BarChart 一样走自定义 shape，一样带透明的命中矩形，生长动画一样锚定在图表自身的起始时刻、而不是每根柱子的挂载时刻，所以悬停不会让它重播。' },
      { hash: 'c96e323c', element: '线', description: '<ComposedChart.Line>，变化的速度。它继承图表的 curveType 和揭示动画，所以柱和线是作为一张图一起到达的，不是两个各走各表的动画。' },
      { hash: '3a2fb033', element: '列高亮', description: 'enableHoverHighlight 会把悬停列之外的每个标记调暗，驱动它的是图表自己的 onMouseMove 索引、而不是各个标记自身的悬停——同一列里的柱和线能一起亮起来，靠的就是这一点。' },
      { hash: '4fd5a9e3', element: '刷选条与工具栏', description: '容器页脚里的 <ComposedChart.Brush> 和绘图区上方的 <ComposedChart.Toolbar>。它们驱动的是同一个窗口，所以刷选出来的范围和缩放出来的范围，不会对“屏幕上到底是什么”各执一词。' },
      { hash: '2aef9fc8', element: '隐藏数据表', description: '完整数据的那张 sr-only 表格，取的不是刷选出来的窗口，所以读表格的人拿到的绝不会比 CSV 导出里的少。hideDataTable 会把它去掉，零行则什么都不渲染。' },
    ],
    practices: [
      ['25ee61b8', '两个度量不共享刻度时，把它们统一到同一个基准上——比如都换算成一月份的百分比。这就是这个组件刻意不提供的第二根轴的替代品。'],
      ['3bda11b6', '超过两个标记时，组合一个 <ComposedChart.Legend>。取 --series-1 和 --series-2 的一根柱和一条线，差别只是一级灰阶和一个形状，而其中只有形状是能自我说明的。'],
      ['46e4e9c6', 'enableHoverHighlight 要么每个标记都设，要么一个都不设。只设在其中一个上，悬停的那一列会把自己暗掉一半，读起来像是渲染出了问题，而不是强调。'],
      ['25404e70', '不要借 chartProps、或者给 <ComposedChart.YAxis> 加 yAxisId，把第二根 Y 轴偷渡进来。Recharts 允许这么做；这个组件的主张是它不允许。两把独立选定的刻度，等于让作者自己决定两条线在哪里相交，这是一张图能做的最具误导性的事——而且它对任意两条序列都奏效，屡试不爽。'],
      ['db7314db', '不要以为声音读法在这里也有。AreaChart、BarChart 和 LineChart 各自带着一个 Sonify 插槽，这个没有，所以在一整块仪表板上一路听过来的读者，到这里只能退回那张 sr-only 表格——这也正是 hideDataTable 在这张图上绝对不该设的原因。'],
    ],
  },
  'pie-chart': {
    name: '饼图',
    summary: ['6edda9ad', '一个整体的若干部分。'],
    when: ['a5d05c1c', '只回答“大概占多少”，再精确就不行了。要排序或比较扇区——尤其是跨两张饼图比较——那是 BarChart 的活。'],
    accessibility: [
      ['bd285eb5', 'title 必填；数据行同样会渲染成一份视觉隐藏的表格。'],
      ['f962c843', '图例默认放在饼图下方，因为饼图没有一根给扇区命名的分类轴。'],
      ['def02923', '组合一个 Label 把数字印在扇区上：饼图的弱点就是角度难读，印出来的数字直接消掉了这次猜测。'],
      ['efb7dd65', '只有一种填充样式，这是刻意的。扇区又小又不规则，往里塞纹理只会读成噪声。'],
    ],
    anatomy: [
      { hash: '88568a03', element: '图框', description: 'ChartFigure 的那个 <figure>，零行数据时带一个空状态。这里没有坐标轴，所以在没有空状态的年代，零行数据的饼图就是一个空盒子上顶着一个名字、隐藏表格返回 null——图和它的文字等价物一起沉默。empty={false} 会把那种状态还回来，留给那种「空本身就是结论」的图。' },
      { hash: '3a5b979d', element: '扇区', description: '<PieChart.Pie>。每个扇区都由一道以该行 nameKey 取值为键的对角渐变上色，所以 config 的键必须和这些取值完全一致——名字不在 config 里的那一行，指向的是一道从未定义过的渐变，画出来就是没有填色的。' },
      { hash: 'a9088306', element: '图例', description: '<PieChart.Legend>，默认在饼图下方居中。饼图没有一根给扇区命名的分类轴，所以名字就住在这里。' },
      { hash: '5e1554d4', element: '扇区标签', description: '<PieChart.Label>，一个以 --chart-surface 反白的 LabelList。它的 dataKey 默认取饼图的 value 键，所以把它组合进来，印出来的就是数字。' },
      { hash: '98f0a399', element: '提示气泡', description: '<PieChart.Tooltip>，标题栏被压掉了：扇区自己的名字就是这一行的标签，再加一个标题等于把它印两遍。' },
    ],
    practices: [
      ['ce43130c', '扇区控制在大约五个以内。再多，读者就是在给角度排序了，而这正是饼图最不擅长的比较——BarChart 把同样的占比放到长度刻度上，排名不用额外做什么就从图里出来了。'],
      ['a6b50910', '只要确切占比重要，就组合 <PieChart.Label>。它默认取 value 键，而一个印出来的数字直接消掉了对角度的估计——这是这种图形唯一真正的弱点，也是它最便宜的补救。'],
      ['00dab4bb', '给它一个 innerRadius。环形图读的是弧长、不是扇形面积，而眼睛更擅长前者，中间那个洞还是个放总数的地方。'],
      ['8b1c9248', '负值没有对应的扇区。一个整体的若干部分里不可能有负的那一份，所以带着退款、或者用流失去抵扩张的拆解，是 WaterfallChart 的事——它就是为带正负号的贡献项造的。'],
      ['046ee418', '并排两张饼图不构成比较。跨两个圆去读同一个扇区，比在一个圆里读两个扇区还难，而读者照样会去试——把这两个周期放进同一张分组 BarChart。'],
      ['414fff43', '这张图要是得在强制颜色下活下来，paddingAngle 就要传一个正数。这里只有一种填充 variant，所以八个 --series-* 令牌会全部塌成 CanvasText，每个扇区都是同一块实心形状；把它们分开的只剩几何，而那一两度的缝隙就是全部。描边不是那个机制——它只在 paddingAngle 为负时才画出来，那时扇区互相重叠，用容器色描的边把它们重新分成一叠卡片。0 是唯一两样都没有的取值，于是一张默认的饼图在强制颜色下就是一整块均匀的圆盘，整个读法全压在图例和标签上。'],
    ],
  },
  'radar-chart': {
    name: '雷达图',
    summary: ['e9cab1fa', '若干个具名维度上的一张侧写。'],
    when: ['976e34c9', '识别一个轮廓。雷达图围出的面积取决于辐条恰好排成什么顺序，所以它不适合用来比较量级。'],
    accessibility: [
      ['bd285eb5', 'title 必填；数据行同样会渲染成一份视觉隐藏的表格。'],
      ['1f0dc898', '最多两三条序列：填充多边形会互相重叠，而透过两层半透明去判断面积正是雷达图最不擅长的事。再多就用 variant="lines"。'],
    ],
    anatomy: [
      { hash: '4e76942f', element: '图框', description: 'ChartFigure 的那个 <figure>，极坐标绘图区装在一个 ChartContainer 里。' },
      { hash: '52450e10', element: '多边形', description: '<RadarChart.Radar>。variant="filled" 是默认值，按 --chart-fill 的 2.2 倍上色，因为雷达图的填充本身就是那个标记、而不是线条底下的一层淡底，两块叠在一起时它还得撑得住自己的形状。' },
      { hash: '43c7dabd', element: '辐条标签', description: '<RadarChart.PolarAngleAxis>，围着外圈的那些名字。轮廓上的一个角究竟量的是什么，只有它们说得出来。' },
      { hash: 'add04b3a', element: '径向刻度', description: '<RadarChart.PolarRadiusAxis>，而且要自己选择加上。不加，各道环上就一个数字都没有：读者手里有一个形状，却不知道一道环值多少。' },
      { hash: 'a419d39a', element: '网格', description: '<RadarChart.PolarGrid>，默认是多边形而不是圆形，这样各道环才和数据画在它们上面的那个多边形对得齐。' },
      { hash: 'bdc27d2c', element: '图例', description: '<RadarChart.Legend>。两条在灰阶梯度上相隔两级、又互相重叠的轮廓线，什么名字都没有，而这里也没有一根坐标轴能替它们命名。' },
    ],
    practices: [
      ['613be7df', '把辐条的顺序定下来，并让页面上每一张雷达图都用同一个顺序。一个多边形围出的面积，是各维度恰好排在什么位置的函数，所以重排辐条会在一个数字都没变的情况下改变轮廓。'],
      ['8ce96c6c', '先把每个维度换算到可比的刻度上——一个百分位、一个十分制的评分、一个指数。所有辐条共用同一根半径，所以一根以毫秒计的辐条挨着一根以百分比计的，画出来的尖峰毫无意义。'],
      ['f238851e', '超过两条序列就换成 variant="lines"。填充的多边形会互相重叠，而透过两层半透明去判断面积，恰恰是这种图形最不擅长的事。'],
      ['7ba4579b', '不要从它身上读量级。雷达图是用来识别轮廓的——同一份侧写的前后对比——而“两者哪个更大”是 BarChart 回答的问题，这张图只是看上去像在回答。'],
      ['f888d25e', '不要略过 <RadarChart.PolarRadiusAxis> 就当这张图做完了。图会渲染，环也会渲染，可屏幕上没有任何东西说得出最外那道环是 100 还是 1,000；数字仍然在那张 sr-only 表格里，看得见的读者却拿不到。'],
    ],
  },
  'radial-chart': {
    name: '径向图',
    summary: ['61e2e323', '弧上的值——一个仪表，或几个共用一把刻度的总量。'],
    when: ['ab1b77ce', '单个值对照一个固定总量。超过大约四根柱子就该老实用 BarChart，因为径向柱的半径并不代表它的值。'],
    accessibility: [
      ['1efd0377', 'title 必填；传入 valueKey，数据行同样会渲染成一份视觉隐藏的表格。'],
      ['e4dc6f96', '要设置 max，否则刻度会从数据推出来、最大的那根永远填满整段弧——这会让 62% 和 98% 看起来一模一样。'],
      ['9c110fe1', 'showTrack 画出未填充的剩余部分，仪表全靠它才读得懂。'],
    ],
    anatomy: [
      { hash: '8ac61301', element: '图框', description: 'ChartFigure 的那个 <figure>，零行数据时带一个空状态。它的隐藏表格需要一个值字段，来源是 valueKey，或者退一步，取自组合进来的 <RadialChart.RadialBar> 的 dataKey——所以两个都没写的图，仍然没有表格。' },
      { hash: '87333dc3', element: '弧', description: '<RadialChart.RadialBar>，一行一段，14px 粗、5px 的端头圆角。variant="semi" 会把圆心降到 70%，让半圈弧坐在自己盒子的中间、而不是顶上。' },
      { hash: 'a88a7785', element: '轨道', description: 'showTrack，默认打开，用 --chart-track 在每段弧后面画出未填充的剩余部分。仪表之所以是仪表，靠的就是它：没有它，那段填充就没有一个看得见的整体可以归属。' },
      { hash: '022071fd', element: '刻度', description: '设了 max 时根节点插入的那根 PolarAngleAxis，取值域是 [0, max]，刻度线关闭。不设 max，取值域就改从数据里推出来。' },
      { hash: 'c829aa38', element: '图例', description: '<RadialChart.Legend>。弧没有分类轴，所以超过一根柱子时，能给它们命名的只有它。' },
    ],
    practices: [
      ['68436bb8', '凡是仪表就要设 max。不设，刻度就从数据推出来，于是最大的那根柱子永远填满整段弧，62% 和 98% 会被画成一模一样。'],
      ['66c85b73', '弧不是唯一的标记时，要传 valueKey。它指明隐藏表格印的是哪个字段，也指明图例按哪个字段报告选中项；它和组合进来的 <RadialChart.RadialBar> 一个都没有，就没有值字段，表格也不是空的，而是根本不存在。'],
      ['cdbdeefb', '单个值用 variant="semi"。半圈弧读起来像一个有下限也有上限的表盘，而整圈环则要读者自己去想明白一整个圆值多少。'],
      ['3fb801c0', '不要跨半径去比较柱子。径向柱的长度才是它的值，半径不是，所以装着同一个数字的内圈弧和外圈弧，画出来的长度并不一样——超过大约四根柱子，BarChart 才是老实的形式。'],
      ['3dd17fb5', 'max 没设时，不要让读者把一段弧当成整圈的占比。那时候，扫满一整圈说的是“这里最大的那个”，和“全部”是两句不同的话。'],
    ],
  },
  'sankey-chart': {
    name: '桑基图',
    summary: ['444a28eb', '一个量在流经各个阶段时去了哪里。'],
    when: ['8672cc16', '漏斗、预算、能耗或流量拆解。这是这里唯一一张数据是图（graph）而不是表的图表。'],
    accessibility: [
      ['2ba9fce7', 'title 必填。隐藏表格列的是“流”而不是节点——一张节点合计表会丢掉这张图存在的全部理由：每一条“从哪到哪”。'],
      ['8a7ab03d', '四种连接样式：gradient 读起来像流动，source 与 target 把整条带归属到某一端，solid 放弃颜色、让节点去承担身份。'],
    ],
    anatomy: [
      { hash: 'de98b3f7', element: '图框', description: 'ChartFigure 的那个 <figure>，由 title 命名，图形装在一个 ChartContainer 里。' },
      { hash: '6c6c9c5f', element: '节点矩形', description: '根节点自己的节点渲染器。名字在 config 里的节点，用它对应的渐变上色；不在的则退回 currentColor，所以它只是被画得素净，不会丢掉。' },
      { hash: '407341fe', element: '节点标签', description: '<SankeyChart.NodeLabel>，组合在 <SankeyChart.Node> 里面，而且完全要自己选择加上。不加，图上就没有任何东西有名字——这里没有图例，所以名字只存在于 tooltip 和隐藏表格里。' },
      { hash: 'ad7d7e93', element: '流带', description: '<SankeyChart.Link>。gradient 把源端的颜色渐变到目标端的颜色，是真正读起来像流动的那一种；solid 则彻底放弃颜色，让节点矩形去承担身份。' },
      { hash: 'ff382fcc', element: '隐藏数据表', description: '那张 sr-only 表格列的是连接——从哪、到哪、值多少——而不是节点，因为一张节点合计表会丢掉这张图存在的全部理由：每一条“从哪到哪”。' },
    ],
    practices: [
      ['29631a17', '把 nodes 数组当成一张地址表。一条连接的 source 和 target 是它的索引，所以在最前面插入一个节点，会不声不响地把每一条连接重新指向另一对节点——而且布局照样渲染得出来，所以这件事该由测试来盯，不是靠眼睛。'],
      ['735312bc', '组合 <SankeyChart.Node>，并在它里面放一个 <SankeyChart.NodeLabel>。名字要自己选择加上，而且没有图例可退，所以一张没有标签的桑基图就是一堆匿名的灰带子。'],
      ['88e7a57a', '让各条流守恒，否则就给差额单独一个有名字的节点。带子的宽度是屏幕上唯一的算术，而一个悄悄少掉百分之八的节点，读起来就只是一个小一点的节点。'],
      ['6cc306d4', '当那个量只沿一条路径收窄时，不要用它。那是 FunnelChart 的事；桑基图会把全部布局预算花在根本不存在的分叉上。'],
      ['4c9723d6', '不要在同一列里放二十个节点。nodePadding 是 10px，布局把剩下的空间分掉，所以超过十来个，一个节点矩形就只有几像素高，居中在它上面的标签根本无处安放。'],
    ],
  },
  'scatter-chart': {
    name: '散点图',
    summary: ['7cbd463a', '两个度量互相对照，每个观测一个点。'],
    when: ['2b8bfebb', '相关性、聚类、离群点——这些问题一旦被塞进柱状图的桶里就答不出来了。这也是这里唯一一张横轴是数值而不是分类的图。'],
    accessibility: [
      ['a4da31c6', 'title 必填。表格视图是显式声明的、不是推断出来的：散点的数据挂在每条序列上，根节点上并没有一份统一的数据行可读。'],
      ['0843770e', '在这里承担别处由色相承担的工作的是形状。两团重叠的点，用圆形对十字形去分远比用两级灰阶好认——而且形状在叠印时仍然成立，灰阶不行。'],
      ['99db8422', '实心点自带一圈页面色描边，所以两个落在同一位置的观测仍然数得清。'],
      ['a68544a1', 'ZAxis 把它的度量映射到点的面积、不是半径：半径翻倍会让墨量变成四倍，这是气泡图最常见的说谎方式。'],
    ],
    anatomy: [
      { hash: '77d72fbf', element: '图框', description: 'ChartFigure 的那个 <figure>，带 isLoading 和一个空状态。是否为空是从显式声明的表格行里读出来的，理由和这张表格之所以要显式声明是同一个：观测挂在每个 <Scatter> 上，根节点看不到它们。' },
      { hash: '24c647da', element: '数值坐标轴', description: '<ScatterChart.XAxis> 和 <ScatterChart.YAxis>，默认都是 type="number"。这是本组唯一一张横轴是一个度量、而不是一个分类的图。' },
      { hash: '3e1c817e', element: '点云', description: '<ScatterChart.Scatter>，一条序列一团，每一团都带着自己的 data 数组，而不是去读根节点的。六种标记形状，而实心标记会加一圈 1px 的 --chart-surface 描边，这样两个落在同一位置的观测仍然数得清。' },
      { hash: 'b8332900', element: '尺寸通道', description: '<ScatterChart.ZAxis>，range 默认是 [40, 400]。这个范围说的是面积、不是半径：半径翻倍会让墨量变成四倍，这就是气泡图通常说谎的方式。' },
      { hash: '1b670f37', element: '十字光标', description: 'tooltip 的光标，是两条线而不是一条带。一个散点由两个坐标确定位置，而单独一条竖直光标只回答了其中一半。' },
      { hash: '75ffd5b1', element: '显式声明的表格', description: '在这里 table 是一个属性，不是推断出来的。散点的数据挂在每条序列上，所以根节点上没有可读的数据行——什么都不传，交付的就是一张完全没有表格的图。' },
    ],
    practices: [
      ['739407ec', '要显式声明 table。这是本组唯一一张隐藏表格没法推导出来的图，所以漏掉它是静默失败：图渲染出来了，也有名字，背后却没有数字。'],
      ['01b35357', '区分序列，先靠形状。两级灰阶失效的地方，圆形对十字形仍然认得出来，而且形状在叠印和强制颜色下都成立——在强制颜色下，每一个 --series-* 令牌都会变成 CanvasText，一级明度差就没了。'],
      ['c9074051', '点云密集时，用 variant="outline" 或 shape="ring"。空心标记能露出它底下的东西；实心标记在两千个点的时候，画出来的只是最密处的一个剪影，别的什么都没有。'],
      ['ea2cb63e', '不要用序列之间 size 的差别去表达什么。size 是一个以像素计的固定半径，所以它什么都没编码，看上去却完全像在编码；把一个值映射到标记面积的路径只有 <ScatterChart.ZAxis> 一条。'],
      ['e4d1d0a2', '超过三条序列，形状就分不开它们了——圆形、十字和三角是分得清的，第四个图形是菱形，大多数读者看到的就是一个转过来的正方形。答案是共用坐标轴的小型多图，不是第四种标记。'],
    ],
  },
  'funnel-chart': {
    name: '漏斗图',
    summary: ['7e9cac82', '只会越来越窄的若干阶段。'],
    when: ['a00238c7', '注册流程、招聘管线、结账流程。当流量会分叉而不只是收窄时，那是 SankeyChart——漏斗从构造上只有一条路径。'],
    accessibility: [
      ['0af3901b', 'title 必填；各阶段同样会渲染成一份视觉隐藏的表格。'],
      ['d9e0163e', '收窄编码的是相邻两阶段之间的比例，而眼睛读的是围出来的面积，所以漏斗会放大一次平缓的下滑。组合一个 Label 把数字印上去——那就是补救。'],
      ['07c87aed', '默认样式让每个阶段共用同一种填充、把落差交给形状去说。再让每个阶段依次加深，等于把同一个事实编码两遍。'],
    ],
    anatomy: [
      { hash: 'b8cc49c1', element: '图框', description: 'ChartFigure 的那个 <figure>，零个阶段时带一个空状态。加载骨架仍然没有，所以那个状态还是归调用处做。' },
      { hash: '73883cd9', element: '阶段', description: '<FunnelChart.Funnel>。数据行按给定的顺序绘制，从不排序；每个阶段和下一个之间隔开的，是一道 gap 像素宽的 --chart-surface 描边，而不是一段透明间隙，所以各阶段仍然是相接的。' },
      { hash: 'd0383e3d', element: '阶段标签', description: '<FunnelChart.Label>，默认放在右侧。它的 dataKey 默认取的是名称字段，不是值——要印出数字，得自己把它指向 value 键。' },
      { hash: '9932504e', element: '提示气泡', description: '<FunnelChart.Tooltip>，标题栏被压掉，光标也关着。这里没有一根能让十字线跑起来的坐标轴。' },
      { hash: 'dc2a43d1', element: '隐藏数据表', description: '那张 sr-only 表格，一个阶段一行。它是这种图形提供的唯一精确读数，因为漏斗身上任何地方都没有坐标轴、也没有刻度。' },
    ],
    practices: [
      ['56134e75', '把 <FunnelChart.Label> 指向值字段。不给 dataKey，它印的是阶段名称，而那读者本来就有了；数字——恰恰是收窄这个形状读不出来的那一样东西——反倒没印出来。'],
      ['0119bb39', '数据行要自己按从宽到窄排好。组件按拿到的顺序画，不排序，所以一个放错位置的阶段会画出一个变宽的漏斗，读者会把它读成数据出错了。'],
      ['fddc473a', '除非各阶段本身还是一串不同的类别，否则就保持 variant="stepped"。ramp 会逐个阶段走一遍序列梯度，等于在收窄已经说过一遍之后，把落差再编码一次。'],
      ['80f03d8b', '不要用它来画会分叉的流。漏斗从构造上就只有一条路径；一个阶段分成两种结果的地方，老实的形式是 SankeyChart，它两条分支都画得出来。'],
      ['e6e0b437', '不要从形状上读流失。收窄编码的是相邻两阶段之间的比例，而眼睛读的是围出来的面积，所以平缓的下滑被放大、陡峭的被压平，而且哪儿都没有一根坐标轴可以对照。'],
    ],
  },
  'treemap-chart': {
    name: '矩形树图',
    summary: ['3670f2fa', '整体的组成部分——当部分多到饼图撑不住、而且还会嵌套时。'],
    when: ['98cd46c8', '饼图在六项时就已经失效，矩形树图在五十项时还读得动。项目少于十几个、而且要读排名时，柱状图的长度是更精确的编码。'],
    accessibility: [
      ['406d2e7a', 'title 必填。表格视图列的是叶子以及命名它的路径：一棵嵌套的树被逐行念出来，没人跟得上。'],
      ['9cf8fd16', '编码用的是面积，所以数据必须非负，而且加总起来要是读者认得出的那个“整体”。'],
      ['03853a07', '色块之间的缝隙是一道页面色描边、而不是把矩形画小——各部分不再相接的树图，就不再读作对一个整体的划分了。'],
    ],
    anatomy: [
      { hash: 'eeace681', element: '图框', description: 'ChartFigure 的那个 <figure>，由 title 命名，包着一个 ChartContainer。' },
      { hash: 'd9f02fc5', element: '色块', description: '根节点自己的色块渲染器。色块之间的缝隙是一道 2px 的 --chart-surface 描边，而不是把矩形画小，所以这些块仍然铺满整片——各部分不再相接的树图，就不再读作对一个整体的划分了。' },
      { hash: '4276392a', element: '色块标签', description: 'showLabels，默认打开，但只有宽于 56px、且高于 26px 的色块才会带标签。小于这个尺寸，名字是被丢掉、而不是被裁掉，所以长尾没有标签是设计使然。' },
      { hash: '66ba3066', element: '提示气泡', description: '<TreemapChart.Tooltip>，以色块名称为键。它在这里干的活比在别处更重：一个小到装不下自己标签的色块，只有靠它才叫得出名字。' },
      { hash: 'e78f8f97', element: '隐藏数据表', description: '那张 sr-only 表格列的是叶子，每一片都带着命名它的那条路径。一棵嵌套的树被逐行念出来没人跟得上，所以层级被压平进了行表头里。' },
      { hash: '14f74ae6', element: '上色', description: 'variant="ramp" 按色块索引在 --series-1 到 --series-8 之间走；variant="nested" 改按深度走，而一旦问题变成“什么装在什么里面”，后者才是对的编码。' },
    ],
    practices: [
      ['bbdd124d', '喂给它非负的值，而且加总起来要是读者认得出的那个整体。编码用的是面积，面积不可能为负，而一片取值为零或更低的叶子会被排成零宽度、从图里消失——隐藏表格会把它印成「未绘制」，而不是让两个视图对一共有多少片叶子各执一词。'],
      ['9fd94fc7', '只要存在长尾，就组合 <TreemapChart.Tooltip>。小于 56 乘 26 像素的块根本不带标签，而在一张五十项的树图上，那是其中的大多数。'],
      ['9a33f32e', '树一旦有了第二层，就换成 variant="nested"。ramp 是按色块索引取填充的，所以它只把同级的块分开，关于深度什么都没说。'],
      ['4888fe65', '不要把这套梯度当成图例来读。槽位是索引对 8 取模，所以第一块和第九块上的色一模一样——这里的填充是为了区分，不是身份，而且读者要是反过来理解了，图上没有任何东西会纠正他。'],
      ['ae6997fd', '不要用它来给十来个项目排名。柱子的长度比矩形的面积读得精确得多，而且 squarify 布局刻意不只按值排列色块，所以读者连按顺序扫一遍都做不到。'],
    ],
  },
  // ─── The statistical family, and small multiples ───
  'box-plot': {
    name: '箱线图',
    summary: ['92d25514', '一个度量在各个分类上的分布范围。'],
    when: ['893aa60b', '「这东西波动有多大」，而且要一次看六个。要看单个分布的形状，用 Histogram；观测点少到能全画出来，用 ScatterChart。'],
    accessibility: [
      ['b0b661ef', '一个箱子就是五个数，而五个数分不出一个峰和两个峰。双峰分布画出来的箱子，和一个中心相同的光滑分布一模一样——组件把这一点写进了自己的说明里，而不是塞在脚注里。'],
      ['bf5b329a', '它同样隐藏样本量：六个点画出来的箱子和六千个点画出来的一样。所以 count 值得带上，而在比较中位数时一定要打开 notched。'],
      ['33b35374', '原始数值用 Tukey 栅栏归纳，这件事写在页面上而不是默认读者知道——换一套栅栏规则，同一份数据会画出不同的离群点。'],
      ['dbaf4a80', '隐藏的表格视图带着每个分类完整的五个数，所以不看图形也读得懂这张图。'],
    ],
    anatomy: [
      { hash: 'd02ea97d', element: '图框', description: 'ChartFigure 的那个 <figure>，当没有分类能通过解析时会给出空状态。empty={false} 则保留坐标轴，留给那种“空本身就是结论”的图。' },
      { hash: 'f74f3b8e', element: '箱子', description: '<BoxPlot.Boxes>：一个分类一根从最小值跨到最大值的区间条，完全不上色，图形画在它上面。Recharts 提供分类带和刻度；箱体、中位数横线、须线和离群点都是这个包自己画的。' },
      { hash: '692f64f2', element: '值轴', description: '<BoxPlot.YAxis>，而且它刻意不锚在零上——箱线图比较的是分布，为了在柱长上老实而把取值域拉到零，只会把每个箱子压成同一条像素带。它该讲的那份老实，是一根带标签的坐标轴，而它有。' },
      { hash: '36476890', element: '凹口', description: 'notch 在中位数处把箱体收进去，收进的量是 1.58 倍 IQR 除以 n 的平方根——一个画在它所属形状内部的置信区间。它要求每个箱子都有 count；没有 count 的箱子画出来是方的，而且对此只字不提。' },
      { hash: '4d9f9407', element: '离群点', description: 'showOutliers，默认打开。超出 Tukey 的 1.5 倍 IQR 栅栏的点，一个点画一个，而须线随后停在栅栏之内最极端的那个观测上、而不是停在栅栏本身，所以没有哪根须线会声称一个数据里并不存在的读数。' },
      { hash: 'da741bc0', element: '隐藏数据表', description: '那张 sr-only 表格带着每个分类完整的五个数，外加离群点的个数，所以不看图形也完全读得懂这张图。' },
    ],
    practices: [
      ['7aedd75f', '每个箱子都要带上 count。六个观测画出来的箱子和六千个观测画出来的一模一样，而 count 也是凹口要读的东西——没有它，notch 会被接受，然后悄无声息地什么都不做。'],
      ['5037451e', '预先算好的汇总，要说明它是哪一套分位数规则算出来的。这个组件在汇总原始数值时用的是 R type 7，在 [1, 2, 3, 4] 上它把下四分位数放在 1.75，而“取下半部分中位数”那套规则放在 1.5——同一份数据在两套规则下就是两张不同的图。'],
      ['80c012fb', '手上有原始数值时，就把原始数值交给它，别给汇总。一趟下来它会套上 Tukey 栅栏、把离群点分出去、并把 count 填好，所以那五个数和那些点不会各走各的。'],
      ['9abaed28', '一个箱子分不出一个峰和两个峰。一条同时含着缓存路径和数据库路径的延迟序列，画出来的箱子和一个中心相同的光滑分布画出来的一模一样，而那个箱子的正中间，是一个几乎没有任何取值落在上面的数。形状才是问题时，那是 Histogram。'],
      ['286f56a5', 'values 数组为空的分类会被直接丢掉——没有箱子，没有刻度，也没有表格行——因为汇总它得不到任何可画的东西。要了七个箱子，图上渲染出六个，而对第七个只字不提。'],
      ['f5762239', '一个观测画出来的是一个没有箱子的箱子：q1、中位数和 q3 是同一个数，IQR 为零，整个图形塌成一根横线。它不是错误，也不是一个分布，所以要在调用处挡掉。'],
    ],
  },
  histogram: {
    name: '直方图',
    summary: ['2f8267e6', '一个分布长什么形状。'],
    when: ['5fe7529d', '要弄懂一个分布——两个聚集、一道硬底、在超时值上堆成一摞。几个分布要并排比较，那是 BoxPlot 的活。'],
    accessibility: [
      ['80a9463b', '形状是分箱宽度的属性，不只是数据的属性：同一批数切成 8 个桶和切成 80 个桶，是两张不同的图。画出这张图的规则——默认 Freedman–Diaconis——写在页面上。'],
      ['243a6d1d', '横轴是数值轴，每根柱子由它自己的两条边画出来，所以宽度不均的桶就是它真实的宽度，而不会被压成和邻居一样的等宽槽位。'],
      ['6db7c03f', 'mode="density" 修的正是不等宽分箱制造的陷阱：在 frequency 下，同样的底层密度，宽一倍的桶会高一倍。'],
      ['dcc4eb83', '隐藏的表格视图印出每个桶的两条边和它的计数——这是一张分箱图唯一能给出的精确读数。'],
    ],
    anatomy: [
      { hash: '1ee4761c', element: '图框', description: 'ChartFigure 的那个 <figure>，当分箱之后没有桶留下时会给出空状态——零个有限观测得到的就是这个结果。' },
      { hash: 'fe721dcc', element: '柱子', description: '<Histogram.Bars>，每根都由它所属那个桶自己的两条边画出来，而不是塞进一个等宽的分类槽位，所以宽度不均的桶才能是它真实的宽度。radius 默认是 0，和 BarChart 不同：一个圆角会在两个本该相接的桶之间画出一道缝。' },
      { hash: 'f16b93e9', element: '度量轴', description: '<Histogram.XAxis>，数值轴，从第一个桶的下边界一直走到最后一个桶的上边界。' },
      { hash: '2896aaec', element: '计数轴', description: '<Histogram.YAxis>。在 mode="frequency" 下它是计数；在 mode="density" 下它是计数除以 n 再除以宽度，此时所有柱子围出的面积为 1。' },
      { hash: '05d4ff7d', element: '分箱规则', description: '它不是屏幕上的任何一个标记，却是这张图里后果最重的部分：bins 接受一个桶数、或者明确的边界，默认是 Freedman-Diaconis 并封顶在 200 个桶，四分位距为零时退回 Sturges。明确给出的边界同时也是一个范围——落在第一条和最后一条边界之外的观测没有桶可归，它会被计进 tooltip 的占比、以及表格里的 Below 或 Above 行，而不是被丢掉。' },
      { hash: '5af637c4', element: '隐藏数据表', description: '那张 sr-only 表格把每个桶的两条边印成行表头，计数印在旁边——这是一张分箱图能给出的唯一精确读数，因为每根柱子代表的是一个区间、而不是一个值。落在明确边界之外的观测有自己的 Below 行和 Above 行，因为它们在任何地方都没有柱子。' },
    ],
    practices: [
      ['5091b859', '把分箱规则写在页面上。同一批数切成 8 个桶和切成 80 个桶，是两张不同的图，而两个峰之间的那道谷，挪动一条边界就能造出来、也能抹掉——所以在相信一个特征之前，多看几种宽度。'],
      ['41ff0778', '只要桶宽不均，就设 mode="density"。在 frequency 下，同样的底层密度，宽一倍的桶会高一倍，而从指标后端拿来的、预先计数好的桶，正是一头栽进这个陷阱里的。'],
      ['2a6a54ef', 'values 和 data 给一个，绝不要两个都给。两个都来时 data 胜出，于是 values 数组既没有被谁分箱、也没有被谁画出来，而且任何地方都没有警告。'],
      ['0d5c6e29', '不要把 tooltip 里的占比读成在各根柱子里的占比。它是在样本里的占比，所以一组桶加起来是 96%，说的是另外那 4% 落到了你自己给的边界之外——而这恰恰是一个按画出来的桶去算的占比永远给不出的读数，因为那种算法总是加到 100。'],
      ['e8c4e36c', '不要用它来比较多个分布。两张直方图叠在一起会互相遮挡，六张并排又放不下；那是 BoxPlot 的事，它每个分布只花十分之一的墨。'],
      ['98542104', '不要以为自动规则保住了你要的分辨率。Freedman-Diaconis 是拿四分位距去除的，所以一个中间很紧、尾巴很长的分布，会要求画出几万根不到一个像素宽的柱子——200 个桶的封顶把它变成一张粗糙的直方图，而不是一个卡死的标签页，而一张粗糙的直方图是另一张图。'],
      ['b59ea01b', '不要把只有一个取值的分布读成一个形状。所有观测都落在同一个数上时它照样画得出来：两条边界变成那个值加减二分之一，结果是一根老实的柱子，而它不是一个分布。'],
    ],
  },
  'waterfall-chart': {
    name: '瀑布图',
    summary: ['50d62b4a', '一个总数是怎么从一个数走到另一个数的。'],
    when: ['063885f1', '「为什么变了」，而且贡献项可以是负的。饼图放不下负的扇形；各部分不必刚好补齐两个总数之间的差额时，用 BarChart。'],
    accessibility: [
      ['094bed3e', '连接线是要小心对待的那个断言：它把各步画成一个序列，可绝大多数拆解根本不是序列——同一个月里的流失和扩张是同时发生的，而读者会把最左边那根柱子当成第一个原因。顺序是任意的时候，在 description 里说出来。'],
      ['85cb9465', '中间那些柱子是悬空的长度，没有基线可读，所以级联上方一个小的变动很难和接近零处一个大的变动作比较。只有 total 柱坐在坐标轴上，也只有它们能被绝对地读出来。'],
      ['06a82eb0', '方向由标签的正负号和柱子的纹理承担，不只靠位置——所以在灰度和强制颜色下这个读法仍然成立。'],
      ['91f13b2b', '不给 value 的收尾柱由各个增减量算出来，把这道算术留在数据里，而不是留在调用者脑子里。'],
    ],
    anatomy: [
      { hash: '0fc313d2', element: '图框', description: 'ChartFigure 的那个 <figure>，零个步骤时给出空状态。关于顺序的那句告诫该写进 description，而它在设置 showTitle 之前是 sr-only 的。' },
      { hash: '2e54628f', element: '步骤', description: '<WaterfallChart.Bars>：一个步骤一根悬空的区间条，从上一个合计走到新的合计，上面盖着一个自定义 shape。增量和合计取实心的序列填充，减量取 45 度的斜纹，所以方向在灰度和强制颜色下仍然成立。' },
      { hash: '00f80b78', element: '连接线', description: 'connectors，默认打开，把每根柱子的收尾边和下一根的起点连起来。没有它们，瀑布图就是一排悬在互不相干的高度上的柱子，读者得自己把这道级联重建出来。' },
      { hash: 'a01e9275', element: '零基线', description: '一条零处的参考线，由 <WaterfallChart.Bars> 自己画。合计柱就站在它上面，而一张看不见零的瀑布图，是在要求读者对每一根悬空的柱子照单全信。' },
      { hash: '512047fe', element: '步骤标签', description: 'showValues，而且它默认是关的。它把每一步带正负号的变化量印在柱子旁边——这在别处都不如在这里值钱，因为中间的柱子底下没有基线，而它的长度恰恰是坐标轴还不回来的那一样东西。' },
      { hash: '00fa37ee', element: '隐藏数据表', description: '那张 sr-only 表格带着每一步的变化量和累计值，正好就是图里编码成一个长度和一个位置的那一对。' },
    ],
    practices: [
      ['11596940', '把 showValues 打开。它默认是关的，而它正是这种图形核心弱点的解药：中间的柱子是悬空的，所以读者看得出某一步很小，却看不出小到什么程度。'],
      ['cb8d6299', '收尾的合计那一步不要写 value。省略掉，它就由上面各个增减量算出来；手写上去，它就可能和那些量对不上，而图会一声不吭地把这个矛盾画出来。'],
      ['f7360c79', '步骤顺序是人为编排的时候，在 description 里说出来，并且传 showTitle，让这句话真的被印出来。连接线把各步画成一个序列，可绝大多数拆解并不是序列——同一个月里的流失和扩张是同时发生的——而读者会把最左边那根柱子当成第一个原因。'],
      ['d38e382b', '不要把两个方向相反的变动轧成一个步骤。一根读作负二十、实际上是正一百八十对负两百的柱子，画出来和一个风平浪静的月份一模一样，而把“动了什么”显示出来正是这种图形存在的全部目的。'],
      ['b21d138b', '不要用眼睛去比中间的柱子和合计柱。只有合计坐在零线上；它们之间的一切都是悬在任意高度上的一段长度，所以级联上方一个小的步骤和接近零处一个大的步骤，根本不站在可比的基准上。'],
      ['9c6430da', '贡献项带正负号时，不要去用饼图。这种图形之所以存在，就是因为饼图放不下一块负的扇形——而当各部分不必刚好补齐两个合计之间的差额时，对的那个是 BarChart。'],
    ],
  },
  facet: {
    name: '小型多图',
    summary: ['eaac85c5', '同一张图按分组各画一遍，共用同一把尺。'],
    when: ['ff9947dc', '八条序列挤在一个画框里会变成一团乱麻。真的需要逐点比较的两三条序列，还是该待在同一张图里。'],
    accessibility: [
      ['31876044', '共享取值域是默认，也是这件事的全部意义：各自独立取刻度的话，峰值 40 的一组和峰值 4,000 的一组会画出同样的形状，读者要来做的那个比较不只是丢了，是被反转了。'],
      ['0349c11e', '每一格都是一个有自己可访问名称的 figure，所以读屏软件走过的是八张各有其名的图，而不是一整块没有名字的网格。'],
      ['37eb24c8', '超过 max 的格子会折进一条明说的 overflow 里，而不是被丢掉，而且数量会印出来——一个悄悄少了四组的网格，读者是察觉不到的。'],
      ['1f0139ee', '格子的顺序由调用处通过 sort 明确选定，因为读者会把阅读顺序当成排名。'],
    ],
    anatomy: [
      { hash: 'c43e051a', element: '图框', description: 'ChartFigure 的那个 <figure>，包住整个网格，由 title 命名。和单张图表不同，它的空状态没有 false 这个后门：一对空坐标轴好歹还是一张图，而一个空网格什么都不是。' },
      { hash: 'd47ac1eb', element: '格子网格', description: '一个 role="list"，里面是排在 CSS auto-fit 轨道上的 <li> 格子。list-none 会在 Safari 里把 list 角色抹掉，所以这里手动把它设了回来——一个由十二张图组成、却不播报十二个条目的网格，等于拿走了读者判断还要走多远的唯一线索。' },
      { hash: 'b83ce2ac', element: '格子名称', description: '每张图上方的一个 <p>。showPanelNames={false} 是把它变成 sr-only，而不是移除它，因为一个读屏软件分不出各个格子的网格，就是一张里面装着十二块匿名绘图区的图。' },
      { hash: '35ceaf89', element: '共享取值域', description: 'panel.domain，在通过上限筛选后剩下的格子上算出来，然后交给渲染函数。它不会替你应用：一个没有把它传给自己值轴的格子，等于又选回了各自独立的刻度。' },
      { hash: '92069c32', element: '网格级图例与轴标签', description: 'legend、yLabel 和 xLabel，在网格上下各印一次。每个格子里都放一个图例，就是同样三块色标重复十二遍，把读者从第一个那里已经学到的东西再讲一遍。' },
      { hash: 'c3dbe3a5', element: '溢出说明', description: '被截断的网格下面那一行，说明有多少个分组被留下没画、或者被折了进去。limit 默认是 12，任何东西都不会被悄悄丢掉。' },
    ],
    practices: [
      ['b08951f9', '把 panel.domain 传给格子内图表的值轴。这个组件存在的意义就是这一行：各自独立取刻度的话，峰值 40 的一组和峰值 4,000 的一组会画出同样的形状，于是那个比较不只是丢了，是被反转了——而屏幕上没有任何东西说明这一点。'],
      ['12365d85', '每一个要画的字段都要在 value 里写出来。共享取值域正是按它算出来的，所以一个格子画了一条 value 没提到的序列，它就可能冲出自己的坐标轴，而网格其余部分看上去还一切正常。'],
      ['651bfb6a', '格子内的图表自带表格时，设上 hideDataTable。这个包里每一张图都会把自己的数据行渲染成一张 sr-only 表格，否则一个十二格的网格会往无障碍树里塞进十三张表。'],
      ['b1129658', '供读者扫读的网格保持 sort="max"，供他们按名字查的换成 "name"。读者会把阅读顺序当成排名，所以无论选哪一个，这都是一次决定。'],
      ['4b6b9dc0', 'overflow="fold" 不是白来的。折起来的那个格子是长尾在每个分类上的合计，而且它的统计量会进入共享取值域，所以把二十八个小分组折起来，可能造出一个高耸的格子，把读者真正要看的那十二个压扁。长尾是数量多而不是量大时，用 note。'],
      ['4b347804', '柱状或面积的格子下面，不要把 includeZero 关掉。它默认打开，理由和柱状轴锚在零上是同一个——对着一条被截断的基线去读长度，会把每一处差异都夸大，而网格存在的意义就是让这些差异被拿来比较。'],
      ['18905b99', '只有两三条序列时不要用它。分面换回了每条序列各自的形状，代价是失去了直接的叠加，而交叉点、缺口和在同一个总量里的占比，恰恰是叠加原本要回答的。'],
    ],
  },
}
