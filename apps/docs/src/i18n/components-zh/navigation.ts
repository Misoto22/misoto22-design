/**
 * The Navigation group of the Chinese catalogue — 导航 — and nothing else.
 *
 * `content.ts` is still the module every consumer imports. It keeps
 * `ComponentCopyZh`, the foundations, the page copy and the lookups, and
 * assembles `COMPONENTS_ZH` by spreading these ten files in `GROUPS_ZH`
 * order. Nothing imports this one directly.
 *
 * A group is the unit for the same reason it is in the package's own
 * `agent/catalog/navigation.mjs`, which this file mirrors slug for slug and in the
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

export const NAVIGATION_ZH: Record<string, ComponentCopyZh> = {
  tabs: {
    name: '标签页',
    summary: ['c683fcb4', '一条，若干面板。'],
    accessibility: [['11958b70', '这条会横向滚动而不是折行：折到第二行会把下面每个标签都推走，读者刚要点的那个就没了。'], ['5e58396c', '高 44px，标签页也是指针目标。']],
    keyboard: [['85418575', '进入和离开标签条——整条只占一个 Tab 停靠点。'], ['f48b5eb9', '在标签之间移动，面板跟着换。'], ['4a4c06ac', '跳到第一个或最后一个标签。']],
    anatomy: [
      { hash: '9fc40436', element: '根节点', description: 'Tabs——Radix 的根节点，原样再导出。它什么都不画，却拥有一切：value 或 defaultValue，以及 activationMode。value 和 defaultValue 都不给，就没有任何标签被选中，也没有任何面板被挂载。' },
      { hash: 'b9a5c02b', element: '标签条', description: 'TabsList——那一行 role="tablist"，坐在一条发丝线上，用 scroll-slim 在自己这条轴上滚动。你不给，它就没有无障碍名称。' },
      { hash: '8f00e5d6', element: '标签', description: 'TabsTrigger，md 控件高度，标签文字只占一行。每个标签都带着那道 2px 的选中记号，在它成为选中项之前是透明的；这道记号用 -mb-px 拉到标签条自己的边框上，所以两者共用一条线，而不是叠成一道 3px 的边。' },
      { hash: '1bfb6de4', element: '面板', description: 'TabsContent，靠 value 相等和它的标签配对。只有在它是选中项时才挂载，并且标了 data-m22-animated，所以对要求少一点动效的读者，它的入场是被直接去掉的。' },
    ],
    practices: [
      ['be833d77', '根节点要给 defaultValue 或 value：两个都不给，就什么都匹配不上，每个面板都不挂载，页面渲染出来是一条标签条加一片空白，没有任何东西说明缺了什么。'],
      ['6b2020d3', '每个触发器的 value 要和某个面板的 value 完全一致——配对靠的是字符串相等，所以打错一个字不会报错，只会得到一个点开什么都没有的标签。'],
      ['d15405c4', '面板要发请求、或者要渲染很贵的东西时，传 activationMode="manual"：默认是 automatic，← 和 → 一边移动一边选中，横着划过四个标签，就在读者停下之前起了四次加载。'],
      ['226b7871', '一个页面上不止一组标签页时，给 TabsList 一个 aria-label：Radix 不会拿任何东西给这个 tablist 命名，而两个没有名字的 tablist，就是读者分不出彼此的两个「tab list」。'],
      ['f1f81247', '没被选中的面板是被卸载，不是被隐藏——页内查找够不到它的文字，打印只会带上当时打开的那一个，而另一个标签里填了一半的表单，等读者回来时，打进去的东西已经没了。'],
      ['20907bd6', '当前选中的标签活在 React state 里，不在 URL 里：刷新或者把页面分享出去的读者，落到的是第一个面板——所以任何值得被链接的东西，都得把 value 提到一个查询参数里。'],
      ['3987c6b8', '标签页不是用来多塞东西的：那条标签条是无声滚动的，而折线之外的第六个标签，看起来和一个只有五个标签的页面一模一样。'],
    ],
  },
  accordion: {
    name: '手风琴',
    summary: ['127a840c', '就地展开的折叠行。'],
    when: ['1e3faa00', '标记是加号不是尖角：加号说“这会展开”，尖角说“下面还有”。'],
    keyboard: [['80403600', '在各行之间移动。'], ['c1068f78', '展开或收起当前聚焦的那一行。']],
    anatomy: [
      { hash: 'd40dde32', element: '行', description: 'AccordionItem——一条由发丝线分隔的记录，键就是 Radix 用来开合它的那个 value。集合是它上面那个根节点：常见问题用 type="single" 配 collapsible，一叠设置项用 type="multiple"。' },
      { hash: '811a6883', element: '标题', description: 'Radix 的 Accordion.Header，它是一个 <h3>，而且不收 level 属性。所以无论这个手风琴恰好放在哪儿，每一行都往文档大纲里加一个 h3。' },
      { hash: '9c43b954', element: '触发器', description: '那个标题里面的满宽按钮：title 靠着起始边，记号靠着末端边，py-4。展开的那个面板，名字也是由它给的。' },
      { hash: '30ab2864', element: '记号', description: '一个 16px 的加号，aria-hidden，行展开时旋转 45° 变成减号。它画出来的这个状态，对其他所有人是由触发器上的 aria-expanded 承担的。' },
      { hash: '83fa576d', element: '面板', description: 'Radix 的 Content——一个由它的触发器命名的 role="region"，只在展开时挂载，overflow-hidden 好让量出来的高度能做动画，里面 pb-4 pe-8，这样文字停在记号那一列之前。它带着 data-m22-animated，所以对要求少一点动效的读者，展开和收起是被整个去掉的。' },
    ],
    practices: [
      ['74ad841e', 'type="single" 要连着 collapsible 一起传：不传，就没有一个空值可以回去，于是读者展开的第一行，是一行他再也关不上的行。'],
      ['b3c78b7b', '每一项的键要用稳定的东西，而不是它的位置——Radix 是按 value 记住哪一行开着的，所以列表一重排或者一过滤，现在坐在那个位置上的不管是什么，都会开着。'],
      ['2399b4a0', 'title 要写成完整的那个问题：它既是触发器的无障碍名称，也是面板的——所以一行标题写「More」，展开的就是一个叫「More」的区域。'],
      ['d16480ca', '两行需要互相对着读时，用 type="multiple"——single 会为了打开读者想拿来对比的那一行，把他正按着的那一行关掉。'],
      ['b0c994b6', '收起来那一行的内容不在 DOM 里，所以用它搭出来的常见问题页，对页内查找是看不见的，打印出来就是一列问题——任何必须能搜、能打印的东西，都该直接放在页面上。'],
      ['438aeb02', '触发器的层级被 Radix 的 header 钉死在 h3，所以放在一个 <h3> 底下的手风琴，它的行是作为那个标题的同级列出来的，大纲恰恰在本该嵌套的地方压平了。'],
      ['a057b0c6', '面板是 overflow-hidden 的——展开的高度能做动画正是靠这个——所以里面任何必须跑出这一行盒子的东西，都得 portal 出去；就地渲染的菜单会被切在行的边上。'],
    ],
  },
  breadcrumb: {
    name: '面包屑',
    summary: ['16514719', '你在哪，画成一条路径。'],
    accessibility: [['d33b60b4', '最后一节是带 aria-current="page" 的文字，永远不是指向自己的链接。'], ['b53ee770', '分隔符是 aria-hidden 的，所以这条路径不会被念成“首页 斜杠 作品 斜杠”。'], ['6593cf07', '中间某一节没有 href 时，它既不带 aria-current，也没有自己的颜色——所以这处遗漏是在开发环境里被报出来，而不是当作一节冒充当前页的路径发出去。']],
    anatomy: [
      { hash: '13d7d7aa', element: '路径', description: '一个由 label 命名的 <nav>，默认名是「Breadcrumb」。不管页面想不想再多一个地标，它就是一个地标；排版是 --ink-3-aa 上的 mono-meta。' },
      { hash: 'a7f07d7a', element: '列表', description: '一个 <ol>——这个顺序是层级，不是读者的浏览历史。它是折行而不是截断，所以一条很深的路径是占到第二行，而不是丢掉一级。' },
      { hash: '4e2aeb5a', element: '路径链接', description: '给每一个有 href、又不是最后一节的项渲染的 <a>。label 是 ReactNode，所以你往里放什么，什么就成了这个链接无障碍名称的一部分。' },
      { hash: 'e579d964', element: '当前节', description: '永远是最后一项：满色 --ink 的纯文字，带 aria-current="page"，无论有没有给它 href。' },
      { hash: '036dab4b', element: '分隔符', description: '默认是一条斜杠，装在两节之间自己那个 <li aria-hidden> 里。它的构造决定了它是装饰——永远不会成为被念出来的内容的一部分。' },
    ],
    practices: [
      ['ab6a5e77', '一个页面可能同时装两条路径时，要传 label：否则两个 nav 地标的名字都是「Breadcrumb」，而同名的两个地标，就是读者无从选择的两个条目。'],
      ['e65eb564', '除最后一节外，每一节都要给 href——没有 href 的那一节会渲染成纯文字，颜色和旁边的链接一样，却既没有去处也没有 aria-current，于是它被读成读者正在看的那一页，而它并不是。开发环境会把那一节的名字点出来，而不是留下一处在浏览器里和评审里都看不见的遗漏。'],
      ['e726f5ea', '这条路径要从当前页的上一级开始：只有一项的 Breadcrumb 会把那一项渲染成当前节，路径压根不存在——那是一个在宣告「一段长度为一的旅程」的地标。'],
      ['06ccc0a9', '最后一项的 href 干脆别写，别传一个它根本不用的：不管你给它什么，最后一节都是文字——所以写在那里的 href 在评审时读起来像个链接，运行时却不是。'],
      ['9685a417', '别为了省一行就在手机上把它藏了。恰恰是那种版式里，侧边栏躲在抽屉后面，这条路径才是屏幕上唯一一条能往上走一级的路。'],
    ],
  },
  pagination: {
    name: '分页',
    summary: ['2a831cc2', '带页码的分页，中间省略。'],
    accessibility: [['6b115e49', '当前页是带 aria-current 的按钮，不是加了样式的 span——按控件跳转的读者需要能找到它。'], ['ffbdc174', '只有一页时什么都不渲染。为一页做的分页器是摆设。'], ['77d5b2fa', '读者听到的每一个字符串都是属性：两个尖角各有自己的名字，每一个页码走 pageLabel——它是一个函数而不是一个模板，因为「Page 3」是一个各部分会随语言挪位置的短语。']],
    keyboard: [['f90df508', '能走到每一个控件，包括当前页。'], ['a04b2b0a', '跳到那一页。']],
    anatomy: [
      { hash: '068cd40e', element: '导航区', description: '一个由 label 命名的 <nav>，默认叫「Pagination」。这里没有别的东西是地标，所以读者能直接跳到分页器、而不是滚过去，靠的就是它。' },
      { hash: 'e8639f62', element: '步进按钮', description: '上一页和下一页，--control-h-sm 高的胶囊圆角，名字由 previousLabel 和 nextLabel 给——在调用处另有说法之前，是「Previous page」和「Next page」。各自到了区间的尽头就被 disabled，这会把它移出 Tab 顺序，而不是留下一个按了什么都不做的控件。' },
      { hash: '8b9b37d1', element: '页码列表', description: '一个装着数字的 <ol>，每个数字是一个由 pageLabel 命名的 <button>——默认是「Page N」——你所在的那一个带着 aria-current。' },
      { hash: '16d71d4c', element: '滑动胶囊', description: '一块 aria-hidden 的填充，尺寸是从选中那个按钮量出来的，靠 transform 移动，而不是两块底色交叉淡入淡出。第一次测量落定之前它不存在，而在 prefers-reduced-motion 下它保持不动。' },
      { hash: '738f70a5', element: '省略号', description: '序列跳过不止一页的地方，放一个 aria-hidden 的 <li>。只跳过一页时改成把那一页印出来——「1 … 3」比「1 2 3」还长，说的却更少。' },
    ],
    practices: [
      ['9cd6518e', 'page 要和发请求写在同一次状态更新里：它是完全受控的，所以一个只加载下一页、却没有设 page 的处理函数，会让分页器一直标着读者刚离开的那一页。'],
      ['94ad8c94', 'siblings 要往上调，别往下调——总页数不到 2 × siblings + 5 时每一页反正都会印出来，所以这个属性在短列表上什么都不做，在长列表上又是你手里唯一的那根杆。'],
      ['11142790', '别的东西必须和分页器口径一致时，把 paginationRange import 过来：它是导出的、纯的——服务端渲染的那句摘要和这个组件最后描述的是同一个窗口而不是两个，靠的就是它。'],
      ['bef533b1', '让外面那一行能塌下去：页数不超过一页时这个组件返回 null，所以一个按固定高度搭的页脚，会在列表变短的那天露出一条空带。'],
      ['76972040', '别把它放进一个紧凑区域，再管它叫触摸目标：那些胶囊是 --control-h-sm，默认密度下 36px、data-density="compact" 下 30px，彼此只隔 4px——远低于 WCAG 2.5.5 对指针目标要求的 44px。'],
      ['ddd7e205', '别指望 pageLabel 会改变印出来的东西。它只为读屏软件命名这个控件，别的什么都不做；按钮显示的仍然是交给它的那个西文数字——所以数字写法不同的语言，还得在调用处自己把它们格式化一遍。'],
    ],
  },
  'nav-item': {
    name: '导航项',
    summary: ['383cdc82', '侧边栏里的一行。'],
    accessibility: [['94aa9ae3', 'aria-current="page"，而且不只靠颜色：当前行同时由字重和填充底色承担。']],
    anatomy: [
      { hash: 'f7d64e16', element: '行', description: '一个 --control-h-sm 高、带 --radius 圆角的 <a href>——或者，在 asChild 下，是你交给它的那个路由链接：它接过类名和 aria-current，自己成为这一行。' },
      { hash: 'ca3e231d', element: '图标', description: '一个可选的 lucide 组件，18px，aria-hidden，排在标签前面。它只由原生那条分支渲染：走 slot 的行要把图标放进子元素里面，因为 Slot 只收一个子节点。' },
      { hash: '1b25cd67', element: '标签', description: 'children，也是这一行无障碍名称的全部——图标对它没有任何贡献。' },
      { hash: '0e34d57b', element: '选中底色', description: 'active 一步打开的东西：一块 --stone 填充、中等字重，以及 aria-current="page"。三重信号，所以当前行在单色和低对比度下都活得下来。' },
    ],
    practices: [
      ['834cb46a', 'href 要在 slot 进来的那个子元素上再写一遍：asChild 转发的只有类名和 aria-current，别的什么都不转发——所以一个自己不带 href 的 <Link>，就是一行哪儿都去不了的行。'],
      ['71407895', 'asChild 模式下要把图标放进子元素里面——icon 属性在那里是被无声丢掉的，整条侧边栏渲染成一列看起来没有标记的行，就是这么来的。'],
      ['96629e5d', 'active 要从路由当前的路径推出来，而不是从最后一次点击：写出 aria-current="page" 的正是它——所以一条只记着自己被点了哪儿的侧边栏，告诉读者的是他按过的那一行，而不是他正在的那一页。'],
      ['6bb70911', '别为了标出这一页属于哪个分区，就把父级那一行也设成 active：active 的含义就是 aria-current="page"，出现两个，就是告诉读者他同时在两个地方。'],
      ['1b91898d', '别再把这一行压得更紧：它是 --control-h-sm，默认密度下 36px、data-density="compact" 下 30px，再往下加一个 py 类，留下的就是一列要拇指瞄准才点得中的目标。'],
    ],
  },
  collapsible: {
    name: '折叠面板',
    summary: ['c89792d4', '一个自己开合的东西。'],
    when: ['aab7956c', '和 Accordion 的差别是算术：手风琴是一个集合，集合才能协同。只有一项的手风琴在管理一个没人读的值。'],
    keyboard: [['ee1dd9b9', '展开或收起。']],
    anatomy: [
      { hash: '7974c97e', element: '根节点', description: 'Collapsible——Radix 的根节点，拿着 open 或 defaultOpen，什么都不画。CollapsibleSection 是同一个根节点，只是触发器和面板已经组好了，多数调用处要的是它。' },
      { hash: '0cd09398', element: '触发器', description: '一个带着 aria-expanded 和 aria-controls 的普通 <button>——而且和手风琴的行不同，它外面根本没有包任何标题。这里没有任何东西会出现在文档大纲里。' },
      { hash: '7006c188', element: '记号', description: '一个旋转 180° 的尖角，特意选来和手风琴的加号分开：这里展开的是同一件东西的更多部分，而手风琴的一行打开的是一个独立的答案。' },
      { hash: 'df0f0348', element: '面板', description: 'Radix 的 Content，收起时卸载，按量出来的 --radix-collapsible-content-height 做动画，所以一组很长的和一组很短的用时一样。它是一个光秃秃的 div：没有 region role，也没有自己的名字，这一点同样和手风琴不同。它和散着用的 CollapsibleContent 都带着 data-m22-animated，所以在 prefers-reduced-motion 下两者是一致的，而不是只有其中一个遵守。' },
    ],
    practices: [
      ['47980845', '这一段真的是一个段落时，自己给触发器套一个标题：Accordion 把每个触发器都包进 <h3>，而这里是刻意一个都不包——所以一个由 CollapsibleSection 搭起来的页面，按标题导航时没有任何东西可以停。'],
      ['fe6d3cdd', '只有当那行头部要装的不只是一个标题时——一边一个计数、另一边一个开关——才去用散着的 CollapsibleTrigger 和 CollapsibleContent。它们存在，是为了让那样的调用处不必跑去 Radix 手工重推一遍 aria-expanded。'],
      ['59820545', '它藏起来的东西正是读者来的目的时，设 defaultOpen：收起的面板是被卸载而不是被隐藏，所以它的文字不在页面上——页内查找、打印，以及任何读取渲染后 DOM 的东西，都拿不到。'],
      ['1314b268', '需要由外面的东西来把它打开时，用 open 和 onOpenChange 受控——一个必须为住在它里面的那条路由展开的侧边栏分组，是没法从一个自己管着自己状态的组件那里被通知到的。'],
      ['4fabc27e', '别用它们拼一个集合：两个段落没法互相关闭，读者最后拿到的是全部展开、外加一长列要滚过去的内容。那份协同，正是 Accordion 那一个 value 买来的全部。'],
      ['ae57bd99', '别让标题在「Show more」和「Show less」之间来回翻：触发器上的 aria-expanded 已经带着这个状态了，于是这一行的状态被播报两遍，而且每按一次名字就换一个。'],
    ],
  },
}
