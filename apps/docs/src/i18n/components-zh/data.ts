/**
 * The Data group of the Chinese catalogue — 数据 — and nothing else.
 *
 * `content.ts` is still the module every consumer imports. It keeps
 * `ComponentCopyZh`, the foundations, the page copy and the lookups, and
 * assembles `COMPONENTS_ZH` by spreading these ten files in `GROUPS_ZH`
 * order. Nothing imports this one directly.
 *
 * A group is the unit for the same reason it is in the package's own
 * `agent/catalog/data.mjs`, which this file mirrors slug for slug and in the
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

export const DATA_ZH: Record<string, ComponentCopyZh> = {
  table: {
    name: '表格',
    summary: ['1c9ab633', '一张数据表——对齐、排序、边框都可以按列配置。'],
    when: ['46d8945d', '对齐按列设置，数字靠尾边，这样每一位才能对齐。排序按列开启：每个表头都是按钮，等于在邀请读者去排一个数据本来就排不了的列。'],
    accessibility: [
      ['41ec2803', 'caption 必填：一个页面上三张表，其中没有名字的那张是没法导航的。'],
      ['d6807926', '列标题是 <th scope="col">，所以一个单元格能被追溯回它的表头。'],
      ['09e8339c', '可排序的表头是 th 里面的 button，而不是给单元格挂 onClick——带 onClick 的单元格既不可聚焦也不会被播报，那个排序就只对鼠标存在。'],
      ['6d56e186', 'aria-sort 由 sortDirection 设置，这是读屏用户得知这张表已被排序的唯一途径。'],
      ['b8353b86', '任何边框设置下都没有斑马纹：在单色系统里，一条被染色的行是又一个和页面底色抢注意力的表面。'],
      ['cb6b927b', '滚动区域是一个包含块，所以单元格里视觉隐藏的标签会留在表格内部，而不是跑出去把页面撑宽。'],
    ],
    keyboard: [['a03669f1', '走到滚动区域，以及每一个可排序的表头。'], ['31b1d0e3', '区域拿到焦点后，横向滚动表格。']],
    anatomy: [
      { hash: '0409b670', element: '滚动区域', description: '包在表格外面、可聚焦的那个 <div role="region">，名字来自 caption。边框设置和密度属性都长在它身上，横向滚动的也是它——所以越出行宽的是表格，不是页面。它同时还是定位过的，正是这一点让单元格里那个 sr-only 的标签不会相对文档去定位，把整个页面横向拖宽。' },
      { hash: 'd646608d', element: '表名', description: '一个真正的 <caption>，默认视觉隐藏，除非 showCaption 把它当眉题印在表格上方。同一个字符串也是滚动区域的可访问名称，所以进去时听到一次，从表格那边再听到一次。' },
      { hash: '5b5e1e7c', element: '列标题', description: 'TH——等宽大写，所以它永远不会被读成数据；对齐按列设置；除非调用处覆盖，否则一律输出 scope="col"。' },
      { hash: 'dfd40ed0', element: '排序控件', description: '只出现在可排序的表头上：th 里面的一个 <button>，标签旁边是 ArrowUp、ArrowDown 或者一个压暗的 ChevronsUpDown，th 上的 aria-sort 由 sortDirection 设置。' },
      { hash: '012f7154', element: '单元格', description: 'TD——顶对齐、--ink-2，和表头共用 --table-pad-x，所以列能对齐；行高来自 --table-pad-y，density 会把它从 14px 减半到 8px。' },
    ],
    practices: [
      ['c6c4a84b', '用 stickyHeader 就要从外面把高度框住：className 和其余每一个属性都落在 <table> 上，不是落在外面那个滚动的 div 上，所以只有一个真会施加约束的父容器——一列有高度的 flex——才能给那个 div 一个可粘的范围。普通包装元素上的 max-height 做不到，表头只会跟着页面一起走。'],
      ['e218d291', '行首那个单元格要传 scope="row"——TH 先写 scope="col"，你的属性是在这之后展开的，所以覆盖得上；不传的话，每个行头都在声称自己领着一列，顺着单元格回溯就会走到错的标签上。'],
      ['91a125d7', '排序换列时，其他列要重置成 sortDirection="none"：每个表头各带各的 aria-sort，没有任何东西在协调它们，所以一张表可能同时播报两列都已排序。'],
      ['04e94a3e', 'TD 要和它的 TH 用同一个 align——对齐是按单元格设的，不会沿着列继承下来，而贴尾边的数字配上贴首边的标签，就是一列数字和自己的表头对不齐。'],
      ['c5521079', 'aria-sort 是在读者走到表头时才告诉他这张表是怎么排的；按下按钮那一刻它什么都不播报。一张在读屏用户眼皮底下重排的表，必须在读者当下所在的位置把这件事说出来，否则就是每一行都悄悄换了、而没有一句交代。'],
      ['62803432', '不要指望它在手机上重排：没有任何东西会堆叠，区域是在一条细线滚动条后面横向滚动，而折线之外的列，只有想明白它会滚的读者才够得到。375px 上的八列要的是另一种呈现方式，不是更小的字号。'],
    ],
  },
  heatmap: {
    name: '热力图',
    summary: ['aff1fc4a', '一格一格按轻重去读的值。'],
    when: ['1deac6b9', '活跃度日历、混淆矩阵、按小时与星期分布的负载。这是单色系统反而比彩色系统渲染得更好的那一种图。'],
    accessibility: [
      ['d0ec03d5', '是真正的 <table>，不是 SVG：读屏软件走的结构就是眼睛读的结构，每个格子都会念出自己的行、列和值。'],
      ['5c383bb5', '明度是唯一一个顺序毫无歧义的通道——这正是别处那句“单一色相，由浅到深”的来历。而在这里，根本没有色相可以搞错。'],
      ['ddf334e0', 'null 画成一圈虚线轮廓，绝不画成最浅的那一格——缺测不是零。'],
      ['bed26292', '两张网格要对照时一定要固定 domain：各自独立取域的两张图长得一样、含义却不同，这是共享图例也补不了的错。'],
    ],
    anatomy: [
      { hash: '723808f1', element: '图题', description: 'figcaption 里的 title，默认看不见，除非 showTitle 把它印在网格上方、description 跟在它下面。同一个字符串也是表格自己那个 sr-only 的 caption，所以进去时网格被命名一次，从表格那边再被命名一次。' },
      { hash: 'd5e09836', element: '列表头', description: 'columns 里每一项一个 th scope="col"，顺序照给的来；前面还有一个 sr-only 的角落单元格写着「Row」，好让表头这一行在行标签上方也有东西站着。' },
      { hash: '13ea8a6f', element: '行表头', description: 'rows 里每一项一个 th scope="row"——贴尾边的等宽字、--chart-axis，所以每个格子都能回溯到给它命名的那一对标签。' },
      { hash: 'ae7ac813', element: '格子', description: '一个 td，背景是按值在 domain 中的位置，把 --series-1 用 color-mix 混进 --chart-surface。是连续的而不是分档的，因为把一条渐变切成段，等于凭空造出数据里没有的边界；而格子之间 2px 的 border-spacing，正是让相邻两个轻重可以被数出来的东西。' },
      { hash: '80e5304f', element: '缺测的格子', description: 'null 画出来的东西——cells 里找不到的那一对行列也画成这个：页面底上一圈 --rule 的虚线轮廓，播报的是“无数据”而不是一个数字。' },
      { hash: '57e5da08', element: '印出来的数值', description: '格子里的 formatValue。开了 showValues 就看得见，否则是 sr-only；在强制颜色下它又被重新露出来，因为那时候承担编码的那层色已经被改掉了。' },
    ],
    practices: [
      ['b17e92ad', '值一旦跨过零，scale 就要换成 diverging。sequential 是按值在 domain 里的位置取渐变，所以在一张变化量的网格上，跌得最狠的那格最浅、涨得最多的那格最深；diverging 取的是离中点的距离，这才是一个增减量真正想要的读法。'],
      ['141b6da6', '有一个格子比其余高出一个数量级时，要固定 domain。推导出来的 domain 从零起——最低值为负时就从最低值起——到最高值，所以一堆 5 到 40 的读数里混进一个 10,000，其余每一格都被压进渐变的前百分之零点五，四十个各不相同的数字最后画成空网格上的一个深色方块。'],
      ['31f36b03', '格子的 row 和 column 要和 rows、columns 里写的一字不差：cells 是按这一对去查的，所以对不上的那一条什么都画不出来。它的数值却照样算进推导出来的 domain——一个拼错的字，就是这样用一个网格上根本看不到的值把整条渐变拉长的。'],
      ['2c4e8c87', '打开 showValues 就要清楚自己在拿什么换对比度。那层色被压在整条渐变的 35% 以内，好让同一种墨色在每一个格子上都过 4.5:1——格子之间的顺序原封不动，彼此的差距被压窄，而细节改由印出来的数字承担。'],
      ['94b1de3d', '不要让管线在网格看到之前先拿零把空缺填上。null 画成虚线轮廓、播报为无数据，零画成整条渐变里最浅的那一格——拿一个顶替另一个，就是把一次故障变成了一个清闲的小时，而网格上没有任何东西说得清到底是哪一种。'],
      ['75cf0010', '不要指望读者能从深浅里还原出一个数。这里没有图例也没有分档：轻重只给格子排序，从不说出任何一个值。强制颜色下的兜底会把数字露出来，是因为那里的背景已经不存在了——那是给一块被改掉的底色做的补救，不是那种确切数字要紧的网格上 showValues 的替代品。'],
    ],
  },
  sparkline: {
    name: '迷你折线',
    summary: ['2d45b291', '一个词那么大的一串数字。'],
    when: ['8ca38a94', '表格单元格里、数字旁边、一行的末尾。要精确读趋势时，它需要的是 LineChart 和属于自己的空间。'],
    accessibility: [
      ['f88c9388', 'label 必填，而且它就是全部的可访问名称：迷你折线没有坐标轴也没有图例，再没有别的东西描述它。'],
      ['76434009', '刻意不画坐标轴。任何能让它回答“到底是多少”的装饰，同时也会让它大到没法内嵌——而内嵌正是选它的唯一理由。'],
      ['3dcd5e62', '一列迷你折线一定要固定 domain：各自独立取域的话，每一行的波峰波谷看起来都一模一样，表格就开始主动误导人了。'],
      ['3b3a3be7', '一条 path，不需要渲染引擎——所以在表格里放一百个也不花什么代价。'],
    ],
    anatomy: [
      { hash: '8dac743b', element: '内嵌的一行', description: '一个 inline-flex 的 span，占满宽度、8px 间隙，所以这串数字能待在表格单元格里或者一个数字旁边，而不把所在的那一行撑断。' },
      { hash: '9a545e16', element: '图形', description: '一个 svg role="img"，viewBox 是 0–100 乘 0–100，preserveAspectRatio="none"，所以容器给多宽它就拉多宽。height 默认 28px，是唯一固定的尺寸。' },
      { hash: 'd934ac2f', element: '线形', description: '那条 path、它的面积填充，或者那些柱子——由 variant 三选一。描边用的是 non-scaling-stroke，正是这一点让盒子被拉伸之后，窄单元格和宽单元格里的线一样粗。' },
      { hash: '12512d08', element: '最后一个点', description: 'showLast 在最后一个读数上画的一个 2px 的点，只在 line 和 area 两个变体上。bars 变体本来就用最后一根柱子交代了这串数字的末尾，不再画点。' },
      { hash: 'a6c5804c', element: '印出来的数值', description: 'value，跟在图形后面，等宽的表格数字。它也是可访问名称里接在 label 之后的那部分，而且是这个组件唯一会印出来的数字。' },
      { hash: '2fd30a5b', element: '数据不够的状态', description: '当活下来的有限数字不足两个时，顶替整张图形的东西：label 加上「not enough data」，排成一行等宽的元信息文字。' },
    ],
    practices: [
      ['bc00ad8d', '只要一个具体数字要紧，就要传 value。图形没有坐标轴也没有刻度，它承载的只有形状；而 value 既是唯一印出来的数字，也是追加到可访问名称后面的那个读数。不传，那个名称就退回到用 toLocaleString 处理最后一个点——一个原始数字，没有单位、没有货币，也没有旁边那一行在用的舍入方式。'],
      ['79a9bd44', '任何两条会被拿来互相对照的，都要固定 domain。每一串都是按自己的最小值和最大值归一化进同一个固定的盒子，所以最高点永远贴着顶边、最低点永远贴着底：一条在 4 和 6 之间走的序列，和一条在 400 到 900 之间走的序列，画出来是同一个轮廓，而它们之间的差别哪儿都没画。'],
      ['6a1c8569', '很长的一串要先降采样再交过来。x 方向的步长是 100 除以点数减一，再摊到单元格给的那点宽度上，所以四百个读数放进一个 200px 的单元格，彼此只隔半个像素，那条 path 会糊成一条带子。'],
      ['08c442ae', '一条穿过中间的平线要读作“没有变化”，不是“压在自己的底线上”。最小值等于最大值的序列，刻度是没有宽度的，所以上面没有哪个位置比别的位置更真，每个点都落在正中——这和 Heatmap、BulletChart 对一个零跨度给出的答案是同一个，也正是这个答案，让一列迷你折线里的“没有变化”和“钉死在最差处”分得开。'],
      ['25a8e245', '不要以为总会渲染出一个图形状的东西。非有限的数值先被过滤掉，剩下不足两个点就返回一行文字而不是 SVG，所以新账号那一行会是一句话，而这一列里其他每一行都是图。'],
    ],
  },
  'bar-list': {
    name: '排行榜',
    summary: ['8caddf7f', '一个排行榜——条形在名字后面，而不是旁边。'],
    when: ['3b12d73e', '来源排行、最慢的接口、最大的客户。横向柱状图会把三分之一的宽度花在一根重复标签的坐标轴上，而这些标签本来就可以直接写在行里。'],
    accessibility: [
      ['d27e1bac', '是真正的 <table>，两列、一行一个条目——因为排行榜本来就是这个结构。条形是名字那一格的背景，所以它不会变成读屏软件还要多走一遍的第二个元素。'],
      ['b063e36b', 'limit 会把尾巴加总成一行「Other」，而不是丢掉——一个悄悄扔掉另外四十项的「前五」是在错误陈述整体，而读者根本看不出来。'],
      ['843e3f52', '两个榜要并排比较时一定要固定 max：各自独立取刻度的话，两边的第一名都会填满整条轨道，两个差得很远的数字看起来一模一样。'],
    ],
    anatomy: [
      { hash: '808fbd18', element: '表名', description: 'label，作为表格真正的 caption——默认 sr-only，除非 showLabel 把它当眉题印在这些行的上方。读屏软件那边，这个列表的名字就是它。' },
      { hash: '2ad02c4a', element: '表头行', description: '一个 sr-only 的 thead，两个 th scope="col"，Name 和 Value，所以哪怕这个列表从不显示表头，两列也都是有名字的。' },
      { hash: '23299264', element: '名称单元格', description: '一个 th scope="row"，装着截成一行的行名；item.icon 排在它前面、作为 aria-hidden 的装饰；item.href 会把这个名字本身变成链接。' },
      { hash: 'e3527441', element: '条形', description: '它不是一个元素：名称单元格内层 span 上的一道 linear-gradient，在这一行占天花板的比例处硬停。要是画成一个兄弟 div，它就成了无障碍树上又一个什么都不说的空东西。' },
      { hash: 'a837bd87', element: '数值单元格', description: '一个贴尾边的 td，等宽的表格数字、--ink-2，由 formatValue 写出来——除非调用处替掉它，否则用的就是坐标轴那套紧凑写法的默认值。' },
      { hash: 'a4b2c60c', element: 'Other 行', description: 'limit 加出来的东西：最后一行叫 Other，装着尾巴的总和，所以显示出来的这几行，仍然交代得了自己是从哪个整体里切出来的。' },
      { hash: '60396c3b', element: '空状态', description: '没有东西可排时，label 下面是一个 ChartEmpty。一个 caption 压在空的 tbody 上，在读者看来就是一个加载失败的列表，而且刷新也不会改变什么。' },
    ],
    practices: [
      ['23cb21b4', '行是随时间陆续到来的，就要固定 max。天花板是当前显示的最大那一行，所以一个新的第一名会把它下面每一根条形重新缩放——昨天填了三分之二的轨道，今天数字一点没变却只填了四分之一，而读者看到的那次变动，其实发生在另一行身上。'],
      ['de0ba63f', '要用 limit，不要在调用处自己切 items。尾巴是被加总进 Other 行、而不是被丢掉，所以显示的五行仍然凑得成整体；手工切出来的前五名会悄悄扔掉另外四十项，而列表里没有一句话说这件事。'],
      ['f9644065', '名字要短到能扛过截断。名字是被截成一行的，还要和数值列分宽度，所以两个到第四十个字符之后才有区别的接口，渲染出来是同一行、同一个省略号。'],
      ['56e30754', '顺序本身就是重点时，要传 sort={false}——一条漏斗、一组步骤、一批固定的地区。sort 默认为 true 并按降序排，等于一声不吭地把一个序列变成了一个排行。'],
      ['9b6a0e80', '条形量的是这一行比上最大那一行，从来不是占总量的比例：第一名永远填满自己的轨道，所以占全部流量 3% 的五行，和占了全部流量的五行长得一模一样。整体要紧的话，那句话该写在 caption 里。'],
      ['e597b572', '数值列里不要混着几种数字形状。它是贴尾边的等宽表格数字，只有在字符串形状一致时才能把位数对齐——而默认的格式化函数在 10,000 处切到紧凑写法，所以一个跨过这个门槛的列表会把 9,400 排在 1.2M 底下，竖着比就什么都比不成了。'],
      ['fabceb44', '两行不能同名。名字同时是这一行的标签和它的 React key，所以一个可能重复标签的查询建出来的列表会渲染出重复的 key——React 会为此告警，并且在列表一更新时就调和错。'],
    ],
  },
  'big-number': {
    name: '大数字',
    summary: ['e7d1aee5', '一个数字，用标题的字号。'],
    when: ['d194702d', '要报的就只有一个数。给单个值画图，图形本身不承载任何信息，读者还得去解码一根坐标轴，才能拿回那个本可以直接印出来的数字。'],
    accessibility: [
      ['6b0b6c0d', '变化的方向由调用处通过 intent 明说，绝不从正负号推断：「错误率降了 12%」是好消息，「收入降了 12%」不是，而组件无从判断自己手上拿的是哪一个。'],
      ['c8c4310f', '方向由箭头和文字承担，状态色是第三重信号、绝不是唯一的一重——所以这个读法在灰度、强制颜色和色盲情况下都还成立。'],
      ['f92af6b7', 'value 接收的是已经格式化好的值。这个组件不去猜单位、货币或地区格式。'],
    ],
    anatomy: [
      { hash: '98a596d8', element: '标签', description: '这个数字数的是什么，作为眉题以 --ink-3-aa 排在它上方。没有任何东西在程序上把它和数值绑起来——没有 aria-labelledby，也没有 role——所以文档顺序就是这段关联的全部。' },
      { hash: 'bada6f93', element: '数值', description: '那个数字本身，用编辑体、--fs-lead 字号、表格数字。交过来什么样就渲染什么样：不替它猜单位、货币或地区格式。' },
      { hash: '0d0a8eb4', element: '变化量', description: '数字下面那一行，来自 delta：变化量走 format——不替换的话就是一个带正负号的百分比——再加上 --ink-3-aa 的 delta.label，说明它是相对什么的变化。' },
      { hash: 'a20d2b3b', element: '方向标记', description: '在变化量里面：一个 aria-hidden 的箭头，向上、向下，为零时是平的；再加上状态色——--ok 或 --danger，还没有做出判断时是 --ink-2。两个载体，所以这个读法在灰度和强制颜色下都还成立。' },
      { hash: 'ae57e6f2', element: '判断', description: '箭头旁边那几个 sr-only 的词——升还是降，设了 intent 之后再加上更好还是更差。读屏用户拿到的就是它，用来顶替那点状态色。' },
      { hash: 'f5716b8d', element: '备注位', description: 'children，隔着一段外边距排在数字下面：Sparkline、分母或者一句提醒就放这儿。' },
    ],
    practices: [
      ['7aea04e8', '要给这个数字一个可以对照的东西。孤零零一个数是读不出来的——48,210 在放到上个月旁边之前，谈不上好也谈不上坏——而这个组件正好留了两个位置来放它：delta 放一次比较，children 放下面那条 Sparkline 或者那个分母。'],
      ['80c1ccca', 'delta.value 要按比值传。默认的格式化函数会乘一百再补上正负号，所以 0.124 印出来是 +12.4%，12.4 印出来是 +1240%。已经用百分点表示的变化量，得连着自己的 format 一起交过来。'],
      ['8223a1d6', '凡是打算上色的 delta，都要设 intent。它默认是 neutral，把变化量渲染成 --ink-2，只说明往哪个方向动了——这对一个没有人做过判断的数字是对的，但很少是写收入卡片的那个人以为自己写下的东西。'],
      ['5ce0aa05', '没有读数时，就让 value 为 null。它会用 --ink-3-aa 印一个破折号，背后跟着一句 sr-only 的「No data」——那才叫一个谁都没有的数字；而标签下面的一行空白，在读者看来就是布局坏了。emptyValue 能换掉那个破折号。'],
      ['9df459ea', '不要指望一个正好为零的 delta 还会带上 intent 的判断。没有方向可供 intent 去判，所以色调、箭头和播报出来的词都只说「no change」，到此为止——从前，“升为好”之下的一个零会被播报成「no change, worse」，而页面上根本没有显示任何判断。'],
      ['8c82b350', '不要把标签和数字分开。数值是一个 span 里的文字，不是一个被标注了名称的元素，而标签是排在它前面被读到的兄弟节点，所以一个把数字挪进单独一栏的布局——或者拿一个标签罩住两个数字——交给读屏软件的，是一个光秃秃、没有任何东西为它命名的数。'],
    ],
  },
  'bullet-chart': {
    name: '子弹图',
    summary: ['148a7c16', '一个度量、它的目标，以及说明这个数好不好的几条背景带。'],
    when: ['83763243', '一页要盯十个数的状态页。Stephen Few 设计它就是为了替掉仪表盘上的表盘——那种东西花掉整张卡片，只把一个数说得很差。'],
    accessibility: [
      ['1e9c194a', '纯 HTML + 逻辑属性写成，不需要渲染引擎，可服务端渲染，在从右到左的文档里也是对的。recharts 不在场时照样能用。'],
      ['d5a5965c', '几条带子是一个判断，却和被测量的那个数用同一种墨画出来，所以页面必须交代它们从哪来。只是把量程三等分的带子会让图看起来「已经被评估过」，其实并没有。'],
      ['46bd088a', '它呈现的是一个瞬间，除了 target 之外不携带任何比较。「我们是怎么走到这儿的」要的是 LineChart。'],
      ['1ef4ec0e', '共用的带子只有在几个度量共用同一把尺时才有意义——延迟和转化率并排时，要给每个度量各自的 ranges 和 domain。'],
    ],
    anatomy: [
      { hash: '9b2f6b79', element: '图题', description: '公共图表 figure 上的 title，用 aria-labelledby 明确引用，而不是留给 figcaption 去被推断；默认看不见，除非 showTitle 把它印出来、description 排在下面。' },
      { hash: 'bd56e66c', element: '度量行', description: '每条轨道上面的那一行：行首是度量的名称和它可选的补充说明，行尾是格式化后的数值，有目标值时跟在一条斜杠后面。读屏用户拿到的读数就是这一行，因为它下面那张图根本不在无障碍树上。' },
      { hash: '57d4e550', element: '轨道', description: '24px 高、aria-hidden 的盒子，装着背景带、条形和目标线，用行内轴的偏移排版，而不是在 SVG 用户坐标系里——正是这一点让整张图在从右到左的文档里能正确镜像。' },
      { hash: 'a0ddf33a', element: '背景带', description: '定性的底，由 ranges 按递增的上界建出来：刻度低端最重，往上逐渐变浅，所以实心的条形在表现最好的那一段最跳。' },
      { hash: 'd6d9a2cc', element: '度量条', description: '那个值，实色 --series-1，高度是轨道的三分之一，从刻度起点开始画。它是这里唯一一个属于测量而非判断的标记，也是唯一一个用足墨色画的。' },
      { hash: 'f8edd32c', element: '目标线', description: 'target，画成一条 2px 的 --ink 横线直接穿过条形，而不是在旁边再放一根条——所以哪个数是做到的、哪个数是要求的，一眼就分得出，不用去比。' },
    ],
    practices: [
      ['ec1b2765', 'ranges 的每一个界都要落在 domain 里面。位于两端或两端之外的界，在带子建起来之前就被丢掉，所以在 0 到 50 的 domain 上给出 60 和 80 的 ranges，画出来是一条平的带子、哪儿都没有边界——这一行看着像被评估过，其实没有，而且它对此一声不吭。'],
      ['c060bf71', '带子守住五条。无论传进来多少条，权重都是从满值的 --chart-fill 均匀铺到它的十分之三，所以第六条、第七条边界只是把同一段跨度切得更细，底也就不再有可以让读者读出阈值的边。'],
      ['9a372ffa', '除非页面自己会把这些度量印出来，否则 hideDataTable 就别开。整张图都是 aria-hidden——带子、条形、目标线一样——所以那张自动生成的、装着值、目标和各段界限的 sr-only 表格，是读屏用户唯一够得到的、对这张图的交代。'],
      ['bd14081a', '超出刻度末端的值是被夹住，不是溢出：0 到 100 的 domain 上，130 把轨道填满，和 100 填得一模一样，只有轨道上方印出来的那个数字说得清是哪一个。domain 要固定得足够宽，容得下你预期的超额，否则那个远远冲过目标的行，看起来只是刚好做完。'],
      ['0d99e822', '不要把某一段的界限正好放在目标值上。两者是同一把刻度摆出来的，所以那条线会不偏不倚落在带子的边上，而唯一一个说明「要求做到多少」的标记，就消失在它本该被对照着读的那块底里。'],
    ],
  },
}
