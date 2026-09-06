/**
 * The Actions group of the Chinese catalogue — 动作 — and nothing else.
 *
 * `content.ts` is still the module every consumer imports. It keeps
 * `ComponentCopyZh`, the foundations, the page copy and the lookups, and
 * assembles `COMPONENTS_ZH` by spreading these ten files in `GROUPS_ZH`
 * order. Nothing imports this one directly.
 *
 * A group is the unit for the same reason it is in the package's own
 * `agent/catalog/actions.mjs`, which this file mirrors slug for slug and in the
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

export const ACTIONS_ZH: Record<string, ComponentCopyZh> = {
  button: {
    name: '按钮',
    summary: ['5a6fcbe6', '系统的动作，和它旁边那个输入框用同一个圆角。'],
    when: ['54912a55', '任何“会做点什么”的东西。如果它是跳转、而且长得像文字，那它是链接，不是幽灵按钮。'],
    accessibility: [
      ['6ed18202', '默认渲染原生 <button>，所以 Enter 和 Space 都能触发。'],
      ['76bb1de9', 'loading 会设置 aria-busy 并禁用控件；标签保持不变，按钮不会在刚被点下时缩掉、把页面往上抽。'],
      ['137e3b52', '链接无法被 disabled，所以 href + loading 用 aria-disabled 并挡掉指针事件。'],
      ['d85775e9', 'iconOnly 没有文字，因此必须给 aria-label——这是设计系统交付一个不可用控件最常见的方式。'],
    ],
    keyboard: [['28e064e4', '激活按钮。'], ['c60cfe0e', '激活按钮。原生 <button> 两个键都认；套了样式的 <div> 一个都不认。']],
    anatomy: [
      { hash: 'bd418b9f', element: '控件盒子', description: '那个 <button>；给了 href 就是 <a>；用了 asChild 就是塞进来的那个元素。variant、size，以及和旁边输入框同一个 --radius 圆角，都长在它身上。' },
      { hash: '3ef57167', element: '标签', description: 'children，也是文字按钮的无障碍名称。loading 期间它留在原地，所以宽度不会在指针底下变。' },
      { hash: '1ecd0756', element: '图标', description: 'iconOnly 按钮上还是 children 这个位置：盒子变成正方形，内边距归零，读屏软件那边不剩任何文字形状的东西。' },
      { hash: '7b2fe3e1', element: '快捷键帽', description: 'keycap，跟在标签后面——一个带边框、降了透明度的等宽字符。它是真的文字，不是对辅助技术隐藏的装饰。' },
      { hash: '7bf5a6fe', element: '加载环', description: 'loading 时出现在标签前面——一个按所处底色取色的 Spinner，并且传了 label={null}，所以它是 aria-hidden 的，状态改由控件上的 aria-busy 承担。' },
    ],
    practices: [
      ['3ad11c94', '表单的提交控件要把 type="submit" 写出来：这里的默认值是 type="button"，所以表单底部那个按钮看着没问题，但什么都不会提交。'],
      ['deb04199', '一个视图里只留一个 primary。variant 默认就是 primary，所以一排按钮全都不写这个属性，就是一排都在宣称自己是这屏唯一该做的事。'],
      ['a4e08b70', '用 loading，不要自己去换标签：它一步就把标签留住、设上 aria-busy 并禁用控件，盒子不会在刚点下去的指针底下塌掉。'],
      ['e511138b', '会跳转就用 href，跳转由路由器接管就用 asChild——onClick 里调 router.push 的 <button> 没法在新标签页打开，读屏播报出来也是一个哪儿都不去的按钮。'],
      ['864a9aae', 'asChild 只把样式交给子元素，别的什么都不给：keycap 和 loading 根本到不了那里，所以这样写出来的加载态既没有转圈，也拦不住点击。'],
      ['e72949a9', 'sm 在默认密度下是 36px，低于 md 自己就能达到的 44px——整条工具栏都用 sm，就是一排拇指点不中的目标（WCAG 2.5.5）。'],
      ['b231604c', 'danger 是一种状态，不是强调。把它花在只是「重要」的动作上，等真有破坏性操作时，就没有任何东西还读得出破坏性了。'],
      ['63a78c56', '键帽没有对辅助技术隐藏，所以那个字符会并进无障碍名称——控件被念成「Save S」；而给一个根本没有绑定的快捷键做键帽，是在播报一个页面从不兑现的承诺。'],
    ],
  },
  'floating-icon-button': {
    name: '浮动图标按钮',
    summary: ['d9248d23', '钉在屏幕角落的圆形动作。'],
    when: ['f8fd6e3b', '需要在滚动时始终够得到的页面级操作——回到顶部、移动端目录。'],
    accessibility: [['63dfcd13', 'label 是这个控件唯一的名字，所以它是必填而不是可选。'], ['4e1e112f', '44px 见方，是指针目标的下限（WCAG 2.5.8）。']],
    anatomy: [
      { hash: '98391f7e', element: '控件盒子', description: '一个真正的 <button type="button">，--control-h-md 见方、胶囊圆角，以 --z-drawer 的层级 position: fixed 在底部某个角。这里没有 asChild 也没有 href：它变不成链接。' },
      { hash: '73936513', element: '图标', description: 'children，也是盒子里唯一的东西。不渲染任何文字形状的内容，所以控件就是那个正方形的宽度，不会再宽。' },
      { hash: '0331c6ca', element: '底色', description: '90% 的 --paper 铺在一层背景模糊上，外加一条 --rule-2 细线。White Reset 没有阴影梯度，所以把它从页面上托起来的是这层模糊和这条线，不是阴影。' },
      { hash: '81e3b0f9', element: '名称', description: 'label，作为 aria-label 设上去。它从不渲染，所以读屏用户拿到的是名字，看得见的读者只拿到那个图形。' },
    ],
    practices: [
      ['c611196b', 'position 要写出来——它是必填、没有默认值，取值是按阅读顺序的 start 和 end。组件自己的文档示例写的是 position="right"，那不在取值里，类型也过不了。'],
      ['8a81fca7', '图形不是人人都认得时，用 Tooltip 包住它：label 只是 aria-label，它只为读屏用户命名这个控件，别人拿不到——而 tooltip 在触屏上不会打开，偏偏浮动控件最常出现的地方就是触屏，也常常是屏幕上唯一的入口。'],
      ['50395595', '最多两个。start 被特意抬到 5rem、end 停在 1.5rem，这点余量刚好够放一对；第三个已经无处可去，何况这几个角还要和 cookie 条、客服入口抢位置。'],
      ['2ee2f6fa', '页面有固定页脚时，用 className 把它挪开——类名会过一遍 tailwind-merge，所以 className="bottom-24" 是替换掉那个角偏移，而不是被它压过去。'],
      ['d8537097', '--control-h-md 在默认密度下是 44px，在 data-density="compact" 下是 36px，所以紧凑密度的页面会把整屏唯一一个要靠拇指盲点的控件，做得比 WCAG 2.5.5 的下限还小八个像素。'],
      ['30303411', '它是 position: fixed，所以任何带 transform、filter 或 backdrop-filter 的祖先都会变成它的包含块——把它放进用 translate 居中的 DialogContent 里，它就钉在面板的角上，而不是屏幕的角上。'],
      ['7530c6ec', '它待在 --z-drawer，也就是 100，而每一个可能出现在它上面的层级都比它高：遮罩 200，模态 210，锚定面板 220——--z-dropdown 现在解析到 --z-anchored，不再是这一档。所以一个开进同一个角的菜单会把这个按钮整个盖住，而不是和它并列，对话框同样盖得住它。这里没有任何东西是靠文档顺序分先后的；如果它必须和别的东西并存又要够得着，就用 className 把它挪开。'],
    ],
  },
}
