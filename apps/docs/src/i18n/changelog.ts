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
 * `changelog.test.ts` therefore gates two things and not a third. It fails on
 * an ORPHAN — a translation whose English no longer exists anywhere, which is
 * certainly a mistake rather than a backlog — and on the LATEST release being
 * short a line, because a release the page leads with reading half in English
 * is worse than one that reads wholly in English. An older release missing a
 * line is neither; it falls back and stays readable.
 *
 * Note when the second one can first fail. `CHANGELOG.md` is written by the
 * Version Packages pull request, which is opened by `GITHUB_TOKEN` and so
 * carries no checks — the strings therefore first exist, and this file is
 * first found wanting, on the `main` run that was about to publish. That run
 * is the publish. Translate a release when its version bump merges, or the
 * publish is what stops. See `docs/releasing.md`.
 */
const ZH: Record<string, string> = {
  // ─── 0.7.0 ───
  [fingerprint(
    'Add `@misoto22/design/diagrams`: five diagram figures and the chrome to explore one.',
  )]: '新增 `@misoto22/design/diagrams`：五种图示，以及把其中一张读下去所需的那套外围界面。',
  [fingerprint(
    '`ArchitectureFigure`, `WorkflowFigure`, `SequenceFigure`, `DataflowFigure` and `LifecycleFigure` render the JSON schemas published by [archify](https://github.com/tt-a1i/archify), so a specification authored for that tool renders here with no translation step — in this system\'s own terms rather than in archify\'s palette. Where archify separates seven kinds of node by hue, these carry the kind twice, as a drawn sigil and as a word on the plate\'s eyebrow, so the distinction survives a greyscale print and a colour-blind reader. The only colour any of them spends is `--success` and `--danger` on a terminal lifecycle state, which is what those two tokens were reserved for.',
  )]: '`ArchitectureFigure`、`WorkflowFigure`、`SequenceFigure`、`DataflowFigure` 和 `LifecycleFigure` 渲染的是 [archify](https://github.com/tt-a1i/archify) 公布的那几份 JSON schema，所以一份为那个工具写的规格，不经任何转换步骤就能在这里画出来——而且用的是这套系统自己的语汇，而不是 archify 的配色。archify 靠七种色相把七类节点分开；这里则把类别说两遍——一个画出来的记号，加上底板引题上的一个词——于是这个区分挺得过一次灰度打印，也挺得住一位色盲读者。它们唯一花掉的颜色，是终态生命周期状态上的 `--success` 和 `--danger`，而这两个 token 当初留出来就是为了这个。',
  [fingerprint(
    'Every position comes out of the specification, so the figures render on a server and produce identical markup twice — there is no layout to do and therefore no shift on hydration. The `<svg>` is `role="img"` with a name, and each figure publishes its nodes and relationships beside it as an ordinary list; passing `onSelectNode` turns that list into the keyboard\'s route to a selection.',
  )]: '每一个位置都出自那份规格，所以这些图能在服务端渲染，两次产出的标记完全一致——压根没有布局要做，因此水合时也不会有任何抖动。`<svg>` 是带名字的 `role="img"`，而每张图都会把自己的节点和关系当成一份普通列表，一并陈列在它旁边；传入 `onSelectNode`，这份列表就变成键盘通往一次选中的那条路。',
  [fingerprint(
    '`DiagramCanvas`, `DiagramToolbar`, `DiagramExportMenu`, `DiagramInspector`, `DiagramMinimap` and `DiagramLegend` are the reader-facing half: pan and zoom, a grouped action bar, PNG / JPEG / WebP / SVG / share-card export with the theme\'s custom properties baked into real colours, a detail panel and an overview map.',
  )]: '`DiagramCanvas`、`DiagramToolbar`、`DiagramExportMenu`、`DiagramInspector`、`DiagramMinimap` 和 `DiagramLegend` 是面向读者的那一半：平移与缩放、一条分了组的动作栏、把主题的自定义属性烘成真实颜色的 PNG / JPEG / WebP / SVG / 分享卡导出、一块详情面板，以及一张总览地图。',
  [fingerprint(
    'They ship from their own entry point so a page rendering a `Badge` does not pay for a routing engine; `check-size` fails if they ever leak into the main barrel. The shared SVG export helpers now live in `src/lib/svg-export.ts`.',
  )]: '它们从自己的入口点发出，这样一个只渲染 `Badge` 的页面就不会为一台布线引擎付钱；一旦它们漏进主 barrel，`check-size` 就会红。共享的 SVG 导出辅助函数现在住在 `src/lib/svg-export.ts` 里。',
  [fingerprint(
    'Fold the chart PNG export onto the shared SVG export.',
  )]: '把图表的 PNG 导出并到共享的 SVG 导出上。',
  [fingerprint(
    '`charts/lib/export.ts` and `lib/svg-export.ts` each carried the same computed- style walker, the same standalone-document builder and the same canvas rasteriser — arrived at independently, for charts and for diagrams, and already diverging: the shared copy had picked up `marker-start`/`mid`/`end`, without which an exported arrow comes out headless. Two copies of a paint walker means the next fix lands in one of them.',
  )]: '`charts/lib/export.ts` 和 `lib/svg-export.ts` 各自带着同一个计算样式遍历器、同一个独立文档构造器，以及同一个 canvas 栅格化器——一个为图表、一个为图示，各自独立地走到了这里，而且已经开始分岔：共享的那一份已经补上了 `marker-start`/`mid`/`end`，少了它，导出来的箭头是没有头的。一个上色遍历器存着两份拷贝，意思就是下一次修复只会落进其中一份里。',
  [fingerprint(
    'The chart module keeps only what a Recharts chart knows and a diagram does not: which `<svg>` in the subtree is the plot, what a row of chart data looks like as a CSV record, and that the ground behind an exported plot is `--chart-surface`. It is 387 lines down to 182, and `chartToPng`\'s signature is unchanged.',
  )]: '图表模块只留下「Recharts 图表知道、而图示不知道」的那些事：子树里哪一个 `<svg>` 才是绘图区、一行图表数据写成 CSV 记录长什么样，以及导出的绘图区背后那层底是 `--chart-surface`。387 行降到 182 行，而 `chartToPng` 的签名没有变。',
  [fingerprint(
    '`findPlotSvg` now has a test, which it did not before. Both of its narrowings are load-bearing and each fails the same silent way — the toolbar sits outside the plot wrapper and every control in it is an `<svg>`, the legend draws its swatches inside it — so an export that skipped either one would be a picture of an icon, which looks like a working download until somebody opens the file.',
  )]: '`findPlotSvg` 现在有测试了，之前没有。它的两处收窄都是承重的，而且各自都以同样一种无声的方式失败——工具栏坐在绘图区包装层外面，而它里面每一个控件都是一个 `<svg>`；图例则把自己的色块画在包装层里面——所以一次跳过其中任何一处的导出，出来会是一张图标的图片，而它看上去和一次正常的下载没有区别，直到有人真的打开那个文件。',
  [fingerprint(
    'Two visible differences, both from the shared serialiser: the exported title band is 34px at 15px rather than 30px at 13px, and a chart exported before it has been measured now says `serializeSvg:` rather than `chartToPng:` in the error it throws.',
  )]: '两处看得见的差别，都来自那个共享的序列化器：导出的标题带从 30px 高、13px 字号变成 34px 高、15px 字号；而一张还没被测量就被导出的图表，现在抛出的错误里写的是 `serializeSvg:` 而不是 `chartToPng:`。',

  // ─── 0.6.1 ───
  [fingerprint(
    'Fix the `Import:` line the offline documentation prints for a chart.',
  )]: '修正离线文档给图表打印的 `Import:` 那一行。',
  [fingerprint(
    '`dist/agent/AreaChart.md` said `import { AreaChart } from \'@misoto22/design\'`, which throws. Charts ship from `@misoto22/design/charts` behind optional peers, and that separation is the whole reason an app rendering a Badge never resolves `recharts` — so the root barrel does not export them and never will. Twenty components carried the wrong line, in the tarball and in the site\'s `llms.txt` alike. It is the one line an agent pastes without checking.',
  )]: '`dist/agent/AreaChart.md` 写的是 `import { AreaChart } from \'@misoto22/design\'`，而这句会 throw。图表从 `@misoto22/design/charts` 发出，后面挂着可选 peer，而这道分界线的全部意义就在于：一个只渲染 Badge 的应用永远不会去解析 `recharts`——所以根 barrel 不导出它们，将来也不会。二十个组件带着错的那一行，npm 包里和站点的 `llms.txt` 里都是。而这恰恰是 agent 会直接粘走、不会去核对的一行。',
  [fingerprint(
    'Which specifier a component is imported from is now derived from the tree its directory sits in — `ENTRY_POINTS` maps each specifier to one directory under `src/`, and nothing is authored per component. The alternative was a field on every entry, which is a second copy of something the filesystem already says. `catalog.test.ts` fails when a catalog entry names no entry point\'s tree.',
  )]: '一个组件从哪个 specifier 导入，现在由它目录所在的那棵树推导出来——`ENTRY_POINTS` 把每个 specifier 映射到 `src/` 下的一个目录，没有任何东西是按组件手写的。另一条路是给每条记录加一个字段，那等于把文件系统已经说过的事再抄一遍。当一条 catalog 记录不属于任何入口的目录树时，`catalog.test.ts` 会红。',
  [fingerprint(
    'The skill was stale in the same direction and is corrected with it: it said 52 primitives when there are 72, never mentioned the charts entry or `@misoto22/design/tokens`, and still offered `data-accent` — an attribute that has never existed, in the same skill whose own `rules/tokens.md` says so. Two tests now hold that line: every specifier in `exports` has to appear in `SKILL.md`, and no skill file may offer `data-accent` as something to set.',
  )]: 'skill 在同一个方向上也过期了，这次一并修正：它写着 52 个 primitive，实际有 72 个；从没提过 charts 入口和 `@misoto22/design/tokens`；还在把 `data-accent` 当成可设的轴列出来——而这个属性从来就不存在，同一个 skill 自己的 `rules/tokens.md` 里就是这么写的。现在有两条测试守着这一点：`exports` 里的每个 specifier 都必须出现在 `SKILL.md` 里，而且任何 skill 文件都不许把 `data-accent` 当作可设置项。',

  // ─── 0.6.0 ───
  [fingerprint('The package documents itself for agents, offline: a `misoto22-design` CLI, a skill, and a README.')]: '这个包现在离线为 agent 记录自己：一个 `misoto22-design` CLI、一个 skill，以及一个 README。',
  [fingerprint(
    'The docs were on a website while the version being written against was in `node_modules`, and neither side could see the disagreement. Everything an agent needs now ships in the same tarball as the source it was generated from.',
  )]:
    '文档在一个网站上，而真正被写代码所针对的那个版本躺在 `node_modules` 里，两边谁也看不见这处分歧。现在 agent 需要的一切，都和生成它的那份源码装在同一个 tarball 里发出去。',
  [fingerprint(
    '`npx misoto22-design docs <Component>` prints one component in full — every prop with its type and default, the exported unions, the keyboard contract, the accessibility promises, the `@example` blocks. The median component is about 500 tokens, against roughly 28,000 for all fifty-two. It resolves parts and types too, so `docs CardBody`, `docs TH` and `docs ButtonVariant` all land on the right file — which is what you have when an import just failed.',
  )]:
    '`npx misoto22-design docs <Component>` 会把一个组件完整打印出来——每个 prop 连同它的类型和默认值、导出的联合类型、键盘契约、无障碍承诺，以及 `@example` 代码块。组件的中位数大约是 500 token，而全部 52 个加起来约 28,000。它同样能解析部件和类型，所以 `docs CardBody`、`docs TH` 和 `docs ButtonVariant` 都会落到正确的那个文件上——而一次 import 刚刚失败时，你手上有的正是这样一个名字。',
  [fingerprint(
    '`npx misoto22-design docs --installed` is the cheap half: the resolved version and every component name, a few hundred tokens.',
  )]:
    '`npx misoto22-design docs --installed` 是便宜的那一半：解析出来的版本号和每一个组件名，几百个 token。',
  [fingerprint(
    '`npx misoto22-design init --agents-md` installs the skill under `.claude/skills/` and points `AGENTS.md` at it. Its name and description are about 110 tokens and are all a session carries until something touches the package; the body and the five rule files load from there.',
  )]:
    '`npx misoto22-design init --agents-md` 会把这个 skill 装到 `.claude/skills/` 下，并让 `AGENTS.md` 指向它。它的名字和描述加起来约 110 token，在有东西真的碰到这个包之前，一个会话随身带的就只有这些；正文和那五个规则文件从那里再往下加载。',
  [fingerprint('`README.md` was listed in `files` and did not exist, so the npm page has been blank. It exists now.')]: '`README.md` 列在 `files` 里，却并不存在，所以 npm 页面一直是空白的。现在它存在了。',
  [fingerprint(
    'Two things the old documentation said were not true. There has never been a `data-accent` attribute — `--accent` is a custom property — and `data-surface="glass"` was never listed, so nothing pointed at an axis value that does work. The axes are now read out of the stylesheets that define them rather than described by hand, and a test fails when the authored half stops matching.',
  )]:
    '旧文档说的有两件事不是真的。从来就没有过 `data-accent` 属性——`--accent` 是一个自定义属性——而 `data-surface="glass"` 从来没被列出来，于是没有任何地方指向一个确实生效的轴值。这些轴现在是从定义它们的样式表里读出来的，而不是靠手写描述；当手写的那一半不再对得上时，会有一个测试失败。',
  [fingerprint('Nothing about the runtime changed: same exports, same CSS, same bundle.')]: '运行时没有任何变化：一样的导出、一样的 CSS、一样的打包产物。',
  [fingerprint('Add twenty data-visualisation primitives.')]: '新增二十个数据可视化原语。',
  [fingerprint(
    'Sixteen ship from a new `@misoto22/design/charts` entry with `recharts` and `motion` as OPTIONAL peer dependencies — `AreaChart`, `BarChart`, `LineChart`, `ComposedChart`, `ScatterChart`, `PieChart`, `RadarChart`, `RadialChart`, `FunnelChart`, `TreemapChart`, `SankeyChart`, `BoxPlot`, `Histogram`, `WaterfallChart`, `Facet` and the toolbar-driven zoom — each a compound component composed from axes, grid, tooltip, legend, dots, a background plate and a keyboard-driven zoom brush. The main entry and its size budget are unchanged: an app that renders a Badge does not pay for a rendering engine.',
  )]: '其中十六个来自新的 `@misoto22/design/charts` 入口，`recharts` 和 `motion` 是**可选**的 peer 依赖——`AreaChart`、`BarChart`、`LineChart`、`ComposedChart`、`ScatterChart`、`PieChart`、`RadarChart`、`RadialChart`、`FunnelChart`、`TreemapChart`、`SankeyChart`、`BoxPlot`、`Histogram`、`WaterfallChart`、`Facet`，以及由工具栏驱动的缩放——每一个都是一个复合组件，由坐标轴、网格、tooltip、图例、点、一块背景板和一把键盘驱动的缩放刷子组合出来。主入口和它的体积预算没有变：一个只渲染 Badge 的应用，不会为一台渲染引擎付钱。',
  [fingerprint(
    '`Heatmap`, `Sparkline`, `BarList`, `BigNumber` and `BulletChart` ship from the same entry and need NO engine at all. The heatmap is a real `<table>` with weighted cells, so the structure a screen reader walks is the structure the eye reads; the sparkline is one `<path>`, so a hundred of them in a table cost nothing.',
  )]: '`Heatmap`、`Sparkline`、`BarList`、`BigNumber` 和 `BulletChart` 从同一个入口发出，而且**完全不**需要引擎。热力图是一张真正的 `<table>`，格子按轻重着色，所以读屏软件走过的结构就是眼睛读的结构；迷你折线就是一条 `<path>`，所以在一张表格里放一百条也不花什么代价。',
  [fingerprint(
    'The token layer gains a data block: `--series-1` … `--series-8` (a neutral ramp whose adjacent steps clear ΔE 21 and 3:1 on their own ground), the `--chart-*` roles, and `--chart-fill` / `--chart-texture` — the only tokens in the system that hold different numbers on the two grounds, because ink at 14% over paper is a legible band and paper-white at 14% over near-black is nothing. Texture is the primary carrier of series identity; the ramp supports it. `data-chart-palette` is a seventh theme axis that swaps the ramp for a validated categorical palette.',
  )]: 'token 层多了一块数据部分：`--series-1` … `--series-8`（一条中性色阶，相邻两级之间过 ΔE 21，而且每一级在自己的底色上都过 3:1）、`--chart-*` 这组角色，以及 `--chart-fill` / `--chart-texture`——它们是整套系统里唯一在两种底色上取不同数值的 token，因为墨色以 14% 压在纸白上是一条读得出的带，而纸白以 14% 压在近黑上什么都不是。纹理才是序列身份的第一载体，色阶是给它托底的。`data-chart-palette` 是第七条主题轴，把这条色阶换成一套验证过的分类色板。',
  [fingerprint(
    'Every chart requires a `title`, renders its rows again as a visually hidden table, and drops its intro animation under `prefers-reduced-motion`.',
  )]: '每一张图都必须有 `title`，都会把自己的数据行再渲染一遍成一张视觉上隐藏的表格，并且在 `prefers-reduced-motion` 下丢掉入场动画。',
  [fingerprint(
    'Borrowed from a survey of the field, and each one fixing something that was missing rather than adding a variant:',
  )]: '以下这些借自对这个领域的一轮普查，而且每一项补的都是一处缺失，而不是多加一个变体：',
  [fingerprint(
    '**An annotation layer** — `ReferenceLine`, `ReferenceBand` and `Annotation` on every cartesian chart, stacked in the order editorial charting settled on (band behind the grid, line above the marks, note above both). Most charts that look like they need a second series need a target line instead.',
  )]: '**一层注记**——每一张笛卡尔图表上都有 `ReferenceLine`、`ReferenceBand` 和 `Annotation`，按编辑类制图最后定下来的顺序叠放（带在网格后面，线在标记上面，注解在两者之上）。大多数看起来需要第二条序列的图，需要的其实是一条目标线。',
  [fingerprint(
    '**Axis titles** (`<Chart.XAxis label>`), because an axis reading 0 · 100 · 200 says nothing about whether those are people, milliseconds or dollars.',
  )]: '**坐标轴标题**（`<Chart.XAxis label>`），因为一根读作 0 · 100 · 200 的坐标轴，完全没说这些到底是人数、毫秒还是美元。',
  [fingerprint(
    '**Selective value labels** — `<Chart.Values show="last | first-last | extremes | all">`. The default prints one number, not one per point.',
  )]: '**有选择的数值标签**——`<Chart.Values show="last | first-last | extremes | all">`。默认只印一个数字，而不是每个点印一个。',
  [fingerprint(
    '**`formatNumber`** with compact, percent, currency, duration and byte styles, and a compact default on every value axis above four digits.',
  )]: '**`formatNumber`**，带紧凑、百分比、货币、时长和字节几种写法，并且在每一根超过四位数的数值轴上默认走紧凑写法。',
  [fingerprint(
    '**An empty state.** `data: []` now renders `ChartEmpty` rather than a bare pair of axes, which is indistinguishable from a failed load.',
  )]: '**一个空状态。** `data: []` 现在渲染的是 `ChartEmpty`，而不是光秃秃的一对坐标轴——后者和一次加载失败根本分不出来。',
  [fingerprint(
    '**Forced-colours support** in `tokens.css`. Browsers do not remap SVG, so the chart tokens re-point onto system colours there and texture carries the series apart; `Heatmap` reveals its numbers, since its wash is gone.',
  )]: '**强制颜色模式的支持**，写在 `tokens.css` 里。浏览器不会重新映射 SVG，所以图表 token 在那里改指向系统颜色，由纹理把各条序列分开；`Heatmap` 则把自己的数字亮出来，因为它那层色底已经没了。',
  [fingerprint(
    '**`BarList`** — a ranked list with the bar behind the name, which a horizontal bar chart cannot do.',
  )]: '**`BarList`**——一个排行榜，条形在名字后面，而这是横向柱状图做不到的。',
  [fingerprint(
    '**`BigNumber`** — one figure at headline size with a delta whose direction is stated by the call site, never inferred from the sign.',
  )]: '**`BigNumber`**——一个用标题字号印出来的数字，配一个变化量，它的方向由调用处说明，绝不从正负号推断。',
  [fingerprint(
    '**`BulletChart`** — Stephen Few\'s replacement for the dashboard gauge: a measure, its target and its qualitative bands in the height of a line of text. Plain HTML, so ten of them stack into a status page for free.',
  )]: '**`BulletChart`**——Stephen Few 用来取代仪表盘表盘的那个东西：一个度量、它的目标值，以及它的定性区间带，都装在一行文字的高度里。纯 HTML，所以十个叠起来就白得一页状态页。',
  [fingerprint(
    '**The statistical family** — `BoxPlot`, `Histogram` and `WaterfallChart`. Each documents what it HIDES rather than only what it shows: a box cannot tell one hump from two, a histogram\'s shape is a property of its bin width, and a waterfall\'s connectors imply a sequence most breakdowns do not have.',
  )]: '**统计那一族**——`BoxPlot`、`Histogram` 和 `WaterfallChart`。每一个都把自己**藏起来**的东西写进文档，而不只写它展示了什么：一个箱子分不出一个峰和两个峰，一张直方图的形状是它分箱宽度的属性，而一张瀑布图的连接线，暗示着大多数拆解压根没有的先后顺序。',
  [fingerprint(
    '**`Facet`** — the same chart once per group on one shared scale, which is the answer to eight series overplotted into a hairball. The shared domain is the default: on independent scales a group peaking at 40 and one peaking at 4,000 draw the same shape, and the comparison is not merely lost but inverted.',
  )]: '**`Facet`**——同一张图每组重复一次，共用同一把刻度，这就是八条序列叠画成一团乱麻的答案。共享 domain 是默认：刻度各自独立时，一组峰值 40 和一组峰值 4,000 画出来是同一个形状，而比较不只是丢了，是反过来了。',
  [fingerprint(
    '**Sonification** — `<Chart.Sonify>` plays a series as pitch over time for a reader who cannot see the plot. Never autoplays; sound only ever starts from an explicit user action, which is a different question from `prefers-reduced-motion`.',
  )]: '**声音化**——`<Chart.Sonify>` 把一条序列播成随时间变化的音高，给看不见这张图的读者。从不自动播放；声音永远只从一次明确的用户操作开始，而这和 `prefers-reduced-motion` 是两个不同的问题。',
  [fingerprint(
    '**A chart toolbar** — step zoom, reset, and taking the figure away as a PNG or a CSV. Capped at five controls with no overflow menu, so a cartesian chart does not statically reach a menu component every consumer would then ship. Zoom and the brush drive ONE window, so they cannot disagree.',
  )]: '**一条图表工具栏**——步进缩放、重置，以及把这张图作为 PNG 或 CSV 带走。上限五个控件，不带溢出菜单，这样一张笛卡尔图表就不会静态地依赖到一个菜单组件、逼得每个使用者都把它打包进去。缩放和刷子驱动的是**同一个**窗口，所以它们不可能互相矛盾。',

  // ─── 0.5.0 ───
  [fingerprint('`AppShell` takes `sidebarLabel`, `navLabel`, `openLabel` and `closeLabel`.')]:
    '`AppShell` 接受 `sidebarLabel`、`navLabel`、`openLabel` 和 `closeLabel`。',
  [fingerprint(
    'Both landmark names were hardcoded English. Two `complementary` landmarks with the same name cannot be told apart, which is exactly the pair a shell rendered inside another page makes — a preview, a screenshot harness — and it was the only part of the component a non-English app could not translate.',
  )]:
    '两个地标的名字之前都是写死的英文。两个同名的 `complementary` 地标是无法区分的，而一个渲染在另一个页面内部的外壳——一个预览、一套截图夹具——造出来的恰好就是这一对；这也是这个组件里唯一一处非英语应用翻译不了的地方。',

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

  // ─── 0.4.0 ───
  cd289de0:
    '一条由一个因子驱动的圆角阶梯、一本用选月份代替翻月网格的日历、一个长文阅读面，以及一条编号轨——给那些图不该拿去画的顺序用。',
  '26d31c1e':
    '**圆角现在是一条阶梯，一个主题只改一个数。** 原来四档是四个彼此独立的值，圆角主题把四个全部重打一遍——于是没有任何东西维持它们之间的比例，一个嵌在另一个里面的圆角，只在某个有人检查过的设置下是对的，在其余每一个设置下都是错的。现在每一档都是 `calc(<n>px * var(--radius-factor))`——4、6、8、12 加上胶囊，而这几个数正是 Tailwind 的刻度、shadcn 的 `--radius` ± 2 和 ± 4、Radix Themes 的第 3、第 4 档，以及 Material 的 `xs`/`sm`/`md` 彼此相差不超过一个像素的地方。`sharp` 把因子设成 `0`，`round` 设成 `2`；胶囊和其它所有东西一样待在这条阶梯上：一个把每个按钮都留成胶囊的方形主题，不是方形主题。真正的圆——头像、状态点、加载圈、单选框——是几何，所以还是圆的。',
  '652a3af8':
    '**`Button` 现在画 `--radius`，也就是控件那一档**，和它旁边的 `Input`、`Select` 触发器、`Textarea` 画的是同一个角。它以前是胶囊，而一个胶囊挨着一个 8px 的输入框，是对「控件是什么」的两种不同说法——这是整套系统里每个读者都注意到、却没有任何一个组件页解释得了的那处不一致。胶囊留给那些本来就是胶囊的东西：徽章、状态胶囊、分段控件、进度条。`Calendar` 自己的那几个控制按钮跟着一起改了，而且它标题栏的箭头现在和旁边的月份一样高，不再高出十个像素。',
  aeed6e28:
    '两条相隔 `p` 的圆角边，只有当内圆角等于外圆角减去 `p` 时才是同心的。两个方向都起了名字，而不是留给每个表面自己去猜：`--radius-row` 做减法（一个内边距 6px 的面板里的一行），`--radius-frame` 做加法（一个套在 `--radius-lg` 面板外 16px 的框），做加法的那个带了闸门，所以方形主题仍然是方的。菜单、浮层、下拉和命令面板现在面板用 `--radius-lg`、行用 `--radius-row`，这一对在每一个设置下都真的成立。',
  '57fb5882':
    '这条阶梯为 `:root` **和** `[data-radius]` 各声明了一次。自定义属性是在它被声明的地方代入 `var()` 的，所以一条只写在根上的阶梯会把根的因子烘进去，一棵带主题的子树永远够不到自己的那个——而主题页做的正是这件事：五个包装元素上五种圆角。',
  c1e609a7:
    '**新增 `Article`**——长文阅读面。一条 Markdown 管线能产出的一切，都套上这套系统的字体、颜色和线：标题和它们的锚点、列表、表格、引文、代码、图注、脚注，以及 MathML。这套样式单独发布为 `@misoto22/design/article.css`，并且限定在一个 data 属性下，所以一个自带管线的站点可以只拿阅读面、不拿组件。',
  a99fd011:
    '**新增 `Diagram`**——一张用系统自己的零件画出来的流程图或架构图。嵌套即包含，箭头是相邻兄弟之间的一步；它接受一份 spec 而不是标记，所以文章里的 diagram 代码块和页面上手写的图是同一个渲染器，而且因为它是标记而不是画布，服务端就能渲染。',
  f92bda38:
    '**`Calendar` 用选月份代替了翻月网格。** 月份和年份原来是两个 `Select`，它们会把一个十来 rem 高的列表 portal 到日历上方——十二个月里只看得见三个，两端各一个滚动箭头，而且正盖在读者打开它就是为了改的那个东西上面。标题栏现在是一个控件，写着「2026 年 9 月」，点开它会把日期网格换成同样大小的 3×4 月份网格或 4×6 年份网格。没有东西重叠，没有东西要滚动，Escape 关掉它并把焦点交还；年份分页从范围的第一年开始铺，所以跨度里的每一年都够得到——旧的那套会给出一个它从来不显示的年份。',
  '087d657a':
    '这个选择器是在浏览，不是在导航。步进年份只是把箭头下面的网格换掉，日历留在原处，所以一次点击只做一件事：选中一个月份才会移动日历并关掉面板。旧的做法是点箭头就导航加关闭，意思是在「2026」上点 `‹`，读者会发现自己在看另一个月，而选择器已经没了。',
  '9a45dde7':
    '**新增 `Steps`**——把一个编号序列画成一条轨：一个标记、一条穿过它们的线、一个名字，和一行细节。这是技术页面在图之后会伸手去拿、而它本身并不是图的那种图形，因为没有任何东西分叉、也没有任何东西指向任何东西；用方框加箭头去画一个顺序，说的是另一回事。它是一个 `<ol>`，连接线挂在条目上，所以线停在两个标记之间，而不是从头贯穿到底再甩出去。',
  '6cd58766':
    '**新增浮层表面的 token，以及一个把它们花出去的 glass 主题。** `--panel-bg`、`--panel-border` 和 `--panel-filter` 说的是一个浮着的表面用什么填充、以及它对身后的东西做什么——由 `Dialog`、`Sheet`、`Popover`、`DropdownMenu`、`ContextMenu`、`Select` 和 `Command` 读取，而任何待在页面里的东西都不读，因为一张卡片身后没有东西需要处理。三个默认都取普通表面；而 `--panel-filter: none` 不是「模糊半径为零」：任何 `backdrop-filter` 值都会把它所在的元素提升成一个合成层，并让它成为 fixed 后代的包含块——这是每一个菜单都要为一个大多数读者从不打开的主题付的代价。',
  d9a77cf9:
    "`[data-surface='glass']` 随后设置一块半透明面板、一道高光边，以及 `blur(20px) saturate(180%)`。它没有破坏第 2 条法则：这团模糊不是垫在一个表面**下面**假装成阴影，而是在它**后面**。阴影宣称有一个这套系统并不存在的光源；一块磨砂面板宣称的是一种材质，并且诚实地说出：页面仍然在它后面。",
  '1a5f15fb':
    '`Collapsible` 现在也导出 `CollapsibleTrigger` 和 `CollapsibleContent`，给需要自己排版头部的展开块用。',
  '81e91548':
    '**`FigureBand` 又能排到四列了。** 它的容器查询声明在它自己要查询的那个元素上，而这永远不可能匹配，于是这条带子在任何宽度下都停在两列——整页宽的四张图排出来是一个 2×2 的块，中间还空着一处。',

  e26beae7: '`ToggleGroup` 的滑动胶囊，在缩放过的容器里也能落在自己那一段上了。',
  c352b760:
    '指示器用 `getBoundingClientRect` 测量，它报的是视觉像素；又用 `transform` 定位，而 transform 是在元素自己的坐标系里解释的。在任何被缩放过的东西里面——一张缩略图、一个设备预览——两者正好差一个缩放系数，胶囊就落在它那一段前面。现在改成向上累加到整条控件为止的布局偏移。',

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
    '**把 token 层重新移植到归白。** 这个包一直发的是已经退役的暖奶油主题——oklch 表面、8/12/18px 的圆角刻度、带模糊的高度坡道。任何照着它做出来的东西，从构造上就是偏离品牌的。',
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
