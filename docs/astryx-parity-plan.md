# 对标 Astryx（Meta）：差距与改造计划

对标对象：<https://astryx.atmeta.com>（`@astryxdesign/core` v0.5.2）。
本文只写两件事：**现状是什么**、**应该改成什么样**。执行顺序在最后一节。

---

## 0. 一句话结论

我们缺的不是"组件数量"，是**每个组件页的信息密度**和**页面的可操作性**。
Astryx 一个组件页有 5 个板块（Usage / Anatomy / Best practices / Examples / Properties），
我们只有 3 个（Examples / Props / Keyboard），而且 Props 是死表格、Examples 平均 1.2 个。
**先补页面结构，再补组件**——否则新增的组件仍然是薄页面，只是薄页面变多了。

## 1. 数字对比

| 维度 | 我们 | Astryx | 差距 |
|---|---|---|---|
| 组件页 | 52 | ~98（侧栏含子部件更多） | −46 |
| 组件分组 | 7 | 12（多出 Chat / Table & List / Utility） | −5 |
| 示例总数 | 62（平均 1.2 个/组件） | 每组件 4–6 个，均带说明文字 | −3~5 倍 |
| 只有 1 个示例的组件 | 45 / 52 | 0 | — |
| 模板 | 4 | 41（9 个分类） | −37 |
| Foundations / 指南页 | 5（colour / typography / space / motion / principles） | 22（含 Icons / Elevation / Shape / Illustrations / i18n / Browser Support / Migration / Working with AI / CLI…） | −17 |
| 每个 prop 可交互 | ❌ 静态表格 | ✅ 开关 / 下拉 / 输入框 / 计数器，实时驱动预览 | — |
| Anatomy（解剖表） | ❌ 无 | ✅ 每组件都有 | — |
| Best practices（Do/Don't） | ❌ 无 | ✅ 每组件 4–11 条 | — |

## 2. 你提的四个问题：现状 → 目标

### 问题 1 — 内容太薄（例：没有 Markdown）

**现状**
- `Article` 是我们唯一的长文渲染面，定位是"整篇阅读列"，**不接受 markdown 字符串**，也没有 heading 偏移、引用角标、内联插件这些能力。
- 没有 `Code` / `CodeBlock` 作为**包导出的组件**——文档站自己有一个 `apps/docs/src/components/CodeBlock.tsx`，但那是站点私有的，消费者拿不到。这违反 [DESIGN-ARCH-001]：站点吸收了本该属于 primitive 的能力。
- 完全缺失的内容类组件：`Markdown` `Code` `CodeBlock` `Text` `Heading` `Blockquote` `Citation` `Timestamp` `Token` `Thumbnail` `Icon` `AvatarGroup`。

**目标**
- 新增 `Markdown` 组件（受控入参是 markdown 字符串），至少支持：`headingLevelStart`、`contentWidth`、表格、任务列表、代码块。`Article` 保持"排版容器"，`Markdown` 负责"字符串 → 节点"，两者组合使用，不合并。
- 把站点私有的 `CodeBlock` 提升为包导出的 `Code` + `CodeBlock`（`language` / `title` / `hasLineNumbers` / `highlightLines` / `maxHeight` / 复制按钮）。站点改为消费自己的包——这同时是最好的 dogfooding。
- `Timestamp` 和 `Token` 单独立项（见 §3 P1），它们不是"锦上添花"：任何后台列表都要用。

### 问题 2 — Code / CodeBlock 没有 Best Practice

**现状**
`ComponentPage.tsx` 的板块顺序是 `PageIntro → when(Alert) → Examples → Notes → Props → Parts → Types → Keyboard → Accessibility → Related`。
"什么时候该用"只有一句 `when` 塞在一个 Alert 里；**没有任何 Do/Don't 结构**。
catalog 里也没有承载它的字段：`packages/design/agent/catalog.mjs` 的 `CatalogEntry` 只有 `summary` / `when` / `accessibility` / `keyboard` / `related`。

**目标**
在 `CatalogEntry` 上加两个字段（在**包**里加，不在站点加，遵循现有的"组件事实归包所有"约定）：

```js
/**
 * @property {{ element: string, required?: boolean, description: string }[]} [anatomy]
 * @property {{ kind: 'do' | 'dont', text: string }[]} [practices]
 */
```

页面渲染成两张表，插在 `when` 和 `Examples` 之间：

```
PageIntro → Usage(when + import 片段) → Anatomy → Best practices → Examples → Properties …
```

写作标准照抄 Astryx 的密度：**每个组件 ≥3 条 Do、≥2 条 Don't**，每条必须是可执行的判断句
（"Reserve primary for the single most important action in the view"），不是形容词。

### 问题 3 — Props 不可交互

**现状**
`PropsTable.tsx` 输出的是纯 `<Table>`：prop / type / default / description 四列，零交互。
我们已经有 `Playground.tsx`（react-live）和 `ExampleCanvas` 的 edit 模式——**能力已经在了，只是没接到 props 上**。
另外我们缺 Astryx 的 Overview / Properties 双 Tab 结构，所有内容堆在一条竖列里。

**目标**
1. 组件页顶部加 `Overview` / `Properties` 两个 Tab（用我们自己的 `Tabs`）。
2. `Properties` Tab = **顶部一个活预览 + 下面每行 prop 带一个控件**，控件类型由已抽取的 `type` 字符串推导：

   | 抽取到的类型 | 控件 |
   |---|---|
   | `boolean` | `Switch` |
   | 字面量联合 `'a' \| 'b'` | `Select` |
   | `string` | `Input` |
   | `number` | 数字步进器 |
   | `ReactNode` / `children` | 计数器（1/2/3 个子项）或 None/Icon 二选一 |
   | 其他（函数、泛型） | 只读，保持现在的表格样式 |

   推导逻辑写在 `apps/docs/src/lib/prop-controls.ts`，输入是 `PropRow`，输出是 `{ kind, options?, fallback }`。
   这是纯函数，按 [HAR-TEST-001] 直接给单测覆盖：联合类型、可选布尔、带默认值、无法推导四条路径。
3. 状态收敛到一个 `useState<Record<string, unknown>>`，预览用 `React.createElement(Component, props)` 渲染，**不走 react-live**——react-live 是给"改代码"用的，改 prop 不该下载一个转译器。
4. 预览区右上角保留一个"复制当前调用代码"的按钮，把当前 props 序列化成 JSX。这是这套交互真正的价值：**调完直接粘走**。

### 问题 4 — Timestamp / Token 这类差很多

**现状**：确实没有。完整缺口见下节。

---

## 3. 组件缺口（按优先级分三批）

### P0 — 文档站自己就在用、却没从包里导出的（4 个）

补这些的收益是双份的：站点删掉私有实现，包多出真实组件。

`Code` · `CodeBlock` · `Markdown` · `Heading`/`Text`（型录 primitive）

### P1 — 任何真实产品都会立刻要的（12 个）

| 组 | 缺的 |
|---|---|
| Content | `Timestamp` `Token` `Blockquote` `AvatarGroup` `Thumbnail` |
| Table & List | `List` `MetadataList` `TreeList` |
| Layout | `Stack` `Grid` `AspectRatio` |
| Navigation | `Outline`（页内目录） |

### P2 — 补齐面（约 20 个，可以慢慢来）

`IconButton` `ButtonGroup` `Toolbar` `SegmentedControl` · `NumberInput` `FileInput` `TimeInput` `DateRangeInput` `Tokenizer` · `HoverCard` `Lightbox` `BottomSheet` · `SideNav` `TopNav` `Stepper`（我们的 `Steps` 是展示型，Astryx 的 `Stepper` 是带状态的流程条，两者不冲突）· `Citation` `OverflowList` `ResizeHandle` `VisuallyHidden`

### 明确不做

`Chat*` 整组（6 个）。那是 Meta 的 AI 产品需求，不是通用设计系统的一部分。

---

## 4. 模板缺口

**现状**：4 个（Dashboard / Landing / Blog / Post）。
`templates.ts` 的注释写得很清楚——它们是**密度测试**，不是"拿去就能用的页面"。这个定位本身是对的，不该丢。

**Astryx**：41 个，分 9 类（Table / Form / Settings / Login / Tools / Content / AI Chat / Gallery / Shell），每个都能"Open in Playground"。

**目标**：保留现有 4 个作为"系统压力测试"，另起一条 **`Patterns`（模式）** 线，补 8 个最高频的真实屏幕：

1. `settings` — 设置页（左导航 + 分区表单）
2. `login-card` — 登录卡
3. `table-filter` — 可筛选数据表
4. `form-wizard` — 分步表单
5. `detail-page` — 详情页（主体 + 元数据侧栏）
6. `empty-and-error` — 空态 / 错误态 / 加载态三连
7. `docs-shell` — 文档站骨架
8. `pricing` — 定价页

每个模板页照 Astryx 的做法给 **Description / Code 两个 Tab**，以及一个"在 Playground 打开"的入口。

---

## 5. Foundations 缺口

现有 4 页 + Principles。Astryx 有 22 页。真正该补的 5 页：

1. **Icons** — 我们用 lucide，但没有一页说明尺寸、描边、对齐规则
2. **Elevation / Depth** — token 有，没有专页解释什么时候升起
3. **Shape** — radius 阶梯与组合规则
4. **Working with AI** — 我们已经有 `dist/agent/` 和 skill，这是**我们的强项，却没有一个页面在讲**
5. **Migration / Getting started** — 现在只有 README，站点没有"从零开始"的路径

---

## 6. 执行顺序

> 原则：先改**一个**组件页的结构，把 Anatomy / Best practices / Properties Tab 全部跑通，
> 再批量回填内容。反过来做的话，写了 52 份 Do/Don't 却发现渲染结构要重来。

### 阶段 1 — 页面结构（约 1.5 天）

1. `CatalogEntry` 加 `anatomy` / `practices` 字段，`Button` 一个组件先填满
2. `ComponentPage.tsx` 渲染 Anatomy 表 + Best practices 表
3. `prop-controls.ts` + 单测
4. `PropsTable` 拆成 `PropsTable`（只读）和 `PropsPlayground`（可交互）
5. 组件页顶部 Overview / Properties 双 Tab
6. 跑 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`（[DESIGN-TEST-001]）

**验收**：`/components/button` 页面与 Astryx 的 Button 页信息量对等。

### 阶段 2 — 内容回填（约 3–4 天，可拆多个 PR）

1. 52 个组件全部补 `anatomy` + `practices`
2. 示例从平均 1.2 个提到 **≥3 个**，每个示例加一行 `description`
   （`ExampleData` 加 `description` 字段，从示例文件顶部的 JSDoc 里抽）

### 阶段 3 — P0 组件（约 2 天）

`Code` / `CodeBlock` / `Markdown` / `Text` / `Heading`，站点切换到自己的包。

### 阶段 4 — P1 组件 + 模板（约 1 周）

12 个 P1 组件，8 个 Patterns 模板。

### 阶段 5 — Foundations 5 页（约 2 天）

---

## 7. 一开始就要定下来的两件事

1. **Do/Don't 的写作口径**——是照抄 Astryx 那种"祈使句 + 具体例子"，还是保持我们现有文案里那种更硬的判断口吻（"A badge with an onClick is a control a keyboard cannot reach"）。**建议后者**，那是我们文档现在真正的差异点，换成通用祈使句反而变平庸。
2. **中文文案同步**——我们是双语站（`/zh`）。新增的 anatomy / practices / example description 要不要同步进 `i18n/`？如果要，阶段 2 的工作量翻倍。**建议先只写英文，中文单独一个阶段。**
