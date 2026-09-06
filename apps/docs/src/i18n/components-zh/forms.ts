/**
 * The Forms group of the Chinese catalogue — 表单 — and nothing else.
 *
 * `content.ts` is still the module every consumer imports. It keeps
 * `ComponentCopyZh`, the foundations, the page copy and the lookups, and
 * assembles `COMPONENTS_ZH` by spreading these ten files in `GROUPS_ZH`
 * order. Nothing imports this one directly.
 *
 * A group is the unit for the same reason it is in the package's own
 * `agent/catalog/forms.mjs`, which this file mirrors slug for slug and in the
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

export const FORMS_ZH: Record<string, ComponentCopyZh> = {
  field: {
    name: '表单项',
    summary: ['8cf1d171', '一行带标签的表单：标签、控件，和下面那一条消息——在 row 布局下，它就是那一行设置项。'],
    when: ['116ad1ca', '任何带标签的控件。layout="row" 就是设置行——标签和 description 在行首，控件在行尾——它在这里是一种布局而不是第二个组件，因为不管哪种排法，标签接线、必填标记和消息插槽都还是同样这三件事。'],
    accessibility: [
      ['b06d8558', '没传 id 时会自己生成一个，所以标签永远指向某个东西。'],
      ['a2c4bd8c', '把 aria-describedby、aria-required、aria-invalid 接到控件上，所以校验是被念出来的，不只是被画出来的。'],
      ['78d6ff39', 'hint 和 error 是同一个位置，不是两条叠着：字段错了的时候，该读的是它哪里错了。'],
      ['88a96140', 'description 排在消息前面一起进 aria-describedby，所以一行设置项先说这个设置是干什么的，再说它哪里错了。'],
      ['746819bf', '每个控件都会把这套接线转交给承载它 role 的那个元素，所以 Select 或 Slider 底下那条 hint 是被念出来的，不只是被画出来的。'],
      ['43f93ee2', 'row 布局把标签挪到行的另一头，关联关系一点没变，所以一行设置项里放 Switch 或 Select，名字来自行这头的那几个字。Slider 是例外，而且这个布局救不了它：role="slider" 长在滑块上，而 Field 的标签指向的是那个没有 role 的根节点，所以在那里，Slider 自己的 label 仍然是读者唯一听得到的名字。'],
    ],
    anatomy: [
      { hash: 'a0a26a3a', element: '标签', description: 'label，渲染成一个带着 htmlFor 和 id 的 Radix <Label>。触发器给自己命名靠的就是这个 id、连同它自己的值，一个组也是回过头来指向这个 id——这两件事 htmlFor 都做不到。' },
      { hash: 'a9167027', element: '必填标记', description: 'required 时跟在标签后面的那个 --danger 星号。它是 aria-hidden 的，但仍然待在标签的文字里面，所以无障碍名称的结尾是「Email *」。' },
      { hash: '31bee796', element: '控件插槽', description: 'children——一个元素，就一个；Field 克隆它，给它加上 id、aria-describedby、aria-required 和 aria-invalid，而每个控件又会把这些转交给真正承载它 role 的那个元素：Select、Combobox 和 DatePicker 是触发器，组是根节点，Slider 是滑块。这就是全部的约定，其余都是排版。' },
      { hash: '52aabaa5', element: '设置说明', description: 'description，落在标签底下的第二行，讲这个设置是做什么的——区别于 hint，hint 在控件底下，属于那个输入框。它有自己的 id，并排在消息前面一起进 aria-describedby，所以两样都有的一行，两样都会被念出来。' },
      { hash: '83febde2', element: '消息', description: '控件下方唯一的一个 <p>：有 error 就是 error，否则是 hint，从不同时出现。aria-describedby 指的就是它的 id，颜色也随之在 --danger 和 --ink-3-aa 之间取。' },
      { hash: '09351c00', element: '行布局', description: 'layout="row"：标签和 description 排成一列放在行首，控件放在行尾，消息在两者下方。两列在纵轴上顶端对齐——是 items-start，不是 items-center——所以两行的 description 不会把开关拽到这段文字的半腰上，一列设置项里每个控件也都还和命名它的那几个字待在同一行上。' },
    ],
    practices: [
      ['f0e945f1', 'children 要就是控件本身，不要在外面套一层排版用的容器：接线是对这唯一一个子元素做 cloneElement，中间夹一个 <div>，id 和 aria-describedby 就落到那个 <div> 身上，标签最后命名的是一个盒子。'],
      ['a42438a2', '非法状态交给 error 一个人扛。Field 会在控件上设 aria-invalid，而 Input、Textarea、NativeSelect、Select 和 Combobox 都通过 isInvalid 认这两种写法，所以再传一个 invalid，就是让同一件事由两个可能互相矛盾的地方各说一遍。'],
      ['7314b0ad', '只要行外面有东西要指名这个控件——表单库、滚动到第一个错误、一条测试——就把 htmlFor 和控件上同一个 id 一起写出来。自动生成的那个是 useId 的值，别的东西谁都猜不到。'],
      ['e1b2bd45', '这里的 required 只是 aria-required 加一个星号，再没别的：它永远到不了控件自己的 required 属性，所以浏览器不会拦住提交，而这一行在你自己传 error 之前不会有任何标记。'],
      ['4f9c2bd5', 'RadioGroup 或 ToggleGroup 上方那几个字命名得了它，却点不进去。这两个的根节点都是 <div role="radiogroup">，htmlFor 绑不上去，所以改成由这一组反过来指向那个标签——读者像点「Email」那样点它，什么都不会发生，和 <legend> 一模一样。'],
      ['2c5da467', '设置页要用 layout="row" 配上 description 搭出来，不要用三个手写的 div。标签仍然沿着同一套接线抵达控件，所以行那头的开关，名字来自行这头的字。'],
      ['1d6916c8', '不要把 description 当第二个 hint 用。它解释的是这个设置，位置在标签底下；hint 解释的是这个输入框，位置在控件底下。拿一个顶另一个的那一行，句子读着没错，落点是错的。'],
      ['0a6a6160', '除了 DatePicker，这里每一个控件都会把 required 播报出来；DatePicker 的触发器是个普通的 <button>，这个 role 没有地方安放 aria-required。在那里，那个星号就是全部的标记，而读屏用户遇到的是一个普普通通的选填字段。'],
    ],
  },
  input: {
    name: '输入框',
    summary: ['a8a7ef5c', '一行文本输入。'],
    accessibility: [['b549ec52', 'placeholder 不是标签——只要有人开始打字它就消失了。请配合 Field 使用。']],
    anatomy: [
      { hash: '3a173fec', element: '控件盒子', description: '那个 <input>，站在它和 Textarea、Select 触发器共用的 CONTROL_BASE 上。内边距是 --field-px / --field-py，所以标了 data-density="compact" 的子树，输入框会跟着按钮一起收紧。' },
      { hash: '8f34a62c', element: '占位文字', description: 'placeholder，用 --ink-3-aa 写在盒子里——那正是值要占的同一个位置，这也是它当不了名字的原因。' },
      { hash: '2ada0b50', element: '聚焦边框', description: 'focus:border-(--ink)，改的是本来就在的那条边框，不是外加一圈 ring。聚焦时盒子一个像素都不长，所以这一行里什么都不会挪位。' },
      { hash: '1460f297', element: '错误边框', description: 'invalid——或者一个带着 error 的 Field 设上的 aria-invalid——换上来的东西。它只改边框颜色，别的一概不改，所以原因得由下面那条消息来说。' },
    ],
    practices: [
      ['ebe2ae08', 'type 和 inputMode 都要写出来。不写 type 的 <Input> 就是 type="text"，所以一个从没交代过自己是邮箱的邮箱字段，拿到的是一个连 @ 都没有的手机键盘，浏览器那边一点校验都没有。'],
      ['3517ff4f', '用 autoComplete 把这个字段的身份告诉浏览器：没有 current-password 或 new-password 的密码框，密码管理器会往里填错的值，浏览器也不会问要不要保存。'],
      ['9f88525e', '值是真的、只是不让改时，用 readOnly，不要用 disabled——disabled 的输入框既被 Tab 跳过，也不会出现在提交的表单数据里，所以一个读者明明看得见的字段，服务端一个字都听不到。'],
      ['c51dde4a', 'readOnly 在这里没有任何样式：CONTROL_BASE 只在 :disabled 时变淡，所以只读的输入框和可编辑的输入框逐像素一模一样，读者对它了解到的第一件事，是打字没有反应。'],
      ['87f6c323', 'type="number" 是给数量用的，不是给一串数字用的。电话号码、卡号、邮编会丢掉前导零；而滚轮划过聚焦中的控件，一个键都没按，值就变了。'],
      ['f71842b7', '套在 disabled 输入框上的 Tooltip 永远打不开——disabled:pointer-events-none 意味着这个控件收不到 hover——所以「它为什么被禁用」这句解释，只能改放进 Field 的 hint 里。'],
    ],
  },
  'number-field': {
    name: '数字输入框',
    summary: ['908d42ec', '一个数字，打出来的，或者扫出来的。'],
    when: ['f064612d', '这个数字有范围，也有一个合理的步长。一个光秃秃的数量是 type="number" 的 Input；一个靠它落在轨道上哪个位置来判断的值，是 Slider。'],
    accessibility: [['e8dc8d2f', '它是一个真的 <input type="number">，所以 spinbutton 这个 role、当前值、以及播报时对照的那个范围，都由平台提供。'], ['6f205073', 'unit 会经由 aria-describedby 抵达辅助技术，所以「300」不会被播报成一个没有量纲的数字。'], ['15333222', '那个把手是 aria-hidden 的，也不可聚焦：它做不到任何键盘够不着的事，而把它播报出来，等于递给读者一个按下去什么都不会发生的控件。'], ['63393c23', 'invalid 和 aria-invalid 是一起读的，所以表单库设了其中任何一个，画出来的都是同一种边框。']],
    keyboard: [['d1c7e4e7', '按一个步长走，并遵守 min 和 max。'], ['6ca2106c', '把已经打进去的内容与范围和步长对齐。'], ['43f12fe1', '放弃这次编辑，恢复到上一个落定的值。']],
    anatomy: [
      { hash: 'b3db1aba', element: '输入框', description: '一个穿着 CONTROL_BASE 的原生 number 输入框，所以它和 Input、Textarea、Select 是同一个盒子——一样的内边距、一样的聚焦、一样的禁用透明度。原生的上下按钮被藏了：三个浏览器里是三种不同的控件，没有一个属于这套系统。' },
      { hash: 'da2eb6e3', element: '扫动把手', description: '行首的一个左右箭头图形，除非 scrub 为 false，否则一直在。拖它，每 4px 改变一个步长，按住 Shift 一次十步，而且它跟着阅读方向走——在 RTL 页面里，往左是变大。只给指针用，并且是 aria-hidden，因为键盘早就有方向键了。' },
      { hash: 'b2818694', element: '单位', description: 'unit，画在框尾内侧，并经由 aria-describedby 播报。这个槽位固定 3rem，所以一个超过四个字符左右的单位，会被一个长数字压到下面。' },
    ],
    practices: [
      ['0b312cc1', '当一个值是被调出来、而不是被填进去的时候用它——一段时长、一个行高、一个偏移。那个把手就是它胜过 Input 的全部理由：读者是靠从邻近的值上扫过去找到这些的，不是靠一个一个把候选值打进去。'],
      ['b2eaac39', '把它套在 Field 里。根节点是一个 div，而 id 会落到里面那个 input 上，所以标签绑得住、也点得进去，和 Input 一模一样——但前提是有一个 Field 来做这件事。'],
      ['74168be0', '要传 min、max 和 step。它们是方向键一步的分量、扫动一格的分量，也是离开这个框时值被对齐的依据；不传的话，这个控件就是一个带把手的 Input。'],
      ['29daad11', '不要指望范围在敲键的中途就成立。夹取发生在失焦时，不是每个字符一次，因为一个 10 的下限否则会让 50 永远够不着——5 会在 0 到达之前先被顶上去。onValueChange 可以报出一个越界的数字；而落定的那个值，永远在范围之内。'],
      ['cfc9f724', '不要一边关掉把手，一边指望指针还有别的路。它背后没有上下按钮——藏掉它们正是重点——所以 scrub={false} 留给鼠标的只剩打字。要关就为一个被选定、而不是被扫出来的数量而关，并且清楚这笔交换。'],
      ['eee242ad', '超过四个字符左右的单位，不要只塞在框里。那个槽位是固定的，所以「requests」会被数字压到下面；一个长单位属于 Field 的标签，在那儿它是被读到的，而不是被裁掉的。'],
    ],
  },
  textarea: {
    name: '多行输入',
    summary: ['9ea6bde8', '多行文本输入，只能纵向拉伸。'],
    anatomy: [
      { hash: 'badcf885', element: '控件盒子', description: '那个 <textarea>，和 Input 站在同一个 CONTROL_BASE 上，另加一条 min-h-24 的下限。这条下限压在 rows 底下，不是盖在它上面：rows={2} 渲染出来仍然是六个 rem 高。' },
      { hash: '3a22ca6e', element: '拉伸角', description: '浏览器自带的那个角上的手柄，被限制成 resize-y——读者可以把盒子拉长，但拉不宽到超出行长，也拉不出页面的边距。' },
      { hash: '78a35476', element: '错误边框', description: '和 Input 上 isInvalid 认的是同一对：invalid 属性，或者一个 aria-invalid——包括 Field 有 error 时替它设上的那个。' },
    ],
    practices: [
      ['42cb75b6', 'rows 按你期待的答案来设。它是唯一能把静止高度顶到六 rem 以上的东西，而这个盒子的大小，是页面上关于「该写多长」说得最清楚的一句话。'],
      ['12dd0346', '有长度上限，就既设 maxLength，又在 hint 里把它说出来：maxLength 会不作解释地吞掉按键，而多出一个字符的粘贴会被悄悄截断。'],
      ['a28d28cd', 'Enter 就让它是换行。按 Enter 就提交的 textarea，抢走的正是这个控件存在的意义所系的那个键，而读者会丢掉写到一半的那一段。'],
      ['12ea5f20', '它不会自动长高。高度就是 rows 和 min-h-24 谈出来的那个数，永远不跟着内容走，所以调用处不另作交代的话，一段长回答是隔着一个六 rem 的窗口被检查的。'],
      ['7c2044ed', '不要把必须遵守的格式只写在 Field 的 hint 里：hint 和 error 共用一个位置，所以字段一出错，格式就消失了——而那正是唯一有人需要它的时刻。'],
    ],
  },
  select: {
    name: '选择器',
    summary: ['9b71ec14', '从一个列表里选一项，从头到尾都由我们绘制。'],
    when: ['2b89ec7c', '大约十几个选项以内。再多就该用 Combobox——一个没法筛的列表，扫起来比能打字筛的更慢。'],
    accessibility: [['9a8c0730', '在有边界的框里——设备预览、内嵌控制台——用 `<OverlayContainer container={el}>` 包住这棵子树。面板会渲染进那个元素，按它的边界翻转，而不是按视口；框上设的 `dir` 和 `data-density` 也就跟着生效了。'],
      ['e40817a9', '选项列表是我们自己的，所以它不会在打开的一瞬间换掉字体、间距和选中色——那正是原生 select 会做的事。'],
      ['fe98a0bb', '键盘行为仍是平台的那一套：首字母跳转、方向键、Home 和 End、Escape 关闭且不选。'],
      ['a9dc0c8a', 'label 必填，而且它是连着值一起被念出来的：触发器读作「Region, Australia」——值不是名字，而只有名字没有值也不是答案。在 Field 里面，名字那一半由 Field 的标签提供：触发器的 aria-labelledby 指向那个标签和那个值，而这里的 label 既不渲染也不播报，所以一个和上面那几个字对不上的 label，是没人会听到的文字。'],
    ],
    keyboard: [['4b51d5e7', '展开列表。'], ['a767323b', '在选项之间移动。'], ['1fdf7654', '首字母跳转——跳到下一个以该字母开头的选项。'], ['53520f60', '跳到第一个或最后一个选项。'], ['adec7530', '不选中直接关闭。']],
    anatomy: [
      { hash: 'e3d706cc', element: '触发器', description: '一个站在 CONTROL_BASE 上的 <button role="combobox">，所以它和旁边那个 Input 严丝合缝地对齐。它的名字由 label 和它自己的值合起来构成，并带着面板打开时会翻过来的那个箭头。' },
      { hash: 'e80c442f', element: '值', description: '选中项的文字；什么都没选时，是 --ink-3-aa 的 placeholder。它会截断，而且它正是无障碍名称里交代「选了什么」的那一半。' },
      { hash: '8ef883f3', element: '面板', description: '通过 portal 渲染，宽度不小于触发器，高度不超过 18rem；列表比这更长时，两端各出现一个滚动箭头。' },
      { hash: 'a21fb29b', element: '选项', description: '一个选项。那个 3.5 的勾位一直画着，出现和消失的只是里面那个勾，所以选中不会把每一行标签往旁边推；data-highlighted 是那块底色，勾才是「被选中的那个」。' },
      { hash: 'fce5bea4', element: '分组标题', description: 'SelectLabel——SelectGroup 里一行等宽的小标题。它是标题，不是选项，这正是它和「拿一个禁用项当分隔线」之间的区别。' },
    ],
    practices: [
      ['4873c096', '值要活着熬过一次提交，就传 name。触发器是个 <button>；只有当控件在 <form> 里面时，Radix 才会渲染那个承载值的隐藏原生 <select>，而只有有名字的那个才送得出任何东西。'],
      ['d29c5663', 'invalid 只挑一种写法。触发器对 invalid 属性和 aria-invalid 一视同仁——包括 Field 从 error 设上的那一个——所以两个都设，就是一条边框有了两个事实来源。'],
      ['ac0b7272', '长列表用 SelectGroup 和 SelectLabel 分段，不要拿一个禁用项当标题：禁用项仍然是选项，读屏软件会把它数进去，把这个列表播报成比它实际长一项。'],
      ['55cdbe5b', '放在一个有 label 的 Field 里时，这里的 label 属性不会被播报——命名触发器的是 Field 的那几个字——所以一个和上面那句对不上的 label，是一段永远不会有人听见的死文字。'],
      ['1301476d', '不要指望合起来的触发器把一个很长的选项显示出来：它会截断，好保住字段的高度，所以那个值的结尾只有在面板打开时才读得到。'],
      ['3e88f864', '不要把 contentClassName 当成触发器的。className 是触发器，contentClassName 是面板；把这两个搞混，就会得到一个 18rem 宽的下拉，盖在它正要为之选值的那个东西上面。'],
    ],
  },
  'native-select': {
    name: '原生选择器',
    summary: ['4d85ef00', '平台自己的选择器，能改的地方改了。'],
    when: ['c5bfc8e1', '这是逃生口，不是默认值。用在平台确实更好的地方：手机上很长的列表、必须在没有 JavaScript 时也能用的表单、要抠最后一个 KB 的页面。'],
    accessibility: [['f15ec40e', '首字母跳转和手机滚轮是浏览器白送的。'], ['066073b3', '它做不到的是打开之后仍然像这套系统——选项列表由操作系统绘制，带不上任何 token。']],
    keyboard: [['83dd8998', '打开系统自带的选择器。'], ['adcf8d09', '首字母跳转，由浏览器自己实现。']],
    anatomy: [
      { hash: '28d27744', element: '外层容器', description: '包着这两样东西的一个 relative <div>，也是 className 落脚的那个元素。它是这一组里唯一一个 className 不落在字段本身上的控件，因为箭头钉的正是这个盒子：宽度设在别的地方，箭头就会被撂在这一行的最外沿。' },
      { hash: 'fdba3582', element: '控件盒子', description: '站在 CONTROL_BASE 上的 <select>，appearance-none 把平台自己的箭头去掉了，行尾留了 pe-9 的内边距，好让最长的那个选项让开我们画的那个箭头。它撑满外层容器，所以外层容器的宽度就是这个字段的宽度。' },
      { hash: 'f52ecfe2', element: '箭头', description: '一个 pointer-events-none 的图标，钉在外层容器的行尾边上。它是我们的，不是平台的，所以选择器打开时它既不翻转也不移动。' },
      { hash: '846f150b', element: '选项列表', description: 'children，打开时由操作系统绘制。里面只有 <option> 和 <optgroup>，这两个都吃不下这套 token。' },
    ],
    practices: [
      ['d18f0364', '要么给它一个明确的空首项，要么给一个 defaultValue。没人碰过的 <select>，第一项就是选中的，所以一张没被碰过的表单，会把列表最上面那一项当作有人选过一样提交上去。'],
      ['5e271744', '分组用 <optgroup>：它是操作系统的选择器真正会渲染的唯一一种结构，而且这里没有 SelectLabel 之于 Select 那样带样式的替代品可退。'],
      ['54de718e', '宽度就用 className 来设。它落在箭头所钉的那个外层容器上，而 select 撑满这个容器，所以箭头会跟着字段的边缘一起走，不会停在这一行原本结束的地方。'],
      ['8e5746fa', 'multiple 和 size 熬不过这套样式：appearance-none 加上一个钉在外层容器中间的箭头，会把一个列表框变成一根滚动的列，上面横着一个箭头。改用复选框，或者 multiple 的 Combobox。'],
      ['172cb3f7', '不要拿第一项当标签。「请选择国家」会被播报成一个可选的值，而且它就是一张没被碰过的表单提交上去的那个值——把名字放进 Field，再给那一项 value="" 和 disabled。'],
      ['e217ae2f', '不要用 className 去改这个控件自己的字色或边框：它装扮的是外层容器，而里面那个 <select>，无论外面那个盒子怎么说，都还留在 CONTROL_BASE 上。'],
    ],
  },
  checkbox: {
    name: '复选框',
    summary: ['eb08a837', '一个在表单提交时才生效的选择。'],
    when: ['332097b4', '立刻生效的开关是 Switch。'],
    accessibility: [['e7dbe796', '支持不确定态，这正是“全选”表头在只选了一部分时需要的——普通的未勾选状态在那里表达的是相反的意思。']],
    keyboard: [['15b678ff', '切换勾选状态。']],
    anatomy: [
      { hash: '70c1d5d1', element: '方框', description: '一个 18px 的 <button role="checkbox">，圆角取 --radius-xs。勾选和不确定它都填 --accent，所以这块填充说的是「不是关」，而不是「开」。' },
      { hash: '66130937', element: '勾', description: '那个勾形字符，aria-hidden——Radix 负责显示这个指示符，状态由 role 承担。' },
      { hash: 'cd840ff7', element: '横杠', description: '顶替勾的那个减号，按方框实际所处的状态来挑——受控与否都一样，所以 defaultChecked="indeterminate" 画出来的是它承诺过的那根横杠，而不是一个勾。' },
      { hash: 'ecc5e105', element: '标签', description: '这里不渲染。和 RadioGroupItem 不同，没有任何东西把这个方框包进 <label>，所以旁边那几个字、以及它们带来的那块点击区域，都是调用处的事。' },
    ],
    practices: [
      ['01c973f7', '把它和它的文字一起包进 <label>，或者放进 Field：这个控件自己不渲染标签，所以一个光秃秃的 Checkbox 没有无障碍名称，而那 18px 的方框就是全部的点击区域。'],
      ['a9689a3a', '不确定态的方框要托在受控状态上。它报告的是别的那些行的情况，而点它一下拿回来的是 true——一个自己保管答案的「全选」表头，从第一次被点击起就不再描述它底下那份列表了。'],
      ['15b4a33b', '默认值要在服务端定。没勾的方框在表单提交里根本不发送任何条目，所以读者特意清掉的字段，和一个压根没渲染过的字段，到达时一模一样，都是 undefined。'],
      ['ff810588', '只给 checked 不给 onCheckedChange，得到的是一个永远不动的方框：Radix 把这个属性当作唯一的事实来源，于是读者点着一个既没坏也没在工作的控件，两边都得不到任何回应。'],
      ['d7ac1708', 'Radix 的 checkbox 上没有 readOnly。disabled 是唯一的锁，而它会把方框从 Tab 顺序里、也从表单里丢出去，所以一个必须展示但不许改动的值，画成文字更好。'],
      ['cf1d132c', '不要把不确定态放在叶子节点上。它的意思是「它底下的一部分」，所以一个底下什么都没有、却画着横杠的方框，报告的是一个它自己的值根本承载不了的状态。'],
    ],
  },
  'radio-group': {
    name: '单选组',
    summary: ['f8a0e166', '一组互斥的选项。'],
    accessibility: [['3348057b', '整组只有一个 Tab 停靠点，方向键在选项之间移动，符合 ARIA radiogroup 模式。'], ['0439319f', '标签在 <label> 里面，所以整行都是点击目标。']],
    keyboard: [['f147cdd7', '进入和离开这一组——整组只占一个 Tab 停靠点。'], ['0977959e', '在选项间移动，并且移到哪就选中哪。']],
    anatomy: [
      { hash: '3e4ca016', element: '组', description: '一个把选项竖着排开的 <div role="radiogroup">。正因为它是 div，上面那个标签才是靠被指向来命名这一组的——用的是 aria-labelledby，不是 htmlFor——也正因为如此，那几个字点不进去。' },
      { hash: 'f0297ff4', element: '选项行', description: 'RadioGroupItem 把控件和文字一起裹进去的那个 <label>。它就是点击目标——光一个 18px 的圆低于所有指针目标准则——也是这个选项无障碍名称的唯一来源。' },
      { hash: '0056b5fc', element: '圆圈', description: '18px 的控件本身，被选中时它的边框变成 --accent。' },
      { hash: '6269499a', element: '圆点', description: '圆圈里那块 10px 的 --accent 填充，只出现在被选中的那一项上。' },
    ],
    practices: [
      ['f11feb81', '给这一组一个名字。放在 Field 里时由它的 label 通过 aria-labelledby 来给；单独站着时它需要自己的 aria-label；两样都没有，这一组播报出来就是三个没有标签的单选钮。'],
      ['60cb59ff', 'defaultValue 或 value 要设。这里是选中跟着焦点走，所以一个初始为空的组，只要有人用方向键进来就提交了一个答案——包括那些只是路过、正要去下一个字段的读者。'],
      ['4e88bc86', '答案确实可以不填时，就明确加一个「无」或「不限」选项：单选一旦选中，就没有回到「什么都没选」的路，再点一次不行，键盘也不行。'],
      ['0e2add45', '不要把开销大的副作用挂在 onValueChange 上。每按一下方向键都是一次提交，所以选项会发请求或会跳转的组，在路过那些没人想要的选项时，每按一个键就触发一次。'],
      ['a1539140', '不要绕过 RadioGroupItem 直接去用 Radix 的原语，也不要自己手搓这一行：选中跟着焦点走是在这个 item 自己的 focus 处理里实现的，不在上游，所以手搓出来的那一行只会挪动焦点框，什么都不选。'],
      ['85f6116c', '不要用禁用某一项来表达「这里没有这个」：漫游焦点会完全跳过它，所以键盘用户从头到尾都不知道有这个选项。原因写进 Field 的 hint，选项本身别放进来。'],
    ],
  },
  switch: {
    name: '开关',
    summary: ['99aeed96', '一个立刻生效的设置。'],
    when: ['cbc933a2', '放在带保存按钮的表单里，开关就是在骗人——那种情况用 Checkbox。'],
    keyboard: [['f6dd52f7', '切换开关，改动立即生效。']],
    anatomy: [
      { hash: '7103f14e', element: '轨道', description: '一个 36×20、胶囊圆角的 <button role="switch">，关时填 --stone，开时填 --accent。是填充而不是描边，所以在一张白底页面上，它照样读得出是个控件。' },
      { hash: '22321ab7', element: '滑块', description: '一个 14px 的 --paper 圆片，带一条细线，而不是一块投影上的白饼——这套系统没有阴影。按住时它拉长到 20px，落位时再圆回来；motion-reduce 下这一整段动作都不做。' },
      { hash: 'df83783e', element: '标签', description: '这里同样不渲染。不过 Radix 的根节点确实就是一个 <button>，而 <label for> 是绑得住它的——所以和 Select 或 RadioGroup 不一样，Switch 上方那个 Field 标签，真的能点进来。' },
    ],
    practices: [
      ['7e88248e', '失败要在控件这里处理。这一拨已经宣称改动发生了，所以 onCheckedChange 里请求失败时，必须把滑块拨回去并说明原因，否则页面上摆着的是一个服务端根本没有的设置。'],
      ['8f496226', '按状态命名，不要按动作命名：无障碍名称是和「开」或「关」一起被念出来的，所以「邮件通知，开」是一句话，而「打开邮件通知，开」是两句互相矛盾的话。'],
      ['7c09b09d', '哪怕写入并不即时，眼睛看到的这一拨也要是即时的——一个乐观更新的滑块配一条安静的撤销，胜过在一个全部主张就是「它已经生效了」的控件上转圈。'],
      ['d5ed432b', '开关只有两个状态，没有第三个。「继承工作区设置」当不了开关，因为它唯一画得出来的样子就是未勾选，而那播报出来是「关」——那种东西是 RadioGroup 或 Select。'],
      ['eee3c961', '这里没有 readOnly：disabled 是唯一的锁，而它会把控件挪出 Tab 顺序，所以一路 Tab 过表单的键盘用户，会从这个设置旁边路过，始终没听到它的值。'],
      ['412c08bf', '不要从调用处加 transition-all。它会把 transition-[transform,width] 整个换掉，于是轨道的颜色被套上滑块那条更长的时长，一次拨动就变成了一次淡入淡出。'],
    ],
  },
  combobox: {
    name: '可搜索选择器',
    summary: ['9fd12fb7', '一个能打字的 select，可以选一个，也可以选多个。'],
    when: ['a6336fb0', '大约十几个选项以上。更少的时候 Select 更好：不用思考就能扫完。'],
    accessibility: [['4bebb898', '高亮通过 aria-activedescendant 移动，焦点留在输入框里——这是 ARIA combobox 模式。自己手搓的会把焦点挪进列表，然后打的字就没法改了。'], ['342b9647', 'label 必填，而且它是连着摘要一起被念出来的、不是取而代之：触发器读作「Tags, 3 selected」。在 Field 里面，名字那一半由 Field 的标签提供，这里的 label 在触发器上既不渲染也不播报——但它仍然命名那个清除控件，念作「Clear Tags」，所以哪怕触发器不再说它，它也得是真话。']],
    keyboard: [['4b51d5e7', '展开列表。'], ['0f32dfd7', '移动高亮，焦点始终留在筛选框里。'], ['0fc25b6e', '选中高亮那一项；再选一次当前项就是取消。'], ['adec7530', '不选中直接关闭。']],
    anatomy: [
      { hash: '693e997d', element: '触发器', description: '一个 <button role="combobox">，名字由 label 和它自己那行摘要合起来构成，并带着 aria-expanded。它的文字是截断而不是换行，所以不管选了什么，这个字段的高度都不变。' },
      { hash: '175c9ada', element: '摘要', description: '触发器上的那行文字：placeholder，或者最多两个用逗号连起来的选中标签，再多就是「已选 n 项」。超过两个就改成计数，正是这一点让多选控件不会每选一次就把表单重排一遍。' },
      { hash: 'd5690fe2', element: '清除', description: '箭头旁边的一个 <span role="button">，只在 multiple 且已经选了东西时出现。用 span 而不是嵌套的 <button>，是因为后者在触发器里面是非法的，浏览器会把它挪出这个字段。' },
      { hash: '5f09d778', element: '筛选框', description: '面板里 cmdk 的那个输入框。它的名字是通过 Command 外层容器给的，形如「label: searchPlaceholder」，因为 aria-labelledby 压过 aria-label，直接给这个输入框命名什么用都没有。' },
      { hash: '64ec3b44', element: '选项行', description: '单选是一个勾，多选是一个可填充的方框，后面跟着标签。筛选什么都没命中时，emptyMessage 顶替整个列表。' },
    ],
    practices: [
      ['434ebb81', '受控时，「什么都没选」要写成空字符串。value={undefined} 恰恰是这个组件判定自己非受控的依据，所以那样清空等于把状态还给了它自己，它从此不再跟随父组件。'],
      ['806efd46', '看得懂的文字放 label，其他值得被匹配上的放 keywords：cmdk 也拿选项的 value 去打分，所以一份用 UUID 做键的列表，是在按一串永远不会有读者输入的字符排序。'],
      ['9c4e7f2e', 'emptyMessage 里要说清楚什么才匹配得上。默认那句只告诉读者筛选跑过了，至于这四百个选项里他本该输入哪一个，一个字都没说。'],
      ['482e57d1', '超过两项之后，触发器就不再点名了——它播报的是「标签，已选 3 项」，至于是哪三项，只有面板里才有。不打开面板也必须核对得了选了什么时，就把它们打印在字段旁边。'],
      ['49a35041', '不要给它几千个选项。这里没有任何东西做虚拟化：打开时数组里每一个选项都渲染进面板，并且在筛选背后一直待着，所以列表长度是 DOM 的开销，不是搜索的开销。'],
      ['978abe57', '禁用的选项不等于隐藏的选项——它照样渲染、照样被筛选命中，所以读者可以把它的名字一字不差地打出来，看着它浮上来，然后选不中，还得不到任何解释。'],
    ],
  },
  'date-picker': {
    name: '日期选择器',
    summary: ['64db0ea6', '一个日期——或者一段日期——从日历里选。'],
    when: ['01327e09', '刻意不做成“输入框加日历”：解析手打的日期需要格式，而 03/04 在一个国家是 3 月 4 日，在下一个国家是 4 月 3 日。日期很久远时，日历的月份和年份是下拉。'],
    accessibility: [['e982bf16', '触发器按访问者自己的地区格式打印日期，而不是写死的 dd/mm/yyyy，并把它作为自身名称的一部分播报出来——所以 format 对读屏用户同样管用。'], ['c2d1465b', 'DateRangePicker 会等到两端都选完才关——一段范围在有第二个日期之前不算一个值。'], ['402acc7a', '右侧快捷选项是普通按钮，不是菜单：它们设的值和旁边的日历格设的是同一个，所以它们属于同一个控件，Tab 也在同一轮里走到。'], ['f86c6a90', '快捷值是点击那一刻才算的，所以标签页开了一整夜，“今天”仍然是今天。']],
    keyboard: [['5e203865', '打开日历。'], ['3ece9f7d', '不选日期直接关闭。']],
    anatomy: [
      { hash: '4970f6e0', element: '触发器', description: '一个打印 format(value) 或 placeholder 的 <button>，行尾钉着一个日历图标。它的名字由 label 和打印出来的那个日期合起来构成，所以那个格式既看得见，也听得到。' },
      { hash: '791b77fa', element: '面板', description: '一个装着快捷栏和日历格的 Popover——sm 及以上并排，再往下就上下堆叠，反正那个宽度本来也放不下两个月。' },
      { hash: '952b1147', element: '快捷栏', description: '一个由普通按钮组成的 role="group"，只在设了 presets 时才有：DateRangePicker 默认开，DatePicker 默认关。落在 disabledDates 某一天上的快捷项会被画成不可用，并且拒绝点击。' },
      { hash: '9e4bc194', element: '日历格', description: '共用的那个 Calendar，打开时 autoFocus，所以键盘落在月份里，而不是退回触发器上。范围选择器一次显示两个月，由 months 决定。' },
      { hash: 'a14836f5', element: '半段范围文字', description: '只选了一端时，范围触发器打印的是「起始 – …」，所以答了一半的范围会在合起来的控件上把这件事说出来，而不是装作已经答完了。' },
    ],
    practices: [
      ['98ce2654', '限制写进 disabledDates，不要写在你自己的处理函数里。快捷栏也会去问它，所以落在被禁那天上的快捷项是禁用的，而不会提交一个旁边日历格拒绝的日期——范围类的快捷项只在两端受检，所以一个跨过被禁日期的范围照样会被提供，正如日历格自己也照样允许它。'],
      ['2b4208ea', '受控还是非受控，选一个就别再换。当前值是 value ?? uncontrolled，所以一个受控的选择器如果靠把 value 设成 undefined 来清空，就会掉到 defaultValue 埋下的那个值上，旧日期又冒出来了。'],
      ['1bebcbb6', '范围用之前先校验：半段范围在这里是合法状态——from 有值，to 是 undefined——所以不加检查就读 value.to 的提交处理函数，会从一个只是早点关掉面板的读者那里拿到 undefined。'],
      ['68cebde8', 'Field 的 required 到不了触发器。它是个普通的 <button>，这个 role 没有地方安放 aria-required，所以上面那个星号就是全部的标记，而读屏用户遇到的是一个普普通通的选填字段。'],
      ['09a3c5e2', '不要拿它来填出生日期。没有 defaultMonth 可传：面板永远从当前月打开，所以一个几十年前的日期，会让每一个读者都从月份和年份的下拉开始。'],
      ['9ff8b393', '不要用禁用它的办法来展示一个固定日期。disabled 会把触发器挪出 Tab 顺序、并挡掉它的指针事件，而触发器是选中的那个日期唯一被打印出来的地方。'],
    ],
  },
  'color-picker': {
    name: '取色器',
    summary: ['433ee357', '一个颜色，选出来的，或者打出来的。'],
    when: ['cdf978b0', '有人正在挑这个颜色。一个只是被展示出来的颜色是一块色卡，而一组固定的品牌色是 RadioGroup——一个取色器给一道只有六个答案的题准备了一千六百万个。'],
    accessibility: [['1141e6d5', 'label 必填。触发器展示的是一个值，而一个值不是名字。'], ['af3dbf99', '那个平面是两个真滑块凑成的一组——彩度和亮度——各自带百分比播报，所以这个二维面是可操作、也被报告出来的，而不只是可以点。'], ['f9f4132a', '聚焦环画在那个平面上，因为真正接住焦点的那两个滑块是视觉隐藏的，浏览器自己那圈环会连同它们一起被裁掉。'], ['6e2ecbd9', '透明度在每一处展示的地方都由一块棋盘格再说一遍，所以透明不是只靠明暗来传达的。']],
    keyboard: [['e8168197', '打开面板。'], ['1d397a27', '把当前聚焦的那个轴或那条轨移动一个步长。'], ['d5e6eed9', '把那个轴或那条轨跳到两端。'], ['a80b754d', '关闭面板；焦点回到触发器。']],
    anatomy: [
      { hash: '2fdba4d7', element: '触发器', description: '收起来时的那个控件：一块色卡，后面跟着文本形式的值，装在和 Input、Select 同一个盒子里。它由自己的 label 和自己的值共同命名，所以读者听到的是「品牌色，#a78bfa」，而不是其中的任何一半。' },
      { hash: '05169c0f', element: '色卡', description: '颜色压在一块棋盘格上，所以一个半透明的值读起来是透明，而不是一个更淡的颜色。' },
      { hash: '4ef044d8', element: '写法条', description: '十六进制、OKLCH 和 Display P3，做成一个单值的 ToggleGroup。它改的是 onValueChange 吐出什么，不是这个颜色本身——而十六进制和 P3 都是有界的，所以切到其中一个，颜色会在出去的路上被收进那个色域。' },
      { hash: '26dabe37', element: '色面', description: '那个平面：彩度横着走，亮度竖着走。每一行都归一到那个亮度和色相下真正存在的最大彩度，所以整个面都够得着，而不是一小片颜色的透镜夹在成带的重复色之间。它下面是两个真滑块，而不是画布上挂几个按键处理函数，这正是它拥有方向键、Home、End 和一个被播报的位置的原因。' },
      { hash: '0e96540d', element: '色相轨', description: '一条取在已经选定的亮度和彩度上的渐变，不是一道通用彩虹——所以这条带子展示的是这个颜色的各个色相，而不是别的颜色的。' },
      { hash: '42b54089', element: '透明度轨', description: '从透明到当前颜色，压在和色卡同一块棋盘格上。' },
      { hash: '6dff750e', element: 'CSS 框', description: '文本形式的值。收十六进制、rgb()、hsl()、oklch() 和 color(display-p3 …)，两种写法都行；除此之外的任何东西，它都会把自己画成无效。' },
    ],
    practices: [
      ['b536a537', '把它套在 Field 里。触发器是一个按钮，标签绑得住、也点得进去——在这些组合控件里，这是少数几个不用额外帮忙就成立的。'],
      ['c12b0ab0', '你想拿回什么写法，就传什么写法进去。面板会一直用值进来时的那种写法吐出去，直到有人在写法条里改掉它，所以一个 "#a78bfa" 的 defaultValue 会让调用方一直待在十六进制里。'],
      ['50c395f9', '当这些颜色正在被调的时候，用它而不是 <input type="color">。原生取色器工作在 HSV 里，那里一行亮度不变的颜色越饱和看着越暗——于是一个在配调色板的人是在跟手里的工具较劲。OKLCH 才是那个「同一高度的两个颜色真的一样亮」的空间。'],
      ['f0ab4d82', '不要传颜色名。十六进制、rgb()、hsl()、oklch() 和 color(display-p3 …) 都解析得了；"rebeccapurple" 不行，那个框会把它显示成无效。要认颜色名，得带上一张写满每个 CSS 关键字的表，或者一个活的 DOM，而一个认得一部分名字、不认得另一部分的取色器，比一个都不认的还糟。'],
      ['e0e3c11a', '不要把吐出来的字符串当成一种固定写法。它取决于写法条当下设成什么，所以一个上来就把开头的 "#" 切掉的调用方，会在读者第一次选中 OKLCH 时坏掉。'],
      ['4f13a08e', '不要用它去挑正文色或背景色，然后管结果叫无障碍。这里没有任何东西在量对比度；一个允许读者给正文选 #eeeeee 的取色器，做的正是它被要求做的事。'],
    ],
  },
  slider: {
    name: '滑块',
    summary: ['d4b63fec', '在一段范围里选一个值。'],
    accessibility: [['8ca6680b', 'label 必填。一个只报“42”的滑块，给读屏用户留下一个数字和不知道它在量什么。'], ['7d31ee0d', '16px 的滑块外面有一个看不见的 44px 命中区。'], ['f03b4bca', 'format 会作为 aria-valuetext 播报，所以一个显示着「$1,200」的滑块，念出来就是这个，而不是 1200。'], ['b1fe5107', '方向键走一步，Page 键走一大步，Home 和 End 到两端。']],
    keyboard: [['8cacfc3a', '移动一个步长。'], ['df3c8d54', '移动一个更大的步长。'], ['aede5397', '跳到最小值或最大值。']],
    anatomy: [
      { hash: '0ccabf34', element: '轨道', description: '一条 --stone 的 1px 细线；只要指针落在这个控件上的任何位置——不必落在滑块上——它就加粗到 1.5。' },
      { hash: '7ba43f9b', element: '已选区间', description: '从最小值到滑块的那段 --accent 填充；范围滑块则是两个滑块之间的那一段。' },
      { hash: 'e6170fd3', element: '滑块', description: 'value 数组里每有一项就有一个——所以滑块的个数来自值，不来自某个属性；而一个既没给 value 也没给 defaultValue 的滑块，会退回原语自己的默认：一个停在最小值上的滑块。每一个都是 16px 的圆，外面有一圈由 before 伪元素撑出来的、看不见的 44px 命中区。' },
      { hash: 'e7a16354', element: '数值行', description: '只有设了 showValue 才有：轨道上方一行等宽字，名字靠行首、格式化后的值靠行尾，各自用一个连接号连起来，顺序和滑块本身的顺序一致——所以一个两端的范围读出来是「Minimum – Maximum」压在「10 – 90」上面。' },
      { hash: '38d83d7d', element: '可编辑读数', description: 'editable 会把那些数字变成这个：每个滑块一个框，静止时显示 format 的输出，拿到焦点时显示光秃秃的数字，所以读者看到的仍然是「$1,200」，而打字的人从不会被要求把货币符号也敲一遍。每个框都和它驱动的那个滑块分开命名——两个控件都播报成「Quality」，等于同一个控件被念了两遍。' },
    ],
    practices: [
      ['d48e9305', '只要它不止一端，就要传 defaultValue 或 value。滑块的个数来自那个数组，所以一个放任默认的价格筛选，是一个停在最小值上的单滑块。'],
      ['8b3905f7', '双滑块的范围要传两个名字的数组：第一个之后的每一个滑块都退回 names[0]，否则价格筛选的两端都把自己播报成「最小值」。'],
      ['a46cef2e', '确切的数字要紧时，把 editable 打开。滑块自己没法打字，而一个要的是 37、不是「大概 40」的人，只能拖着 16px 的滑块在一百个步长里挪过去——读数里那个框就是出路，它顶替了这里过去要求的第二个 Input。'],
      ['5e5c6139', 'format 会成为每个滑块的 aria-valuetext，而它是顶替那个数字，不是给它加装饰——所以一个把数字狠狠取整、或者把单位丢掉的格式化函数，就是读屏用户拿到的全部，值本身他拿不到。'],
      ['4391971e', 'editable 打进去的数字，除了受 min 和 max 约束，也受相邻那个滑块约束，而且只能这样：往一个上端停在 70 的区间的下端里打 90，否则两个滑块就交叉过去了。所以一个数字可以被接受、然后落在别处，而那个框显示的是它落在了哪儿。'],
      ['fd9f7b13', '不要靠禁用一个滑块来让它只读：整个控件会变淡、不再接收指针，Radix 还会把滑块从 Tab 顺序里丢出去，于是那个值变成了够不着，而不是不可编辑。'],
      ['93234c18', '不要给单滑块传两个名字：那一行是每个滑块打印一个名字，所以第二个名字哪儿都没画出来，也哪儿都没播报出来。'],
      ['54acf344', 'Field 上方那个标签既命名不了它，也点不进去：role 长在滑块上，而根节点是一个 <span>，所以这里的 label 属性是读者唯一听得到的名字。hint 和 error 倒是抵达得了滑块。'],
    ],
  },
  'toggle-group': {
    name: '分段控件',
    summary: ['88746c93', '分段控件：若干选项，一条。'],
    when: ['db59dbdb', '它改的是一个值。切换面板的是 Tabs。'],
    accessibility: [['e5762a6a', 'type="single" 有 radio 语义，type="multiple" 是彼此独立的开关。选错会告诉读屏用户：选中一个就会取消另一个。']],
    keyboard: [['dc3642b3', '进入这一条——整组一个停靠点。'], ['e343acb9', '在各段之间移动。'], ['a0aa416d', '切换当前聚焦的那一段。']],
    anatomy: [
      { hash: 'c2531aef', element: '条', description: '装着各段的那个带边框的胶囊，除了 inline-flex 还带 w-fit——没有它，flex 或 grid 的父容器会把这一条拉伸到最宽的兄弟元素那么宽，最后一段之后留下一块死区。' },
      { hash: '51905fd6', element: '滑动色块', description: '选中项背后那块 --accent，只在单值的组里有，而且要等它量到一个被选中的段之后才有。它是移动，不是交叉淡入淡出，所以眼睛跟的始终是同一个东西。' },
      { hash: '8a523396', element: '分段', description: '一个 --control-h-sm 高的按钮。在单值的组里，它只改字色，填充交给背后那块色块；在多值的组里，它自己填充，因为没有任何东西在滑。' },
      { hash: '4ef43d1a', element: '分段内容', description: 'children，排成一行 gap-2。这里没有 Button 那样的 iconOnly 通道，所以一个只有图标、没有文字的段，就是一个没有名字的段。' },
    ],
    practices: [
      ['4979e483', '单值的组要给一个 defaultValue 或 value。色块要等量到一个被选中的段之后才出现，所以一个初始为空的组，就是一条什么都没标记的空条。'],
      ['dc9df66a', '给这一条一个名字。放在 Field 里时由它的 label 通过 aria-labelledby 来给——根节点是 div，htmlFor 没有任何东西可绑——单独站着时它需要自己的 aria-label，而在 type="single" 下，radiogroup 正是靠这个被播报出来的。'],
      ['09a27698', '只有图标的段要给它自己的 aria-label：这里没有任何东西会替你去掉文字或补上名字，所以一条由三个图形组成的条，播报出来是三个没有名字的按钮。'],
      ['4b001e1f', 'type="single" 有 radio 的语义，却没有 radio 的行为：按一下已经选中的那一段会取消选中并提交一个空字符串，所以拿它做的视图切换器，可以被切到没有任何视图的状态。'],
      ['72d98aa0', '每一段都是 --control-h-sm——舒适密度下 36px，data-density="compact" 下 30px——都低于 44px 的指针目标下限（WCAG 2.5.5）。要给拇指用的条，得自己另设高度。'],
      ['cb73020e', '不要往里放六个选项。这一条既不换行也不滚动，所以超过五段左右它就直接溢出容器了——何况那种东西本来就该是 Select 或 Combobox。'],
      ['7e265d72', 'Field 的 required 标得住单值的条，标不住多值的条：多值的那条是一个 role="toolbar"，压根收不下 aria-required，所以在 type="multiple" 下，那个星号就是全部的标记。'],
    ],
  },
}
