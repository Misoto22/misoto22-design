import { fingerprint } from './api-hash'
import type { Locale } from './locales'

/**
 * The changelog, in Chinese.
 *
 * KEYED BY THE FINGERPRINT OF THE ENGLISH, which is the whole design. The
 * changelog is assembled from `CHANGELOG.md`, so a translation of it is a copy
 * the original can move out from under — and the file is written by whoever
 * shipped the change, in English, at a moment when nobody is thinking about
 * this catalogue.
 *
 * With the English's own fingerprint as the key, drift cannot produce a lie: an
 * entry that is reworded stops matching and the page falls back to the English
 * it no longer has a translation for. That is the right failure. `api.ts` pairs
 * a hash with each entry and a test enforces it, because a doc comment is
 * edited by the same person in the same commit; a changelog line is not, and a
 * build that fails on every changeset would be a build people route around.
 *
 * `changelog.test.ts` reports what is untranslated rather than failing, and
 * fails only on an ORPHAN — a translation whose English no longer exists
 * anywhere, which is the one thing that is certainly a mistake rather than a
 * backlog.
 */
const ZH: Record<string, string> = {
  // ─── 0.4.0 ───
  [fingerprint('One radius ladder driven by one factor, a calendar that picks a month in place of the grid, a reading surface for long-form content, and a numbered rail for the sequences a diagram should not be drawing.')]:
    '一条由单一系数驱动的圆角阶梯、一个用月份网格就地替换日期网格的日历、一个长文阅读版面，以及一条带编号的轨道——那些本来就不该用图去画的顺序。',
  [fingerprint('**The radius is a ladder now, and a theme moves one number.** The four steps were four independent values, and the radius theme re-typed all four — so nothing held them in proportion and a corner nested inside another corner was right at the one setting somebody checked and wrong at every other. Every step is now `calc(<n>px * var(--radius-factor))` — 4, 6, 8, 12 and the pill, which is where Tailwind\'s scale, shadcn\'s `--radius` ± 2 and ± 4, Radix Themes\' steps 3 and 4 and Material\'s `xs`/`sm`/`md` all land within a pixel of each other. `sharp` sets the factor to `0` and `round` to `2`, and the pill is on the ladder with everything else: a square theme that left every button a capsule was not a square theme. A true circle — an avatar, a status dot, a spinner, a radio — is geometry and stays round.')]:
    '**圆角现在是一条阶梯，一个主题只动一个数。** 原本四级是四个各自独立的值，圆角主题会把四个全部重写一遍——于是没有任何东西维持它们之间的比例，一个套在另一个圆角里的圆角，只在某人检查过的那一档是对的，其余每一档都是错的。现在每一级都是 `calc(<n>px * var(--radius-factor))`——4、6、8、12 以及药丸形，这也正是 Tailwind 的尺度、shadcn 的 `--radius` ±2 与 ±4、Radix Themes 的第 3 与第 4 级、Material 的 `xs`/`sm`/`md` 彼此相差不到一个像素的落点。`sharp` 把系数设为 `0`，`round` 设为 `2`；药丸形和其他一切一样在这条阶梯上：一个把每个按钮都留成胶囊的直角主题，不是直角主题。真正的圆——头像、状态点、spinner、单选框——是几何形状，保持圆形。',
  [fingerprint('**`Button` now draws `--radius`, the control step**, which is the same corner an `Input`, a `Select` trigger and a `Textarea` draw. It was a pill, and a pill beside an 8px field is two different ideas of what a control is — the one inconsistency in the system that every reader noticed and no component page could explain. The capsule is kept for the things that genuinely are one: a badge, a status pill, a segmented strip, a progress track. `Calendar`\'s own chrome buttons follow, and its caption arrows are now the same height as the month they sit beside rather than ten pixels above it.')]:
    '**`Button` 现在画的是 `--radius`，也就是控件那一级**，和 `Input`、`Select` 触发器、`Textarea` 画的是同一个角。它以前是药丸形，而一个药丸紧挨着一个 8px 的字段，是关于「控件是什么」的两种不同想法——这是整套系统里每个读者都注意到、却没有任何一个组件页解释得了的那处不一致。胶囊形留给那些本来就是胶囊的东西：徽章、状态药丸、分段条、进度轨道。`Calendar` 自己的控件按钮跟着改，它标题栏的箭头现在和旁边的月份等高，而不是高出十个像素。',
  [fingerprint('Two rounded edges separated by a gap of `p` are concentric only when the inner radius is the outer minus `p`. Both directions are named rather than left for each surface to guess: `--radius-row` subtracts (a row inside a panel padded by 6px) and `--radius-frame` adds (a frame sitting 16px outside a `--radius-lg` panel), with the adding one gated so a square theme stays square. Menus, popovers, selects and the command palette now round their panel at `--radius-lg` and their rows at `--radius-row`, which is the pairing that actually holds at every setting.')]:
    '两条被 `p` 的间距隔开的圆边，只有在内圆角等于外圆角减去 `p` 时才是同心的。两个方向都被命名了，而不是留给每个表面自己去猜：`--radius-row` 做减法（一行嵌在内边距 6px 的面板里），`--radius-frame` 做加法（一个框套在 `--radius-lg` 面板外 16px 处），并且加法那一侧加了闸门，好让直角主题保持直角。菜单、popover、select 和命令面板现在面板用 `--radius-lg`、行用 `--radius-row`，这才是在每一档设置下都成立的配对。',
  [fingerprint('The ladder is declared for `:root` **and** `[data-radius]`. A custom property substitutes `var()` where it is declared, so a ladder written only on the root bakes the root\'s factor in and a themed subtree never reaches its own — which is exactly what the themes page does, five radii on five wrappers.')]:
    '这条阶梯为 `:root` **和** `[data-radius]` 各声明了一遍。自定义属性会在**声明它的地方**代换 `var()`，所以只写在根上的阶梯会把根的系数烤死，被主题化的子树永远够不到自己的那个——而这恰恰是主题页在做的事：五个包装元素上的五种圆角。',
  [fingerprint('**New `Article`** — the long-form reading surface. Everything a Markdown pipeline emits, set in this system\'s type, colour and rules: headings and their anchors, lists, tables, quotations, code, figures, footnotes and MathML. The styles ship as `@misoto22/design/article.css` and are scoped to a data attribute, so a site with its own pipeline can take the reading surface without taking the components.')]:
    '**新增 `Article`**——长文阅读版面。Markdown 流水线会吐出的一切，都用这套系统的字体、颜色和分隔线来排：标题及其锚点、列表、表格、引文、代码、图注、脚注和 MathML。样式作为 `@misoto22/design/article.css` 单独发布，并限定在一个 data 属性下，所以一个已经有自己流水线的站点，可以只取这个阅读版面而不取组件。',
  [fingerprint('**New `Diagram`** — a flow or architecture figure drawn from the system\'s own parts. Nesting is containment and an edge is a step between siblings; it takes a spec rather than markup, so a fenced ```diagram block and a hand-written figure are one renderer, and it server-renders because it is markup rather than a canvas.')]:
    '**新增 `Diagram`**——用系统自己的部件画出的流程或架构图。嵌套表示包含，连线表示同级之间的一步；它接受的是一份描述而不是标记，所以一个 ```diagram 代码块和一张手写的图共用同一个渲染器，而且因为它是标记而不是画布，它能在服务端渲染。',
  [fingerprint('**`Calendar` picks a month in place of the grid.** The month and year were two `Select`s that portalled a ten-rem list over the calendar — three visible months out of twelve, with a scroll arrow at each end, floating on top of the thing the reader opened it to change. The caption is now one control reading "September 2026", and it swaps the day grid for a 3×4 month grid or a 4×6 year grid at the same size. Nothing overlaps, nothing scrolls, Escape closes it and hands focus back, and the year pages tile the range from its first year so every year in the span is reachable — the old arrangement could offer a year it never showed.')]:
    '**`Calendar` 用月份网格就地替换日期网格。** 月份和年份原本是两个 `Select`，会把一个十 rem 高的列表浮到日历上方——十二个月里只看得见三个，两端各一个滚动箭头，飘在读者正是为了改它才打开面板的那个东西上面。现在标题栏是一个写着「September 2026」的单一控件，点开后在同样的尺寸里把日期网格换成 3×4 的月份网格或 4×6 的年份网格。没有遮挡，没有滚动，Escape 关闭并把焦点交回去；年份分页从范围的第一年开始铺，所以跨度里的每一年都够得到——旧的排法可能给出一个它自己从来没显示过的年份。',
  [fingerprint('The picker BROWSES; it does not navigate. Stepping the year moves the grid under the arrows and leaves the calendar where it was, so one click does one thing: choosing a month is what moves the calendar and closes the panel. It used to navigate and close on the arrow, which meant `‹` on "2026" left the reader looking at a different month with the picker gone.')]:
    '这个选择器是在**浏览**，不是在导航。翻年份只是让箭头下方的网格移动，日历本身留在原地，所以一次点击只做一件事：选中某个月份才会移动日历并关闭面板。它以前是按箭头就导航并关闭，于是在「2026」上点 `‹`，读者抬头看到的是另一个月份，而面板已经没了。',
  [fingerprint('**New `Steps`** — a numbered sequence as a rail: a marker, a rule through them, a name and a line of detail. It is the figure a technical page reaches for after a diagram and is not one, because nothing branches and nothing points at anything; drawing an order with boxes and arrows says otherwise. An `<ol>`, with the connector on the item so it stops between markers rather than running through them and off the end.')]:
    '**新增 `Steps`**——把一个带编号的顺序做成一条轨道：一个标记点、一条贯穿它们的线、一个名称和一行细节。这是技术页面在图之后会伸手去拿、但它本身并不是图的那种图形，因为没有分支、也没有任何东西指向任何东西；用方框和箭头去画一个顺序，说的是另一回事。它是一个 `<ol>`，连接线挂在条目上，所以线止于标记点之间，而不是穿过它们、再从末端跑出去。',
  [fingerprint('**New floating-surface tokens, and a glass theme that spends them.** `--panel-bg`, `--panel-border` and `--panel-filter` are what a surface that FLOATS fills with and what it does to whatever is behind it — read by `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, `ContextMenu`, `Select` and `Command`, and by nothing that sits in the page, because a card has nothing behind it to treat. All three default to the plain surface, and `--panel-filter: none` is not a blur of zero: any `backdrop-filter` value promotes its element to a compositing layer and makes it a containing block for fixed descendants, which is a cost every menu would pay for a theme most readers never turn on.')]:
    '**新增浮层表面的 token，以及一个花掉它们的玻璃主题。** `--panel-bg`、`--panel-border` 和 `--panel-filter` 是一个**浮起来**的表面用什么填充、以及它对身后的东西做什么——由 `Dialog`、`Sheet`、`Popover`、`DropdownMenu`、`ContextMenu`、`Select` 和 `Command` 读取，页面里坐着不动的东西一概不读，因为一张卡片身后没有任何东西需要处理。三者都默认取普通表面，而 `--panel-filter: none` 不等于零模糊：任何 `backdrop-filter` 值都会把元素提升为合成层，并使它成为固定定位后代的包含块——这个代价，会由每一个菜单为一个大多数读者从不打开的主题付掉。',
  [fingerprint('`[data-surface=\'glass\']` then sets a translucent panel, a specular edge and `blur(20px) saturate(180%)`. It does not break law 2: the blur is not UNDER a surface pretending to be a shadow, it is BEHIND one. A shadow claims a light source this system does not have; a frosted panel claims a material, and says honestly that the page is still there behind it.')]:
    '`[data-surface=\'glass\']` 于是设上半透明面板、一道高光边缘和 `blur(20px) saturate(180%)`。它没有违反法则 2：这层模糊不是**垫在**某个表面下面假装成阴影，而是**透过**它看到的。阴影宣称有一个这套系统并不存在的光源；磨砂面板宣称的是一种材质，并且诚实地说：页面还在它后面。',
  [fingerprint('`Collapsible` also exports `CollapsibleTrigger` and `CollapsibleContent`, for a disclosure that needs its own header layout.')]:
    '`Collapsible` 同时导出 `CollapsibleTrigger` 和 `CollapsibleContent`，供需要自己排头部布局的展开块使用。',
  [fingerprint('**`FigureBand` reaches four columns again.** Its container query was declared on the same element it queried, which can never match, so the band stayed two columns at every width — four figures on a full page came out as a 2×2 block with a hole in it.')]:
    '**`FigureBand` 又能排到四列了。** 它的容器查询声明在它自己要查询的那个元素上，而那是永远匹配不到的，所以这条带子在任何宽度下都停在两列——整页宽度下的四个数字，出来是一个中间带洞的 2×2 方块。',
  [fingerprint('`ToggleGroup`\'s sliding pill lands on its segment inside a scaled container.')]:
    '`ToggleGroup` 的滑动药丸在被缩放的容器里也能落到它自己那一段上。',
  [fingerprint('The indicator measured with `getBoundingClientRect`, which reports visual pixels, and positioned with `transform`, which is interpreted in the element\'s own coordinate space. Inside anything zoomed or scaled — a thumbnail, a device preview — the two disagreed by exactly the scale factor and the pill sat short of its segment. It now accumulates layout offsets up to the strip instead.')]:
    '指示器用 `getBoundingClientRect` 测量——它返回的是视觉像素——却用 `transform` 定位，而后者是在元素自身的坐标系里解释的。在任何被 zoom 或 scale 过的东西里面——一张缩略图、一个设备预览——两者恰好差了一个缩放系数，药丸就落在它那一段的前面。现在改成向上累加布局偏移到那条strip为止。',
  // ─── Section headings ───
  [fingerprint('Minor Changes')]: '次要变更',
  [fingerprint('Patch Changes')]: '补丁变更',
  [fingerprint('Changed')]: '变更',
  [fingerprint('Added')]: '新增',
  [fingerprint('Fixed')]: '修复',

  // ─── 0.3.1 ───
  '5ac774fb': '修好表格的列间距——一个没带单位的零一直在悄悄把它吃掉。',
  d0491473:
    '`--table-pad-x` 写的是 `0` 而不是 `0px`。单元格的分割线会在一个 calc 里加到它上面，于是解析成 `calc(0 + 1.5rem)`——在计算值阶段就是无效的，而这会**整条丢掉**声明，不是退回默认值。所以每一张 `borders="rows"` 或 `borders="none"` 的表格里，除最后一个以外的每个单元格都完全没有 `padding-inline-end`，一个 `align="end"` 的列会直接顶在邻居身上。带边框的那几种没事，因为它们把这个变量设成了 `0.75rem`，单位跟着一起来了。',

  cad31ded: '走了一遍线上站点，修掉十个问题。',
  '9944fede':
    '`FigureBand` 塌成了两列零宽、文字互相重叠。它声明了 `@container`，而容器查询会在**不看内容**的情况下计算自身宽度——作为一个按内容收缩的 flex 子项，那个宽度解析成了 0。',
  '2b886cab': '反色 `plate` 上的 `CardTitle` 是墨色压近黑色，对比度 1.25:1。',
  '91c81c74':
    '`ToggleGroup` 会被它的 flex 父级拉满，最后一段之后留下一片死区。`inline-flex` 并不能退出这种拉伸，`w-fit` 才可以。',
  bada2098: '锚定的面板从它的触发器长出来，现在收回去时也有动画了。',
  d7501450:
    '`Select` 接受 `contentClassName`，日历的年份列表用上了它：默认那 18rem 会盖住读者正是为了改它才打开的那本日历。',
  '92c8d148':
    '`Combobox` 和 `SearchableMenu` 给自己的筛选框起了名字，说明它是干什么的。之前它继承了控件本身的名字，于是读屏用户会遇到两个同名的 combobox，一个套在另一个里面。',
  c12cc3bb: '新增 `scroll-hairline`，给有边界的面板用；命令面板已经在用它。',

  // ─── 0.3.0 ───
  '02de5ed5': '可配置的 Table、一个可搜索的动作菜单，以及日历/日期选择器的修复。',
  e9c789af:
    '`Table` 接受 `borders`（`rows` | `grid` | `bordered` | `bordered-grid` | `none`）、`density`、按列的 `align`，以及按列开启的 `sortable` 配 `sortDirection` / `onSort`。所有分割线都画在外层，所以组件仍然可以在服务端渲染。',
  ef19a5bc:
    '新增 `SearchableMenu`：一个可筛选的动作菜单，用于 `DropdownMenu` 已经装不下、而 `Combobox` 又不合适（它不设置值）的场景。',
  b853d373:
    '`Calendar` 的月份和年份选择器改用我们自己的 `Select`，而不是原生下拉；范围也从整个世纪收成前后各 10 年。',
  '3e6f5e0a':
    '被选中的日期重新变圆。在范围模式下，只选一天时它既是范围起点又是范围终点，两条覆盖规则叠加起来正好等于 `border-radius: 0`。',
  dcb178e0:
    '`DatePicker` 和 `DateRangePicker` 接受 `presets`：一条快捷选项栏（最近 30 天、最近 90 天、年初至今……），点击时才计算，所以“今天”真的是今天。',

  '747f18f4': '`Command` 的每一行都带上了图标和一行注解，面板也会说明每个键做什么。',
  '17ffc9f9':
    '`CommandItem` 接受 `icon` 和 `meta`。四十行纯文字是扫不动的——眼睛先按形状分类，然后才读字。',
  f6684b9f:
    '新增 `CommandFooter` 和 `CommandHint`：一个命令面板需要的按键提示条，因为屏幕上没有任何别的东西会告诉你方向键能移动选中行。',
  '639448fe': '高亮那一行改成读 `--accent` 并带一条前导竖线，而不是一块平铺的灰底。',
  '6d0b2a7a': '`CommandDialog` 更宽了，并且落在偏上的位置——命令面板本来就该在那里。',

  '6fb4ee90': '修好那些画了但没接线的交互，并让“选中”这件事有东西在动。',
  b9524863:
    '`Select` 现在是带样式的那个控件，原生的那个改名 `NativeSelect`。旧的默认值在打开的那一刻就不再属于这套系统了——选项列表是操作系统画的，一个 token 都不读。坚持用原生唯一站得住的理由是键盘约定，而 Radix 把它答上了：首字母跳转、方向键、Home 和 End、以及按 Escape 不选任何东西地关掉。',
  '04417a5f':
    '`Slider` 显示的数字从来不动。它是从 props 上读值的，而一个非受控滑块的 `defaultValue` 不会变——于是滑块在走、数字停在起点，而这恰恰是 `showValue` 存在的意义所要防止的事。',
  ec855ec9:
    '`ToggleGroup` 不管装一个值还是好几个值，长得都一样，所以多选组看起来像坏掉的单选组。现在单值的那条会把**一颗**胶囊在选项之间移动，多值的那条则分别填充每个被按下的选项。`Pagination` 同样处理：一个会移动的形状读起来就是“变的是这个”，而两块背景交叉淡入读起来是两件事。',
  '0a14af02':
    '`Combobox` 可以取多个值，选的时候面板不会关，并且把命令列表裁到自己的圆角里——之前列表的直角一直从面板的圆角里戳出来。',
  e8b25ab4:
    '`Calendar` 改用月份和年份下拉来导航，而不是两个箭头。点二十四下才回到两年前，那不叫导航。它的导航条之前还压在网格上方而不是标题两侧，因为 nav 在 DOM 里排在前面，而且被留在了正常流里。',
  a2d45c1a:
    '新增 `DateRangePicker`。它同时显示两个月，并且只有在真的点过两天之后才关闭——库在**第一次**点击时就会返回 `{ from, to }`，所以一个“是否完整”的判断会立刻把面板关掉，每次都得到一个一天的范围。',
  '432619f4':
    '`Switch` 的滑块在移动时会变窄，`Slider` 的滑块被按住时会变大，所以两者读起来都是“有个东西正在被移动”，而不是一个值忽然跳到了新状态。',

  '345a9217': '把每一个表示“被选中”的表面都接到那唯一的指针上。',
  '3ef99ad7':
    '法则 7 说这套系统只有一个指针，而这个指针就是墨色。可有一半组件是直接读 `--ink` 的——主按钮、勾选框、当前标签页、当前页码、滑块的已填充段、被选中的日期。在强调色**就是**墨色的时候，两者渲染出来一模一样，这正是没人发现的原因，也是为什么这条法则在原则页上成立、在代码里不成立。',
  '90105f6a':
    '它们现在读 `--accent`。默认值下什么都没变，而重新指向这一个 token 就能给整套系统换皮，不用碰任何组件——这才是“有一个指针”的意义。',

  '6b83a24d': '浮层和流体尺度都可以重新挂到一个有边界的框上。',
  d0a67543:
    '新增 `OverlayContainer`：指明 `Popover`、`Select`、`DropdownMenu`、`ContextMenu` 和 `Tooltip` 应该渲染进哪个元素。面板于是跟那个元素的边界碰撞，而不是跟视口，并且会继承它上面设的 `dir` 和 `data-density`。`Dialog` 和 `Sheet` 仍然覆盖整个视口——它们本来就是干这个的。',
  f73437e8:
    '新增 `--fluid` token，默认 `1vw`。一个声明了 `container-type: inline-size` 的框，只要在它内部某个带 `data-fluid-frame` 的元素上把 `--fluid` 设成 `1cqi`，整条字号与间距的坡道就会重新以这个框的宽度为基准。',
  '9f7a38e7':
    '`FigureBand` 是一个查询容器，读的是它自己的宽度，所以“一排放四个数字”是关于这条带子的决定，而不是关于窗口的。',

  '0181fe40': '改为公开发布到 npmjs，不再发到 GitHub Packages。',
  ea0872f6:
    '这个仓库已经公开、并且是 MIT 协议有一阵子了，但它发出去的包却被限制在一个需要 token 才能读的 registry 上——于是安装说明与其说是一条命令，不如说是一道门。现在它带着 `access: public` 发到默认 registry，任何客户端不用 `.npmrc` 就能读。',
  e7b51d98:
    '对已经在安装它的人有两点影响。scope 不再需要指向任何地方，所以消费方 `.npmrc` 里的 `@misoto22:registry` 和 `_authToken` 两行可以删掉；而已经发到 GitHub Packages 的那些版本原地不动——没有搬迁任何东西，`0.3.0` 是 npmjs 上的第一个版本。',
  f2c4913f:
    'manifest 里的 `description` 也改了。它、仓库的 About 字段、README 的开头各写着一句不同的话，所以其中总有两句是过时的；现在三处说同一句，而且不再带组件数量——一个写在 manifest 里的数字没有任何东西能校对它，事实上已经差了两个。',

  d8e562ba: '新增 `themes.css`：主题不再只是强调色。',
  '65d60ced':
    '六条轴，每一条都是一个属性，把包里已经定义好的 token 重新指向别处——`data-surface`、`data-radius`、`data-rules`、`data-type`、`data-motion`，以及已有的 `data-density`。没有任何组件读它们，这一层也不引入自己的 token；主题是重新指向，不是发明。',
  '90367361':
    '没有任何东西锚定在 `:root` 上，所以一条轴可以放在任意元素上，它下面的子树就跟着变。正是这一点让一个页面能并排印出五种主题，而不需要五个文档。',
  dea0c449: '可以通过 `@misoto22/design/themes.css` 单独引入，也已经打包进 `styles.css`。',

  // ─── 0.2.0 ───
  '922cdf32': '新增十一个组件，并让表格真正做到一张表格该做的事。',
  '813f033a':
    '`Popover`、`Sheet`、`ContextMenu`、`Command`（⌘K 面板）、`Combobox`、`Slider`、`ToggleGroup`、`Collapsible`、`ScrollArea`、`Calendar` 和 `DatePicker`。每一个都写清楚了它最容易和哪个邻居混淆，因为真正有意思的问题很少是“它长什么样”：气泡提示装不下控件；只有一项的手风琴在管理一个没人会读的值；选项不到十几个时原生 select 胜过 combobox；分段控件改的是一个值，而标签页换的是一块面板。',
  '949f8731':
    '`Table` 有了可排序的表头和吸顶的表头行。排序控件是 `<th>` 里面的一个 `<button>`，而不是挂在单元格上的点击回调——带 `onClick` 的单元格既不可聚焦也不会被播报，那样的排序只对鼠标存在——并且它会设置 `aria-sort`，这是读屏用户得知这张表已被排序的唯一途径。',
  '0ce4d9cf':
    '`Dialog` 增加了 `hideTitle`，用于那些“看得见的人一眼就明白它是干什么的”的界面。标题本身仍然是必填的。',
  bfeb0064:
    '浏览器测试在合入路上抓到的两个缺陷：日历里非本月的日期用描边色画，对比度只有 1.38:1；以及 `cmdk` 会在 `role="listbox"` 里面渲染一个 `role="separator"`，这是 ARIA 明令禁止的，等于在每一个命令面板里塞了一条严重级别的违规。',

  '9055034c': '加入密度轴，让每个组件都与书写方向无关，并把 token 以机器可读的形式发出去。',
  f41ae1da:
    '任意容器上写 `data-density="compact"`，它下面的每个控件都会收紧——默认 44px，这是 WCAG 2.5.5 要求的指针目标；紧凑模式 36px，仍然满足 2.5.8，但不再满足 2.5.5。它是给鼠标驱动的密集桌面工具用的，文档如实这么写，而不是把它说成白拿的好处。',
  '4c73d817':
    '每个组件现在都用逻辑属性，所以 `dir="rtl"` 不需要任何额外样式表就能镜像整套系统。一个源码测试会在出现物理属性、或出现没有配对 `rtl:` 的行内轴 transform 时让构建失败；另一个浏览器测试检查结果是否真的镜像了——这是源码测试做不到的。',
  d090c1e5:
    '`@misoto22/design/tokens` 导出每一个 token 及其亮色值、暗色值、分类和解释性注释，既有 JSON 也有带类型的模块——供 Figma 同步、原生应用，或者任何需要这些值却读不了样式表的消费方使用。文档站现在读的是这份产物，而不是再解析一遍 CSS，所以站点和包不可能再对“某个 token 是什么”产生分歧。',
  '87103575':
    '`FloatingIconButton` 的 `position` 从 `left` / `right` 改成了 `start` / `end`，这样这个 API 就不会把某一种文字方向写死。',

  a2fda076:
    '给这个包补上许可证、发布目标和更新日志。它采用 MIT 协议，以 `@misoto22` scope 发布到 GitHub Packages，并由 changesets 管理版本——这样使用者既能装得上，也能不翻提交记录就知道两个版本之间改了什么。',
  '875b5289': '给构建加上体积与 tree-shaking 预算（`pnpm check:size`）。',
  c081a887:
    '绝对数字是无聊的那一半，有用的是比例：把单个组件打包出来跟整个包比，是唯一能发现 tree shaking 已经悄悄失效的办法——一次桶文件导入、入口里一个副作用，每个使用者就都会为了渲染一个徽章而把整个日历打进去。这种事在代码评审里看不见，几个月后才以“谁也解释不了的包体积”的形式冒出来。',
  d12c564f: '修复三个只有真实浏览器能看见、jsdom 测试看不见的缺陷。',
  e2c68ef8:
    '`Table` 的滚动容器键盘够不着：一个可滚动区域，如果里面的内容本身不可聚焦，就没有任何东西可以 Tab 过去，于是对不用鼠标的人来说，折叠线之外的每一列都不存在。现在它是一个可聚焦、有名字的区域。',
  '5e7ce649':
    '`RadioGroup` 用方向键移动了焦点，却没有移动选中项。上游原语把这件事挂在一个由 `keyup` 清除的标志上，而它跑不赢自己的焦点移动——一次正常的按键在 React 提交之前就已经抬起，所以外框移动了、什么都没被选中。改成用时间戳记录，就不会在焦点处理器脚下被清掉。',
  c03ed7f7:
    '`AppShell` 会渲染一个 `<main>`，这对一个应用外壳是对的，对一个嵌在别的页面里的外壳是错的——一个文档只能有一个。现在它接受 `contentAs`。',

  // ─── 0.1.0 ───
  '9000ad5d': '第一个与它从中抽取出来的那个站点相符的版本。',
  '1d662f45':
    '**把 token 层重新移植到白色重置。** 这个包一直发的是已经退役的暖奶油主题——oklch 表面、8/12/18px 的圆角刻度、带模糊的高度坡道。任何照着它做出来的东西，从构造上就是偏离品牌的。',
  '11b8ec17':
    '**把 token 和语义拆开。** `tokens.css` 放原始值，`semantic.css` 放角色，组件只读角色——正是这一点让暗色模式成为一次数值互换，而不是第二套配色。',
  c4e3a74d:
    '**换掉了字体**，改用 Hanken Grotesk、Newsreader 和 IBM Plex Mono，由一个脚本负责内嵌并管理字重清单。',
  '20fc95b4':
    '十四个原语：`Skeleton`、`Progress`、`Alert`、`Tooltip`、`Table`、`Breadcrumb`、`Pagination`、`Accordion`、`RadioGroup`、`Avatar`、`Separator`、`Kbd`、`LinkArrow`、`FigureBand`。',
  b059f49f: '`cn`——现在每个组件的 class 列表最后都要经过的那个合并器。',
  f1cab993: '`CONTROL_BASE` / `CONTROL_BORDER` / `isInvalid`——共用的文本控件外观。',
  '09d6f69f':
    '一个文档站，地址是 [ui.misoto22.com](https://ui.misoto22.com)，由这个包自己的源码生成。',
  '578ab284':
    '**在没有 `next/font` 的宿主里，字体栈会整条塌回系统字体。** 没有兜底的 `var(--font-hanken)` 在计算值阶段就是无效的，而 IACVT 丢掉的是整条声明，不是那一项。',
  '44995bbe':
    '**每一个 `hover:shadow-(--shadow)` 都是空转。** 这个 token 解析出来是 `none`，所以那些悬停状态一直是看不见的，却还在为一次过渡付费。',
  b42e8429:
    '**调用方传的 `className` 不一定能覆盖。** `clsx` 会把冲突的两边都输出，然后交给样式表顺序去裁决；`cn` 按工具类分组合并。',
  c243e6f2:
    '**没有显式 `htmlFor` 时，`Field` 什么都不播报。** 提示信息的 id 是从它推出来的，所以提示渲染出来了，却从来没有被念过。',
  '62d0c9f8': '**省略 `icon` 时 `NavItem asChild` 什么都不渲染**——两个子元素进了一个只允许一个的 Slot。',
  '7fe8f132':
    '**Input、Textarea 和 Select 已经各走各的了**：聚焦和禁用的处理各不相同，每个都揣着一份自己的控件 class 字符串。',
  '9eb63729': '`Spinner` 是一个强调色的环，而这套系统的强调色是墨色。',
}

/** The English a translation was made from, for the orphan check. */
export const CHANGELOG_ZH = ZH

/**
 * The Chinese for one changelog string, or the English when there is none.
 *
 * Falling back rather than failing is the point: an untranslated line is
 * readable, and a stale one is not.
 */
export function changelogText(locale: Locale, english: string): string {
  if (locale !== 'zh') return english
  return ZH[fingerprint(english)] ?? english
}
