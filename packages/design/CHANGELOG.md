# @misoto22/design

## 0.9.0

### Minor Changes

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`2e7ca63`](https://github.com/Misoto22/misoto22-design/commit/2e7ca6313dcf93e856ab616c3f6f9017d6d53f8b) Thanks [@Misoto22](https://github.com/Misoto22)! - `SidebarBranch` — a row that opens onto more rows — plus a `badge` slot on
  `SidebarGroup`, and a 16rem rail.
  
  Nesting is the thing a rail is for and the thing a flat list of groups cannot
  do: a workspace with projects in it, a folder with documents in it, a service
  with its environments. The line it draws is between a PLACE and a HEADING —
  `SidebarGroup` is a heading over a set and has neither an icon nor a state
  because it is not somewhere you can be; a branch has both because it is.
  
  Children sit behind the same hairline a group draws, one indent further in, so
  depth reads as depth. Two levels is what the indent has room for at this width;
  a third is a horizontal scrollbar with an outline in it. Collapsed to icons a
  branch is its icon and its children are not drawn — a nested glyph under an
  unnested one is two marks with no visible relationship.

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`ab4d16a`](https://github.com/Misoto22/misoto22-design/commit/ab4d16a30964bf45cec0a6b53be8a8a6b465ce77) Thanks [@Misoto22](https://github.com/Misoto22)! - `Sidebar` — a navigation rail down the side of an application, with the control
  that hides it living on the thing it hides.
  
  Composed rather than configured: `SidebarProvider`, `Sidebar`, `SidebarHeader`,
  `SidebarContent`, `SidebarGroup`, `SidebarItem`, `SidebarFooter`,
  `SidebarSeparator`, `SidebarTrigger` and `useSidebar`. A rail is a header, a
  scrolling middle and a footer, and every product wants different things in all
  three; what the component owns is the part that is the same everywhere — the
  width, the edge, the scrolling, and what happens when it closes.
  
  - **Closing has three shapes.** `icon` keeps the rail and drops the labels,
    which suits a fixed set a reader learns the shape of. `offcanvas` takes the
    whole rail away, which suits a long index nobody memorises — ninety-two rows
    collapse to ninety-two identical file icons, which is width answering
    nothing. `none` is a rail that does not close.
  - **The trigger belongs inside.** A control that hides a thing lives on the
    thing: in an application's masthead it is one more anonymous icon in a row of
    them, with nothing connecting it to the column it operates.
  - **A collapsed row is still a named row.** The label leaves the layout — a
    `sr-only` label still occupies the flex row's gap — and becomes the row's
    tooltip, because an icon alone is a guess for a sighted reader and nothing at
    all for a screen reader. The provider supplies the tooltip provider that needs,
    so the icon state works without the app being told to wrap itself in one.
  - **A `<nav>`, not an `<aside>`.** The element decides the landmark, and a rail
    of links announced as "complementary" is not the one a reader jumps to when
    they go looking for the navigation.
  - `--sidebar-w` and `--sidebar-w-icon` are tokens, because the shell beside the
    rail has to reserve exactly what the rail believes it is.

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`86644c3`](https://github.com/Misoto22/misoto22-design/commit/86644c3819dc88558adbe3d28cacae451024579b) Thanks [@Misoto22](https://github.com/Misoto22)! - Every theme axis default now has a name, so a subtree can opt OUT of an
  ancestor's theme rather than only into a different one.
  
  `[data-surface='paper']`, `[data-rules='hairline']`, `[data-type='editorial']`
  and `[data-density='comfortable']` join `[data-radius]`, which already worked
  this way. Each sits on the rule that declares the defaults rather than
  restating them, so there is nothing new to drift.
  
  The gap this closes: "the White Reset" used to be spelled "write no attribute",
  which works exactly once — at the root. Inside a page whose root carries a
  theme, an unset axis is not the default, it is whatever the ancestor said. Five
  theme specimens on one page each inherited whichever theme the reader had
  applied to the site, and all five showed the same colours.
  
  Two corrections found by the browser sweep, in the same layer:
  
  `[data-density='comfortable']` first landed on a `:root` block that also carries
  the status colours, the floating surfaces and the motion steps, so every element
  declaring the default density re-declared the whole LIGHT palette on itself — in
  dark mode, a light `--danger` painted on a dark ground. A neutral value may only
  restate the axis it names, so density now sits on a rule holding nothing else.
  
  And the dark block was missing the compound forms — `[data-mode='dark'][data-surface='paper']`
  and the rest — so a dark subtree that named its own default surface got the light
  one back.

- [#67](https://github.com/Misoto22/misoto22-design/pull/67) [`74b34c5`](https://github.com/Misoto22/misoto22-design/commit/74b34c5379d8cfc76141a85771753a2fa5a4c163) Thanks [@Misoto22](https://github.com/Misoto22)! - Two controls the forms group was missing, and the way out of the one a slider
  cannot do: `ColorPicker`, `NumberField`, and `editable` on `Slider`.
  
  The gap was written down in the package's own documentation. `Slider`'s
  catalogue entry said "put an `Input` beside it when the exact number matters",
  which is a component library telling a caller to build the missing half by hand
  and keep two controls in step themselves. There was no numeric control with a
  range and no colour control at all.
  
  - **`ColorPicker`** — a swatch trigger and a panel that works in OKLCH. That is
    the substance rather than the styling: in HSV, which is what
    `<input type="color">` and most libraries use, a row of constant "lightness"
    visibly darkens as it saturates, so a reader tuning a palette is fighting the
    instrument. The plane is normalised to the gamut row by row, so its whole
    surface is reachable instead of a lens of colour inside bands of clipped
    duplicates, and the hue strip is taken at the lightness already chosen. It
    reads and writes hex, `rgb()`, `hsl()`, `oklch()` and `color(display-p3 …)`;
    the notation a caller passes in is the notation they get back. The plane is a
    group of two real sliders under the canvas rather than key handlers on it, so
    the arrows move it and a screen reader announces which axis it is on — the
    part a 2D picker usually leaves out, and leaving it out makes the control
    unusable rather than merely awkward.
  - **`NumberField`** — a real `<input type="number">` in the shared control box,
    with a grip that sweeps the value as it is dragged, one step every 4px and ten
    with Shift held. A value that is TUNED — a duration, a line height, an offset
    — is found by passing through its neighbours, not by typing candidates one at
    a time. Clamping happens when the field is left rather than on every
    keystroke, because a minimum of 10 otherwise makes 50 unreachable: the `5` is
    pushed up before the `0` arrives.
  - **`Slider`'s `editable`** — turns the readout into a box per thumb, showing
    `format`'s output at rest and the bare number on focus, so a reader still sees
    "$1,200" and a typist is never asked to type a currency symbol back. A typed
    value is held inside the neighbouring thumb as well as inside `min` and `max`,
    which is the bound a dragged one cannot cross and a typed one can.
  
  `Slider` is now controlled from its own state whether or not the caller controls
  it, because a number typed into the readout never passes through Radix — left as
  it was, the thumb stayed where it had been while the figure above it moved.
  
  The colour maths is adapted from [DialKit](https://github.com/joshpuckett/dialkit)
  (MIT, Copyright (c) 2026 Josh Puckett); the notice travels with it in
  `src/lib/color.ts`.

### Patch Changes

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`f3b6018`](https://github.com/Misoto22/misoto22-design/commit/f3b601898d5d4acf0a1c7602322412c4b857ae2f) Thanks [@Misoto22](https://github.com/Misoto22)! - The rail stops looking like a terminal listing.
  
  A `SidebarGroup` heading was set in the MONO face at 15px medium. Ten of those
  stacked in a column read as a code listing rather than as a navigation: mono is
  this system's voice for code, metadata and figures, and a navigation heading is
  none of those. The heading is now the same face and size as its rows and
  outranks them by weight and by one step of ink — the two signals that can rank a
  row without changing what kind of thing it is. Counts come off mono too.
  
  `NavItem` tightens with it: `--radius-sm`, and the padding a 14px row wants
  rather than the padding a 15px one did.

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`2a1d613`](https://github.com/Misoto22/misoto22-design/commit/2a1d613e3193acc901eba8222656e684200a73a7) Thanks [@Misoto22](https://github.com/Misoto22)! - `BulletChart` draws its target where the target is.
  
  Two ways the rule went missing, and the second one is the common case.
  
  A fixed half-width pull put a target at the bottom of the scale half outside
  the track, where `overflow-hidden` took it — so "Open incidents, target 0" drew
  no target at all, on the one measure whose whole point is the distance from it.
  The pull is proportional now: flush at the start at 0, flush at the end at 1,
  centred on its position everywhere between.
  
  And the rule is drawn in `--ink` on a bar drawn in `--ink`, so wherever the
  target sat INSIDE the achieved range it was an ink rule on an ink bar and
  simply not there — which is every measure that is meeting its target. It now
  carries a paper halo, so it reads against the bar and against the bands alike.

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`73f7427`](https://github.com/Misoto22/misoto22-design/commit/73f7427363fc4a5f43b5a07adb09842bcb582fd6) Thanks [@Misoto22](https://github.com/Misoto22)! - Diagram edges go straight when straight is available.
  
  Two bugs, one symptom. The port spread keyed on the word `auto` rather than on
  the face a line would actually use, so every auto-routed line leaving one node
  counted as sharing a face with every other — a node with one line going right
  and one going down had both nudged off centre to make room for each other on a
  face neither was on. Each line then arrived a few units out of true, and the
  router answered that with a dogleg: two corners, an S, and a line that looks
  like it is avoiding something.
  
  The spread now keys on the resolved face, and a line whose two ends are within
  two corner radii of each other is drawn straight rather than kinked — below
  that threshold the dogleg cannot even draw its own corners. Real turns keep
  their elbows.

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`7ef871e`](https://github.com/Misoto22/misoto22-design/commit/7ef871ee1b064138380c1978b8842a3287fc7e26) Thanks [@Misoto22](https://github.com/Misoto22)! - A floating panel now reads as floating, and a list draws one highlight rather
  than two.
  
  **Depth.** Every overlay — menu, popover, select, dialog, sheet, palette — sat
  on `--paper` over a page of `--paper` with a hairline between them, so nothing
  said the two were different surfaces. `--panel-lift` is the offset under them,
  and it does not break Law 2: the law says a box-shadow is never BLURRED, not
  that there is never one. Two hard steps in the rule colours, which is a stack
  seen from the front — the flattest way to say depth without drawing light.
  
  **One highlight.** `SidebarItem` drew the current page filled and filled a row
  under the pointer, which is two rows claiming to be where the reader is. While
  the pointer is in the list the fill is the pointer's, and it returns to the
  current row when the pointer leaves. `aria-current` never moves — nothing about
  what is TRUE changes, only what is drawn.

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`b28c818`](https://github.com/Misoto22/misoto22-design/commit/b28c81871b943c04a7d44e6b7d547c972554650b) Thanks [@Misoto22](https://github.com/Misoto22)! - `TabsList` no longer grows a vertical scrollbar beside a row of tabs.
  
  `overflow-x: auto` on its own computes `overflow-y` to `auto` as well, and the
  active trigger's `-mb-px` rule leaves the content exactly one pixel taller than
  the box — enough for a browser to draw a full-height scrollbar next to a strip
  with nothing to scroll. A strip only ever scrolls sideways, so it now says so.

- [#69](https://github.com/Misoto22/misoto22-design/pull/69) [`1acaffa`](https://github.com/Misoto22/misoto22-design/commit/1acaffac34f22c889d13eeac3b495b659fed1865) Thanks [@Misoto22](https://github.com/Misoto22)! - Three things that did not line up.
  
  **`Sidebar` renders without a provider.** It threw, which is defensible for a
  hook a consumer called by hand and wrong for the component: `<Sidebar>` on its
  own is the first thing anybody writes, and the documentation site's own props
  panel renders exactly that and got an error boundary instead of a rail. The
  parts now fall back to the state a rail with no controls would be in — open,
  not collapsible. `useSidebar` still throws, because a call to the hook is code
  asking for state nothing is keeping.
  
  **`ErrorState`'s code was set `leading-none`.** At the title step this face
  draws about 62px of ink and a line box of exactly the font size is 47, so the
  figures overflowed their own box by seven pixels at each end — pressing against
  the eyebrow above and eating a third of the gap to the heading below. It has a
  real line box now, and the space the layout asks for is the space that appears.
  
  **`TD` says why it is top-aligned, and when not to be.** A 36px row action
  beside 16px of text makes a 52px row, and top-aligned every other cell hangs at
  the top of it with twenty pixels of nothing underneath.

## 0.8.0

### Minor Changes

- [#60](https://github.com/Misoto22/misoto22-design/pull/60) [`1ab9eed`](https://github.com/Misoto22/misoto22-design/commit/1ab9eed7c0e463df5539af2db3facfa9648a2dbb) Thanks [@Misoto22](https://github.com/Misoto22)! - The package tells an agent when it gets a component wrong, and reaches agents
  that are not Claude Code.
  
  Six gaps, found by re-reading what the ecosystem settled on since the agent
  surface shipped.
  
  **Development warnings, written to be repaired from.** The skill documented a
  handful of ways to misuse a component that fail *silently*, and documentation
  only helps a reader who went looking — the whole problem being that nothing told
  them to look. Now the component says it where it happens, in the shape an agent
  can act on without asking: a stable code, the offending field, and an imperative
  fix.
  
  - `FIELD_CONTROL_NOT_LABELLABLE` — `<Field><div><Input /></div></Field>` renders,
    and the label points at the div. This is the failure that looks most correct.
  - `FIELD_CONTROL_NOT_WIRED` — no single element to wire at all.
  - `BUTTON_ICON_ONLY_UNNAMED` — an `iconOnly` Button with neither `aria-label`
    nor `aria-labelledby` is announced as "button" and nothing else.
  - `REQUIRED_NAME_BLANK` — `<Table caption="">` satisfies the type and leaves the
    table anonymous. Applied to `Table.caption`, `Progress.label`, `Select.label`,
    `Combobox.label` and `FloatingIconButton.label`; deliberately not to
    `Avatar.alt`, where an empty string is the correct markup for a decorative
    image.
  
  Each fires once per problem, and every call site is behind
  `process.env.NODE_ENV`, so none of it reaches a production bundle.
  
  **`init` reaches more than one agent.** It wrote only `.claude/skills/`, which
  handed Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Cline, Zed and Warp
  nothing. It now writes `.agents/skills/` — the path all of those share — and
  adds `.claude/skills/` when the project already has one. `--agent agents` or
  `--agent claude` picks one.
  
  **Pointer files at the package root.** `AGENTS.md`, `CLAUDE.md` and `llms.txt`
  now ship in the tarball. An agent exploring `node_modules` looks for those
  filenames before it opens a README or reaches the network, and found none of
  them. They are pointers only, so they cannot go stale between releases. The
  `AGENTS.md` doubles as the nested subproject file for anyone working on the
  package in its own repository.
  
  **Prompt-based evals.** `skills/misoto22-design/evals/evals.json` carries six
  tasks with the identifiers correct output must and must not contain. `claims.json`
  proves the rules match the package; it cannot prove an agent given the rules
  writes correct code, and this is the half that can. Every `must_use` identifier
  is checked against the real export surface, so an eval cannot quietly start
  expecting something the package no longer ships.
  
  Also documented: `npx skills add Misoto22/misoto22-design` already works and
  nothing said so.

- [#64](https://github.com/Misoto22/misoto22-design/pull/64) [`4807494`](https://github.com/Misoto22/misoto22-design/commit/4807494fc44cd571a8e9b37c3e5f4abe8db3eaa7) Thanks [@Misoto22](https://github.com/Misoto22)! - Sixteen charts that drew a readable, plausible, wrong picture.
  
  None of these threw, none looked broken, and none could be caught by rendering
  the chart and looking at it — the plot was always confident. What they had in
  common is that the picture disagreed with the rows behind it, and the reader had
  no way to tell.
  
  - **`BarChart`'s `buffer` hatched the last VISIBLE bar, not the last row.**
    `dataLength` came from the brushed window, so brushing back into the middle of
    a range drew a month that closed in March as still being counted. It now
    resolves the last row's position in the window, and hatches nothing when that
    row is off the end of it.
  
  - **`BarChart` painted `Math.max(0, height - 3)`.** Anything under three pixels
    rendered at zero height, so a count of two on a scale topping out at a thousand
    was pixel-identical to a category with no rows — while the invisible
    full-column hit rect still caught the pointer, giving the reader a bar to hover
    that was not there. A bar with a value on it is now floored at one pixel.
  
  - **`TreemapChart` emitted `<desc>{chartId}</desc>` inside every tile.** The
    comment called it a hidden id; `<desc>` IS the accessible description, so every
    tile was announced as its name followed by an opaque generated string. Removed,
    along with the id it needed.
  
  - **`TreemapChart` dropped a leaf with no area and said nothing.** A tile at zero
    or below is laid out at zero width and never drawn, so the picture and the
    hidden leaf table disagreed about how many leaves there were. The table now
    prints such a leaf as "not drawn".
  
  - **`RadialChart.onSelectionChange` reported `value: 0` from the legend.** The
    arc handed its own number in; the legend had only a name, and `value ?? 0`
    invented one — so the same selection reported two different values depending on
    which control the reader used. The value now comes from the row, through
    `valueKey` or, failing that, the `dataKey` of the composed
    `<RadialChart.RadialBar>` — which also gives a chart that named neither a
    hidden table, where it previously had none at all.
  
  - **`AreaChart` silently ignored a `tickFormatter` under `stackType="expanded"`.**
    The axis wrote `isExpanded ? percentTick : (tickFormatter ?? defaultTick)`, so
    a formatter handed to the YAxis was indistinguishable from a typo. A caller's
    formatter now wins; the percentage default applies when there is none.
  
  - **`Histogram` discarded observations outside explicit `bins` edges.** The
    tooltip's share-of-total was taken over the bins, so it always summed to 100%
    however much of the sample the edges cut off — the one number that would have
    revealed the tail was the one that hid it. Out-of-range observations now count
    toward the share and get their own "Below" and "Above" rows in the table.
  
  - **`BigNumber` announced a verdict on a change of zero.** The tone, the arrow
    and the word all said "no change" while the sr-only text still took the
    intent's side, so `{ value: 0, intent: 'up-is-good' }` was read out as "no
    change, worse". There is no direction for an intent to judge, so the verdict is
    now dropped with it. `value` also gains an empty state — `null` prints an em
    dash with "No data" behind it rather than leaving a label over a blank line.
  
  - **`Sparkline` drew an unchanged run along the floor.** `span = max - min || 1`
    normalised every point of a constant series to the BOTTOM edge, so "unchanged"
    and "pinned at its worst" were the same picture — in a column of sparklines,
    the one distinction that matters. `Heatmap` answered a zero span with the
    middle and `BulletChart` with the start; all three now agree on the middle,
    through one shared `fraction`.
  
  - **`Heatmap` stretched its domain with a number it never drew.** Values were
    collected from every cell, but the grid renders by row-and-column lookup — so
    one misspelt header inflated the derived domain invisibly and pushed every
    drawn cell into the first fraction of the ramp. The domain now comes from the
    cells the grid can place.
  
  - **`BulletChart` clamped without saying so.** A value past the domain filled the
    track exactly as the domain's top did; a notch at the end of the track now says
    it happened. Range bounds outside the domain were also filtered before the band
    label was built, so `[60, 80]` on `[0, 50]` produced one flat band AND lost the
    bounds from the table — the label now names what the caller set.
  
  - **Seven charts had no empty state at all.** `PieChart`, `RadarChart`,
    `RadialChart`, `SankeyChart`, `ScatterChart`, `FunnelChart` and `TreemapChart`
    drew a named figure over a blank box at zero rows, and `ChartDataTable` renders
    nothing below one row — so the picture and its text equivalent went silent
    together and "no data" looked exactly like "failed to load". `BarList`,
    `BigNumber` and `Heatmap` were in the same position. The state now lives in
    `ChartFigure`, which every chart root already wraps itself in, and every chart
    in the package routes through it.
  
  - **`ScatterChart`'s `isLoading` was hard-coded `false`.** It is now a prop, with
    the same badge every other chart shows.
  
  - **`defaultSelectedDataKey` and its siblings seeded `useState` once.** Nine
    charts had a default and no controlled counterpart, so a call site that wanted
    a chart's selection to follow a filter, a route or a sibling chart had no way
    to say so — the prop that looks like the way to do it silently was not. Each
    now takes `selectedDataKey` / `selectedSector` / `selectedBar` /
    `selectedNode` beside its default, through one shared hook.
  
  - **`FunnelChart` emitted an unreferenced `<defs>` block.** The root generated
    stage gradients under its own `useId` while `<Funnel>` generated and painted
    from its own — one gradient definition per stage, per chart, drawn and never
    used.
  
  The three gaps that were "chart N forgot what charts 1 to N-1 do" are now gates
  rather than review items: the shared chart fixture requires an empty render per
  chart, and the suite walks every chart for its empty state and for the keyboard
  cursor over its plot. Recharts 3.8 has no `accessibilityLayer` for `Sankey` or
  `Treemap`, which is recorded as the exception it is rather than left looking like
  an oversight.

- [#64](https://github.com/Misoto22/misoto22-design/pull/64) [`4807494`](https://github.com/Misoto22/misoto22-design/commit/4807494fc44cd571a8e9b37c3e5f4abe8db3eaa7) Thanks [@Misoto22](https://github.com/Misoto22)! - Nine places where what was drawn and what was announced were two different
  things.
  
  **Two overlays stayed reachable after they visually closed.**
  
  - **`AppShell`'s closed drawer was still in the tab order on a phone.** It was
    translated off-screen and nothing else — no `inert`, no unmount — so every
    link in it stayed focusable and stayed in the accessibility tree, and Tab from
    the toggle walked into a menu nobody could see. Below `md` the closed drawer
    is `inert` now, decided by a media query rather than by `open` alone, because
    above the breakpoint that element is the application's navigation column and
    hiding it would be the larger bug. Closing it — by Escape or by the scrim —
    returns focus to the toggle: focus inside an inert subtree is focus the
    browser throws away, and the scrim is worse, since it is itself the focused
    element and it unmounts. The drawer also carries `data-m22-animated` now, so
    the reduced-motion rule reaches its `transition-transform`.
  
  - **`Calendar`'s month picker could be left open over focusable content.** The
    panel is opaque and drawn in place of the day grid, but the grid stayed
    mounted and focusable underneath it, so Tab from the last month walked onto a
    day the reader could not see — and past the caption that owns the Escape
    handler, so the panel could no longer be dismissed either. Tab wraps inside
    the panel now, and the role follows the behaviour rather than the other way
    round: it was `group` for exactly as long as Tab walked out of it, and it is
    `dialog` now that focus stays. No `aria-modal` — the panel covers this month's
    grid, not the page.
  
  **Toast descriptions were unreadable in dark mode.** The `Toaster` never passed
  `theme`, so sonner defaulted to `light` and stamped `data-sonner-theme="light"`.
  Its stylesheet hard-codes the description at `#3f3f3f` and overrides that only
  under its own dark theme, and the inline token style could not reach it — so on
  `--paper: #0d0d0d` every `toast(title, { description })` put dark grey on near
  black, roughly 1.85:1, and lost its second half. `theme` now follows the
  `data-mode` attribute on `<html>`, observed rather than read once, so it also
  follows a reader who switches with the Toaster already mounted. Deliberately not
  sonner's own `theme="system"`: that reads `prefers-color-scheme`, and this
  system lets a reader override the operating system — a toast following the OS
  while the page follows the override is the same defect pointing the other way.
  Pass `theme` yourself and it still wins. The `--success-*` and `--error-*`
  custom properties are now emitted only under `richColors`, which is the only
  state sonner reads them in; at the default they were six inert declarations
  sitting in the element's style attribute looking like the source of a success
  toast's colour.
  
  **Four things in the loading family accepted an instruction and did nothing
  with it.**
  
  - **`Progress` showed a reader who asked for less motion a finished bar.** The
    indeterminate sweep carried `motion-reduce:w-full motion-reduce:opacity-40`,
    so under `prefers-reduced-motion` an operation still running was drawn as a
    full-width bar at rest — which is what a completed one looks like. It now
    stops where it is drawn, a quarter of the track at the inline start, the same
    answer `Spinner` gives: a partial shape still reads as unfinished.
  
  - **`Progress` accepted `max` and disagreed with it.** `max` reached Radix
    through `...rest` and was announced as `aria-valuemax`, while the width was
    `value` clamped to 100 — so `max={500}` with `value={100}` painted a full bar
    and told a screen reader "100 of 500". The width is computed from `max` now,
    and `max` is a documented prop rather than an inherited one. A `max` that is
    not a positive number falls back to 100 exactly as Radix does, so the picture
    and the announcement cannot come apart.
  
  - **`Spinner`'s `className` missed the ring.** It merged onto the outer
    `inline-flex` wrapper while `size` and `tone` went on the inner span, so
    `<Spinner className="size-8" />` grew an invisible box around an unchanged
    18px circle. `className` reaches the ring now, after `size` and `tone` and
    overriding both.
  
  - **A bare `<Skeleton />` rendered nothing.** It set a fill colour and no
    dimensions, and a `div` is already full width, so the one thing it could not
    supply for itself was the one thing missing: it was a zero-height box. The
    base falls back to `h-3`, the height `SkeletonLine` already chose, and any
    class the caller passes replaces it.
  
  **`Article` discarded `children` when `html` was also passed** and said nothing
  about it, and `html=""` counted as present — so a pipeline that rendered an
  empty string took a page of hand-written children down with it. It says so in
  development now (`ARTICLE_HTML_AND_CHILDREN`), with the field and an imperative
  fix, like the other warnings. The behaviour is unchanged: `html` still wins,
  because there is no wrapper that could hold both without costing every block
  inside it its spacing.
  
  **Accessible names that could only be English are now props.** `Pagination`
  named its controls `"Page 3"`, `"Previous page"` and `"Next page"` with only the
  nav's own `label` exposed; `Calendar` did the same for `"Earlier years"`,
  `"Later years"`, `"Previous year"`, `"Next year"` and its two panel names —
  while its month names already followed `locale`, which is what made the chrome
  around them read as an oversight rather than a policy. `AppShell` and
  `Breadcrumb` have always exposed every string, so the package was inconsistent
  with itself. `Pagination` gains `previousLabel`, `nextLabel` and `pageLabel`;
  `Calendar` gains the six `CalendarLabels` props. `pageLabel` is a function
  rather than a template because "Page 3" is a phrase whose parts move around
  between languages. Every default is the English that was there before.

- [#58](https://github.com/Misoto22/misoto22-design/pull/58) [`dd69487`](https://github.com/Misoto22/misoto22-design/commit/dd69487bc62b61f10b7314d3b6ea718b46959c66) Thanks [@Misoto22](https://github.com/Misoto22)! - Five content primitives: `Text`, `Heading`, `Code`, `CodeBlock` and `Markdown`.
  
  The package had `Article` — a whole reading column, styled from element
  selectors — and nothing between it and raw JSX for a single paragraph or one
  heading. The evidence was not theoretical: the documentation site had
  hand-rolled a private `CodeBlock` of its own, and a template pass had styled a
  raw `<pre>` against the tokens because the package exports no code block. A
  design system whose own site has to build a primitive has a gap in the package.
  
  - **`Text`** — the system's paragraph. Four steps of type, three rungs of ink,
    and `as` to change the element without changing the look. The default tone is
    `--ink-2`, not `--ink`: a page whose paragraphs are all full-strength ink has
    spent the top of the ladder on its body copy.
  - **`Heading`** — `level` sets the element, `size` sets the look, and they are
    two props because every heading component that takes one number bends either
    the outline or the type to reach the other. `size` defaults from `level`
    through the system's ladder, which SKIPS a step between the first two
    levels — `--fs-lead` over `--fs-heading` is a ratio of 1.14 and reads as an
    accident, where `--fs-title` over `--fs-heading` is 1.86 and reads as a
    hierarchy. Levels five and six are the mono kicker, as they are in
    `article.css`.
  - **`Code`** — inline code, as a real `<code>`, sized in `em` so the same token
    is proportionate in body copy and in a table cell.
  - **`CodeBlock`** — title, language label, line numbers, banded lines, a
    `maxHeight` whose overflow scrolls inside a focusable, named
    `role="group"`, and a copy button that copies the `code` string rather than
    the rendered markup. The body is a group and not a `region` on purpose: a
    region is a LANDMARK, one of the handful of major sections a reader navigates
    a page by, and a snippet is not one — an article carrying three fenced blocks
    would otherwise put three landmarks called "Code" into that map. The group
    keeps the tab stop and keeps the name; it just stays out of the landmark
    list. Highlighting stays out of the package: pass `html` from a build-time
    Shiki pass, or pass nothing and the block renders the string as text.
    `lineNumbers` and `highlightLines` are typed out of the `html` form, because
    they are a per-line structure and `html` is one opaque string — passing both
    is a compile error rather than a prop that silently renders nothing.
  - **`Markdown`** — a Markdown STRING into system-styled nodes. This is the
    headline gap: user-generated content, a model's answer or a README had no
    path into the system at all, because `Article` takes trusted HTML through
    `dangerouslySetInnerHTML` and is documented that way.
  
  No new runtime dependency, and that was the decision worth writing down.
  markdown-it is what the documentation site uses, but the site is an app and this
  is a library, where the dependency list is part of the contract. Measured with
  the same esbuild pass `check:size` runs, markdown-it is 110.7 kB minified
  against the 38.9 kB the package had left under its bundle budget. So `Markdown`
  parses the subset this system already styles — headings, prose, fences,
  blockquotes, nested lists, rules, and inline emphasis, code, links and images —
  and takes a `parse` function for everything else. It emits React elements rather
  than markup, so there is no `dangerouslySetInnerHTML` in that path at all: no
  sanitiser to configure and none to get wrong. A link whose scheme is not
  `http`, `https`, `mailto` or `tel` renders as plain text.
  
  `headingLevelStart` shifts a whole document down, so markdown dropped inside an
  `<h2>` section starts at `<h3>` instead of opening a second `<h1>`, and every
  heading carries a stable id slugged from its own text in any script — exported
  as `slugify`, so a table of contents can arrive at the same ids without reading
  them back off the DOM.
  
  `Markdown` and `Article` stay separate and are composable: `Markdown` turns a
  string into nodes, `Article` is the reading column those nodes sit in, and
  either works alone. It renders a fragment rather than a wrapper, which is what
  makes the nesting work — `Article`'s rhythm is a direct-child combinator, so any
  element between the two would cost every paragraph its spacing.
  
  The whole package bundles to 390.6 kB minified against a 420 kB budget, up
  9.5 kB; the compiled stylesheet is 71 kB against 90 kB, up 3.3 kB. Importing one
  leaf component is unchanged at 27.3 kB, 7% of the whole.

- [#64](https://github.com/Misoto22/misoto22-design/pull/64) [`4807494`](https://github.com/Misoto22/misoto22-design/commit/4807494fc44cd571a8e9b37c3e5f4abe8db3eaa7) Thanks [@Misoto22](https://github.com/Misoto22)! - Twelve fields in `@misoto22/design/diagrams` that typechecked and drew something
  else — and the half of every figure a screen reader was never given.
  
  Each of these renders without an error, a warning or a missing box. The
  specification is valid, the picture is not the one it describes, and the only
  way to find out was to look at the drawing already knowing what it should have
  been. Every one now does what its type implies, or says so by name in
  development. None of the warnings reaches a production bundle.
  
  **Placement that quietly disagreed with the specification.**
  
  - **An `ArchitectureFigure` component that declared neither `row` nor `col` was
    drawn at row 0, column 0** — along with every other component that declared
    neither, which is one plate with the rest underneath it. They now flow into
    the next free cell in declaration order, wrapping at `layout.cols`, stepping
    around whatever the placed ones claimed. `layout.cols` had been accepted and
    read by nothing.
  
  - **`layout.cellW` moved plates without widening them.** The pitch came from
    the layout and the plate's own width from the module default, so `cellW: 240`
    was a grid with wider gaps rather than wider boxes.
  
  - **Two components on one cell** are still one plate over another — there is no
    second place to put the second plate — but development now prints
    `DIAGRAM_CELL_COLLISION` naming both.
  
  - **A spec object mutated in place drew the picture it was first given.** The
    model is memoised on the spec's identity, and a `push` does not change it.
    All five figures now print `DIAGRAM_SPEC_MUTATED` when they catch that.
  
  - **An unknown `lane` id resolved to lane 0** in `WorkflowFigure` and
    `LifecycleFigure`, drawing the step in the right column and the wrong band.
    It still does — there is nowhere else to put the box — but it prints
    `DIAGRAM_LANE_UNKNOWN`, and in a lifecycle it no longer enrols the state in
    the implicit main rail: a typo could previously add an arrow the machine does
    not have.
  
  - **A `DataflowFigure` node past the declared `stages`** is drawn past the last
    heading, under no heading at all. Now `DIAGRAM_STAGE_OUT_OF_RANGE`, and the
    text equivalent files it under a band named for what it is.
  
  - **`LifecycleFigure.yOffset` was accepted and deliberately dropped**, while
    `WorkflowFigure` and `DataflowFigure` both applied theirs — one field name,
    two behaviours, nothing in the type to say which. It is applied.
  
  - **A `SequenceFigure` message naming an undeclared participant** vanished from
    the picture and survived in the hidden summary as a raw id: the two halves of
    one figure disagreeing about what the exchange contains. Dangling edges are
    now dropped from both halves in every figure, and reported once as
    `DIAGRAM_EDGE_DANGLING`.
  
  **The text equivalent carried half the diagram.** Each figure publishes a
  `role="img"` picture beside a hidden list, and that list held nodes and edges
  only — so a workflow's lane axis and a data flow's stage axis, the second
  dimension of both diagrams, reached a screen reader not at all. The list is now
  grouped by that axis, which makes it structural rather than a phrase repeated on
  every row, and the statements that group nothing follow as sentences: an
  architecture boundary and what it encloses, a workflow phase and the columns it
  covers, a sequence segment and the messages inside it, an activation bar named
  by the calls it spans. A lifecycle state's step number joins its line, and the
  implicit rail — two of the three arrows in a three-state machine — is published
  for the first time. Selecting a node from the list is unchanged: exactly one
  control per node, wherever it is grouped.
  
  **Fields that typechecked and did nothing.**
  
  - **`WorkflowPhase.toCol` and `.variant` are drawn.** A phase's rule runs across
    the columns it claims instead of across the whole figure, so its extent is
    something a reader can see; `security` dashes that rule and `emphasis`
    thickens it.
  
  - **`WorkflowEdge.role` reaches the line.** `async` and `error` take the quiet
    dashed stroke the docstring had been promising for `error`; `return` keeps its
    open arrowhead; `main` and `branch` add nothing, because `mainPath` already
    draws that distinction as weight. An explicit `variant` still wins.
  
  - **`meta.views` and the three label nudges are documented as the no-ops they
    are**, the way `meta.viewBox` already was, and `column_fit: 'spread'` now
    describes what it does — the widest label sets the pitch for every column —
    rather than dividing the figure evenly, which it never did.
  
  **The chrome.**
  
  - **`DiagramExportMenu` reported a success it could not have known about.** With
    `onExport`, a handler that did nothing resolved exactly like one that wrote a
    file. `ExportResult` now carries `source`, and `ok` says only that the
    pipeline named by it finished.
  
  - **There was no transparent export in any format.** A new `background` prop
    takes `null` for a figure going onto a coloured page; JPEG is still flattened
    onto the reader's own paper, because a transparent JPEG is a black one. The
    serialiser behind all of it — `serializeSvg`, `rasterize`, `downloadBlob`,
    `exportFilename` — is exported from `@misoto22/design/diagrams`, so a caller
    who needs a different pipeline has something to build on.
  
  - **The five format rows are menu items.** They were plain buttons inside a
    `role="menu"`: no roving focus, no typeahead, and the menu stayed open over
    the file it had just written.
  
  - **`DiagramInspector` keyed its facts by label**, so a node read out of two
    files showed one row. Both render.
  
  - **`DiagramMinimap` asked for the one number that makes it lie.** A
    `DiagramCanvas` now reports the frame it was measured against on every view it
    emits, so `frame` is optional and wiring `onViewChange` through is enough. A
    `content` width of 0 — a ref measured on the first render — draws an empty
    plate rather than the artwork's top-left corner at full size; the viewport
    rectangle is clipped to the map; and a drag seeks only when it started on the
    map.
  
  - **`LifecycleFigure`'s plates take a pointer cursor** when the caller can
    select them. It is the one figure that builds its own group rather than using
    the shared plate, and it was the one figure showing a text caret over a
    control.

- [#64](https://github.com/Misoto22/misoto22-design/pull/64) [`4807494`](https://github.com/Misoto22/misoto22-design/commit/4807494fc44cd571a8e9b37c3e5f4abe8db3eaa7) Thanks [@Misoto22](https://github.com/Misoto22)! - The form controls now announce what they draw.
  
  `Field` drew a hint, an error and a required marker under six of the twelve
  controls it wraps and announced none of them. The wiring travelled by
  `cloneElement`, and each of those six dropped it: Radix's select root renders no
  DOM node at all, `Combobox` and `DatePicker` never spread what they were handed,
  the slider root is a roleless `<span>`, and `<label for>` does not bind to a
  `<div role="radiogroup">`. Every one of them rendered perfectly and was invisible
  to a screen reader, which is the only kind of defect a review of the browser
  cannot find.
  
  - **The wiring reaches the element that carries the role.** `Select`, `Combobox`
    and `DatePicker` put the id, `aria-describedby`, `aria-required` and
    `aria-invalid` on their TRIGGER — so the visible label clicks through to it and
    the message below is announced; `RadioGroup` and `ToggleGroup` take them on the
    group root; `Slider` moves them onto the THUMB, which is where `role="slider"`
    lives. Two limits are now stated rather than implied: the words above a group
    name it through `aria-labelledby` and do not click through, the way a
    `<legend>` does not, and `required` has nowhere to sit on `DatePicker`'s plain
    `<button>` trigger, where the asterisk is the whole of the marking.
  
  - **A trigger announces its value as well as its name.** `Select`, `Combobox`,
    `DatePicker` and `DateRangePicker` set `aria-label={label}` on a trigger whose
    text IS the current value, and `aria-label` outranks name-from-content — so a
    reader was told "Tags" and never "3 selected", and `DatePicker`'s `format`
    reached the screen and nothing else. The trigger is now named by the label and
    by its own value together: "Region, Australia". Inside a `Field` with a label,
    that label is the name and the control's own `label` is not repeated.
  
  - **`Select` reads `aria-invalid`.** It was the one control on `CONTROL_BASE`
    calling `isInvalid` with a single argument, so a `Field` error — or a form
    library — painted the message red under a resting border. `Combobox` picks up
    the same danger border.
  
  - **`<Slider label="Volume" />` renders a thumb.** The thumbs come from this
    component's own array, which was empty when neither `value` nor `defaultValue`
    was given, so the plainest possible usage drew a track with nothing on it to
    drag. It now falls back to the primitive's own default of one thumb at the
    minimum. Three more on the same control: `disabled` dims it (the old
    `disabled:` variant compiled to `&:disabled`, which never matches the `<span>`
    it was on), `format` becomes each thumb's `aria-valuetext` instead of changing
    only the printed readout, and `showValue` prints one name per thumb rather than
    the first name over a pair of numbers.
  
  - **`<Checkbox defaultChecked="indeterminate" />` draws the dash.** The glyph was
    chosen from `props.checked`, which an uncontrolled box never sets, so a
    partly-selected list showed the tick that means "all of them".
  
  - **`DatePicker` presets respect `disabledDates`.** The rail set the value the
    grid beside it would refuse. A shortcut landing on a blocked day is now drawn
    unavailable and refuses the click; a range preset is tested at its ends.
  
  - **Layout.** `NativeSelect`'s `className` now sizes the WRAPPER the chevron is
    pinned to — on the `<select>` it narrowed the box and left the arrow floating
    at the far edge of the row. Note the change of target: colours and borders sent
    through `className` no longer reach the `<select>`, which keeps `CONTROL_BASE`.
    `Select`'s trigger truncates its value, so one long option no longer makes the
    field taller than the one beside it.
  
  - **`aria-required` stays off a role that cannot take it.** A `Field`'s
    `required` around `<ToggleGroup type="multiple">` put the attribute on a
    `role="toolbar"`, where ARIA does not allow it.
  
  `Select`, `Combobox`, `DatePicker` and `DateRangePicker` accept `id`,
  `aria-describedby` and `aria-invalid` (and `aria-required`, where the role
  permits it) as ordinary props, so a form library can address them without a
  `Field`.

- [#64](https://github.com/Misoto22/misoto22-design/pull/64) [`4807494`](https://github.com/Misoto22/misoto22-design/commit/4807494fc44cd571a8e9b37c3e5f4abe8db3eaa7) Thanks [@Misoto22](https://github.com/Misoto22)! - Overlays now clear the surface that opened them, and reach the container that
  asked for them.
  
  **A select inside a modal form was painted behind the modal.** `--z-dropdown`
  resolved to `--z-drawer`, 100, while a dialog panel sits at `--z-modal`, 210.
  Every overlay in the package portals to `document.body`, so all of them are
  siblings in the root stacking context and the rank is the whole of the decision
  — there is no ancestor left to nest one inside another. A `Popover`,
  `DropdownMenu`, `Select` or `SearchableMenu` opened from inside a `Dialog` or a
  `Sheet` was therefore invisible in exactly the case it is most used.
  
  The ladder gains `--z-anchored` at 220, above the modal and below the toast, and
  `--z-dropdown` points at it. **`--z-palette` is removed**: it was read by
  nothing, and it could not have worked — a command palette is a `Dialog`, so it
  lands at `--z-modal`, and its order against a second modal is settled by
  document order, which moves a scrim and its panel together where a lone panel
  rank would have separated them. The count stays at seven ranks, and the
  reasoning is written into `tokens.css` beside the numbers.
  
  **`OverlayContainer` now redirects every overlay, which is what it always said
  it did.** `Dialog` and `Sheet` rendered the Radix portal with no container and
  never called `useOverlayContainer`; their props derive from `Content`, which has
  no `container`, so a caller could not pass one either. Both now read it — and
  switch from `fixed` to `absolute` when a container is named, because a `fixed`
  panel resolves against the viewport whatever element it is portalled into, so
  honouring the container without that swap would have moved the markup and left
  the picture unchanged. A modal inside a bounded frame now stays in the frame and
  inherits the `dir`, `data-density` and theme axes set there.
  
  **`SearchableMenu` filtered on the id instead of the label.** cmdk derives an
  item's value from the first string in `[value, children, ref]` and only falls
  back to the row's text when `value` is absent; this passed `action.id`, so with
  the opaque ids an application actually has, typing the words a reader can see
  matched nothing and the menu showed its empty state. The label's own text is now
  lifted into the row's keywords, with the id still the identity. A label built
  only from elements prints no text to lift, and development says so
  (`SEARCHABLE_MENU_LABEL_UNREADABLE`) rather than shipping a row nothing matches.
  
  **`icon` meant opposite things one import apart.** `DropdownMenuItem.icon` and
  `ContextMenuItem.icon` took the Lucide component; `CommandItem.icon` took the
  rendered element. All three now take either, and the wrong guess no longer fails
  at render.
  
  **`DropdownMenuGroup` and `ContextMenuGroup` are new.** Radix's `MenuLabel` is a
  bare `<div>` with no role and no `aria-labelledby` wiring, and `MenuGroup` — the
  one that carries `role="group"` — was not re-exported at all, so the sections a
  sighted reader saw arrived as one undivided list. The group renders the label
  inside itself and points the one at the other, which is not something a caller
  should have to remember. `DropdownMenuLabel` stays, for a line that heads
  nothing.
  
  **A dialog with no title says so.** The fallback accessible name is the literal
  string "Dialog", so every unnamed modal in an application announced identically
  — and passed an automated accessibility check while doing it, which is how the
  problem survives a review. The fallback still renders, because an unnamed modal
  is worse; development now warns `DIALOG_TITLE_MISSING`.
  
  **`SheetContent` carries `data-m22-animated`.** Its scrim always asserted that
  its fade was decorative and the panel never did, so under `prefers-reduced-motion`
  the fade was cancelled and the panel still travelled the full width of itself.
  
  **The portable CSS recipe was missing a layer.** `README.md` told an app that
  compiles its own Tailwind to import `tokens.css`, `semantic.css` and
  `keyframes.css`. `data-mode` and `data-density` live in `tokens.css` and
  survived; `data-surface`, `data-radius`, `data-rules`, `data-type`,
  `data-motion` and `data-chart-palette` are declared only in `themes.css`, which
  the recipe never mentioned — so a consumer wrote `data-radius="sharp"` and got
  no error, no warning and no corner. The split is deliberate: `themes.css` is its
  own export, attribute-scoped where `semantic.css` is `:root`-scoped, and the
  package's own tests hold the two apart. So the recipe names all four layers, and
  a test derives the axes from the stylesheets and fails when a documented recipe
  stops reaching one.

- [#58](https://github.com/Misoto22/misoto22-design/pull/58) [`dd69487`](https://github.com/Misoto22/misoto22-design/commit/dd69487bc62b61f10b7314d3b6ea718b46959c66) Thanks [@Misoto22](https://github.com/Misoto22)! - Four record-and-settings primitives — `DescriptionList`, `Toolbar`, `Timestamp`
  and `AspectRatio` — and three props that made a fourth and fifth component
  unnecessary.
  
  The evidence was a template pass: eight new pages built from the existing
  library, and a list of what had to be hand-rolled and how many times. The
  repeats are what shipped.
  
  - **`DescriptionList`** — a record's fields as a real `<dl>`/`<dt>`/`<dd>`. The
    most repeated shape in any detail page, and the one most often built out of a
    `<div>` grid — which looks identical and tells a screen reader there are two
    columns of unrelated text. `layout` is `row` or `stacked`, `divided` draws the
    hairlines, and an empty `items` renders `null` rather than an empty bordered
    box.
  - **`Toolbar`** — the sticky bar of actions at the edge of a working surface,
    built independently by two templates. Opaque `--paper` and not a blur, because
    content scrolls under it. It is a named `role="group"` and deliberately not
    `role="toolbar"`: that role promises arrow keys between the controls, and
    declaring it without roving tabindex tells a screen-reader user to press keys
    that do nothing.
  - **`Timestamp`** — an instant, rendered the one way the system renders them.
    The first paint is the UTC calendar date sliced straight out of the ISO string
    with no `Intl` involved, so the server and the hydrating client cannot
    disagree; the relative and locale-aware forms are applied after mount. The
    `datetime` attribute is the full ISO instant from the first render and never
    changes. A value nothing can parse renders an em dash, never the browser's
    literal `Invalid Date`.
  - **`AspectRatio`** — the one layout primitive that is genuinely hard by hand.
    The `padding-top` percentage trick resolves against the WIDTH, which is why it
    works and also why it breaks as a flex child. Here the box declares
    `aspect-ratio` and every direct child is stretched out of flow, so content
    with no intrinsic size still holds the box open.
  
  Three additions that are props rather than components:
  
  - **`Field` gains `description` and `layout="row"`** — the settings row, which a
    template hand-rolled three times. It is a layout on `Field` and not a
    `SettingRow` beside it, because the label wiring, the required marker and the
    message slot are the same three things either way. `description` explains the
    setting and sits under the label; `hint` explains the input and sits under the
    control. Both reach the control through `aria-describedby`. The association is
    `Field`'s existing `cloneElement` wiring, so it holds for `Input`, `Textarea`,
    `NativeSelect`, `Checkbox` and `Switch` — every control a settings row is
    built from — and not for the six composite controls that already carry their
    own `label` prop. That limit is now written into `Field`'s own documentation
    rather than only into the catalog.
  - **`Tag` gains `onRemove` and `removeLabel`** — instead of a `Token` component.
    A token is a tag with a remove button; the difference is one prop, and this
    system already ships three things that look alike. `removeLabel` is required
    alongside `onRemove`, because "Remove" repeated down a row of filters is eight
    controls a screen reader cannot tell apart.
  - **`Separator` gains `label`** — "or continue with" was two `Separator`s and a
    `span` at every call site. The rule is drawn twice, one `aria-hidden` piece
    either side of the words, so there is no ground to punch a hole in and the
    component never has to be told which surface it is on.

- [#64](https://github.com/Misoto22/misoto22-design/pull/64) [`4807494`](https://github.com/Misoto22/misoto22-design/commit/4807494fc44cd571a8e9b37c3e5f4abe8db3eaa7) Thanks [@Misoto22](https://github.com/Misoto22)! - Eight components that rendered correctly and described something else.
  
  Every defect here shipped a component that looks finished: no error, no warning,
  no missing box. What they had in common is that the failure was invisible in the
  browser and invisible in review, which is the only kind of defect a
  documentation pass cannot find.
  
  - **`Avatar` announced nothing without a photograph.** `alt` reached the DOM
    only through `AvatarPrimitive.Image`, which renders only under `src`, and the
    initials are `aria-hidden` — so every row of a user list where photographs are
    optional was an unnamed circle, however carefully `alt` was written. The ROOT
    now carries the name as `role="img"`, in both cases, and the image's own `alt`
    is empty so nobody is read twice. An empty `alt` still takes no role at all,
    which keeps the deliberate decorative case out of the tree rather than putting
    an unnamed image in it.
  
  - **`StatusPill`'s `tone` reached nothing a reader could hear.** It was
    forwarded solely to the inner `StatusDot`, which is `aria-hidden` by law, so
    "Degraded" in a warning pill and "Degraded" in a neutral one were the same
    sentence. The `warning` and `danger` tones now carry a visually-hidden
    severity word. `success` and `neutral` add nothing on purpose: they are the
    absence of alarm, which is what a reader already assumes.
  
  - **`Diagram` drew a confident picture of a different spec.** Three silent
    no-ops, all now reported by name in development and none reaching a production
    bundle. An edge between non-adjacent nodes, or one written `to`→`from`, drew
    no arrow and said nothing (`DIAGRAM_EDGE_NOT_ADJACENT`,
    `DIAGRAM_EDGE_UNKNOWN_NODE`). The same `edges` array was handed to every rank,
    so a pair of ids reused two levels down drew the arrow again down there — it
    is now resolved once for the whole figure and spent at the first pair that
    matches, so one edge is one arrow, and the duplicate id that caused it says so
    (`DIAGRAM_DUPLICATE_ID`). `accent` on a container and `direction` on a leaf
    both type-check and paint nothing; both are now reported
    (`DIAGRAM_ACCENT_ON_CONTAINER`, `DIAGRAM_DIRECTION_ON_LEAF`).
  
  - **`Table`'s scroll container was not a positioning context.** `sr-only` is
    `position: absolute`, so a visually-hidden label inside a cell resolved
    against the document — escaping the table's own scroll container and any
    `overflow-hidden` around it, and widening the page by however far the table
    happened to be scrolled. It is `relative` now. `ScrollArea`'s root already
    was; its viewport is now too, so an absolutely-positioned descendant travels
    with the content instead of hanging still over it.
  
  - **`ScrollArea` clipped the axis it did not scroll.** Radix sets the viewport's
    `overflowX`/`overflowY` from which `Scrollbar` children are mounted, so the
    old `orientation="vertical"` default left the horizontal axis `hidden`:
    content wider than the box was not merely unmarked, it was unreachable by
    every key and every gesture. The default is `both`. Narrowing it is still
    available, and is now a decision someone wrote down.
  
  - **`Breadcrumb` shipped crumbs that impersonated the current page.** A middle
    crumb with no `href` renders as a `<span>` inheriting the nav's `--ink-3-aa` —
    the same colour as the links beside it — and takes no `aria-current` either.
    Invisible in the browser, invisible in review; named in the console instead
    (`BREADCRUMB_CRUMB_NOT_LINKED`).
  
  - **`Card` rounded its corners and did not clip them.** A full-bleed image or a
    filled first child laid its square corners over the card's round ones. The box
    clips now; pass `overflow-visible` for the rarer card that deliberately
    overhangs.

- [#58](https://github.com/Misoto22/misoto22-design/pull/58) [`dd69487`](https://github.com/Misoto22/misoto22-design/commit/dd69487bc62b61f10b7314d3b6ea718b46959c66) Thanks [@Misoto22](https://github.com/Misoto22)! - `EmptyState` and `ErrorState` take a `level`, and stop deciding the document
  outline for the caller.
  
  Both rendered a heading at a level that was fixed and could not be passed in —
  `ErrorState` an `h1`, `EmptyState` an `h3`. That is not only a markup detail:
  the catalog entry for `ErrorState` already told readers "do not render it inside
  a shell that already has an h1", which was advice the API gave them no way to
  take. A rule the caller cannot follow is worse than no rule.
  
  Both now render through `Heading`, so the element and the size are separate
  props and the size is pinned by the component: `EmptyState` is `--fs-sub` and
  `ErrorState` is `--fs-heading` at every level. Moving a state down the outline
  is a fact about the document, not a request for smaller type.
  
  The two defaults differ, and deliberately:
  
  - **`ErrorState` defaults to `1`, unchanged.** It replaces the page rather than
    sitting inside one — its own ground, its own viewport, its own top clearance —
    so the page's single `h1` is the one it renders. Existing call sites render
    exactly the markup they did. Inside an app shell that already owns the page
    heading, pass `level={2}`.
  - **`EmptyState` defaults to `2`, changed from a fixed `3`.** It stands in for a
    whole view inside a page that already has an `h1`, so the level below that one
    is the level that does not leave a hole in heading navigation. The old `h3`
    was wrong in the ordinary case and impossible to correct.
  
  Neither is required. The correct placement has one answer often enough that
  making every call site restate it would buy nothing, and `Heading` already
  proves the point that a good default is worth more than a forced decision.
  
  **What a consumer has to do.** If you relied on `ErrorState` rendering the page
  `h1`, nothing — that is still the default. If you relied on `EmptyState`
  rendering an `h3` — a CSS selector, a snapshot, a test querying by level —
  pass `level={3}` to keep it, or update the expectation. Nothing else about
  either component moved.
  
  One rendering difference beyond the element: the heading now takes its
  line-height from the system ladder — 1.25 for `EmptyState`, 1.2 for
  `ErrorState` — where before it inherited the ambient 1.5. That is the same
  leading `article.css` gives a rendered Markdown heading, which is what makes a
  component page and a post read as one publication. Font size, face, weight,
  colour and the surrounding spacing are unchanged.

- [#58](https://github.com/Misoto22/misoto22-design/pull/58) [`dd69487`](https://github.com/Misoto22/misoto22-design/commit/dd69487bc62b61f10b7314d3b6ea718b46959c66) Thanks [@Misoto22](https://github.com/Misoto22)! - `Tag` owns the filter case, and `Markdown` finishes the link boundary.
  
  Both shipped hours ago and both were found by their first consumer.
  
  - `Tag` takes an `onClick`. The advice used to be to wrap a tag in a button at
    the call site, which is fine alone and invalid the moment the chip is also
    removable: the remove control is a real `<button>`, so the wrapper made a
    button inside a button — markup a parser splits into siblings, leaving a DOM
    neither the author nor the accessibility tree expects. A removable filter
    chip is an ordinary thing to want, so the component now owns it. With
    `onClick` the chip IS the button, carrying `aria-pressed` from `active`; with
    both handlers the label and the X render as sibling buttons, and the label
    takes the leading padding with it so the target is the chip up to the X
    rather than the words with dead space around them. `aria-pressed` is emitted
    only when `active` is passed, so a chip that navigates does not announce
    itself as "not pressed".
  
  - A `Markdown` link that leaves for another site now carries
    `rel="noreferrer nofollow"`. Refusing `javascript:` stops the href
    EXECUTING; it does nothing about an untrusted author spending the page's
    ranking or reading its URL out of the `Referer`, and untrusted content is the
    input this component exists for. Relative, `mailto:` and `tel:` hrefs cannot
    leave the origin and are untouched. New opt-in `markExternalLinks` adds the
    system's outbound arrow to the same links; it is off by default because the
    mark is an addition to a sentence the component did not write, and because
    "another site" can only mean "carries an http(s) scheme" from in here.
  
  Documentation caught up with three things that were already true: `Markdown`
  brings type and colour but no vertical rhythm, so anything longer than a
  sentence wants `<Article as="div">` around it; a fenced code block renders
  `CodeBlock`, which is a client component; and `article.css`'s header comment
  said a utility beats the article's rules, which is backwards — the file is
  imported unlayered while Tailwind's utilities are in `@layer utilities`, and
  that is precisely what lets a `Markdown` paragraph's `m-0` give way to the
  article rhythm.

### Patch Changes

- [#58](https://github.com/Misoto22/misoto22-design/pull/58) [`dd69487`](https://github.com/Misoto22/misoto22-design/commit/dd69487bc62b61f10b7314d3b6ea718b46959c66) Thanks [@Misoto22](https://github.com/Misoto22)! - `{@link}` survives extraction, and the article cascade is documented the way it
  actually runs.
  
  Three corrections to what the package publishes about itself. None of them
  changes a rendered pixel; all three change what a reader — or an agent reading
  `dist/agent/` — is told.
  
  **`{@link}` was being deleted.** The props extractor joined a JSDoc comment's
  parts on their `text`, and a `{@link Name}` node's own `text` is empty: the
  identifier lives on its `name`. So `See {@link TableBorders}.` shipped as
  `See .` — nine descriptions across seven components, each one a sentence
  pointing at something that had been removed on the way out. A link now renders
  as its bare identifier, which is what a reader greps for and what the row
  beside it already prints as the prop's type.
  
  **The article cascade was documented backwards.** `Article`'s note, and the
  `Article` catalog entry beside it, said a component's own utility outranks the
  article's element selectors. It is the other way round: `article.css` is
  imported unlayered while Tailwind's utilities sit in `@layer utilities`, and an
  unlayered rule beats a layered one whatever either one's specificity is. That
  is not a footnote — it is the mechanism the whole composition rests on, the
  reason a `Markdown` paragraph carrying `m-0` gives its margin up to the
  article's rhythm. A caller who believed the old version would reach for a class
  to hold a property inside an article and watch it lose; the honest answer is an
  inline style, or a tag the stylesheet does not reach.
  
  **`CodeBlock` documented a trade without its consequence.** Line numbers live
  inside each line's row so a number cannot come apart from the line it numbers.
  The cost went unsaid: the number is inside the scrolling box, so on a wide
  snippet it scrolls away with the code rather than staying in a gutter. A gutter
  that stayed put would be the second column this deliberately avoids — worth
  knowing before someone reports it as a bug.

- [#64](https://github.com/Misoto22/misoto22-design/pull/64) [`4807494`](https://github.com/Misoto22/misoto22-design/commit/4807494fc44cd571a8e9b37c3e5f4abe8db3eaa7) Thanks [@Misoto22](https://github.com/Misoto22)! - `prefers-reduced-motion` is now honoured by everything, instead of by whatever
  remembered to ask.
  
  The rule in `keyframes.css` was an opt-in: a surface that animated carried
  `data-m22-animated`, and that attribute was what got cancelled. Four
  independent documentation passes each found a different piece of the same
  failure.
  
  - Half the selector matched nothing at all. `[class*='m22-anim']` was written
    for a class-name scheme the package never adopted — Tailwind emits
    `animate-[m22-collapsible-down_…]`, which contains no `m22-anim` — so that
    branch had never once fired, and nothing anywhere said so.
  - The rule only ever set `animation`. Anything animated by `transition`
    escaped it entirely, which is most things that slide: `SheetContent` and
    `AppShell`'s drawer both move on `transition-transform`.
  - Two siblings disagreed. `CollapsibleContent` carried
    `motion-reduce:animate-none`; `CollapsibleSection` — the composed one its own
    JSDoc calls what most call sites want — carried nothing, and neither did
    `Accordion`'s panel.
  
  Four authors forgetting the same thing in four components is a fact about the
  mechanism, not about the authors. So the guarantee is no longer the marker: the
  block now carries the universal reduced-motion reset, capping both
  `animation-duration` and `transition-duration`. A component added tomorrow is
  covered before its author has read the file.
  
  This is a `*` rule in a stylesheet consumers import, and that is intended. It
  fires only when the reader has asked their operating system for less motion,
  and a caller with motion they consider essential can still keep it — an
  `!important` on `*` is the weakest one there is, so any class-level
  `animation-duration: … !important` outranks it. What changes is which way round
  the default falls: keeping motion under this preference is now something you
  write down, rather than something you get by forgetting.
  
  Durations collapse to `0.01ms` rather than to `none`, because JavaScript
  listens — Radix unmounts a closing panel on `animationend`, and consumer code
  may await `transitionend`. A near-zero duration still fires both.
  
  `data-m22-animated` stays and is now deliberately redundant: it is a component
  asserting its motion is decorative, and it goes further than the floor by
  removing the animation outright. `Accordion`'s panel and both `Collapsible`
  panels now carry it, so the two siblings finally agree.
  `src/__tests__/reduced-motion.test.tsx` fails if the block stops being
  universal, stops naming transitions, grows a selector that matches nothing, or
  if a component reaches for a system keyframe without making the assertion.

## 0.7.0

### Minor Changes

- [#52](https://github.com/Misoto22/misoto22-design/pull/52) [`212f6d4`](https://github.com/Misoto22/misoto22-design/commit/212f6d4a62cf6b55a7b422505e7de356364ac551) Thanks [@Misoto22](https://github.com/Misoto22)! - Add `@misoto22/design/diagrams`: five diagram figures and the chrome to explore one.
  
  `ArchitectureFigure`, `WorkflowFigure`, `SequenceFigure`, `DataflowFigure` and
  `LifecycleFigure` render the JSON schemas published by
  [archify](https://github.com/tt-a1i/archify), so a specification authored for
  that tool renders here with no translation step — in this system's own terms
  rather than in archify's palette. Where archify separates seven kinds of node
  by hue, these carry the kind twice, as a drawn sigil and as a word on the
  plate's eyebrow, so the distinction survives a greyscale print and a
  colour-blind reader. The only colour any of them spends is `--success` and
  `--danger` on a terminal lifecycle state, which is what those two tokens were
  reserved for.
  
  Every position comes out of the specification, so the figures render on a
  server and produce identical markup twice — there is no layout to do and
  therefore no shift on hydration. The `<svg>` is `role="img"` with a name, and
  each figure publishes its nodes and relationships beside it as an ordinary
  list; passing `onSelectNode` turns that list into the keyboard's route to a
  selection.
  
  `DiagramCanvas`, `DiagramToolbar`, `DiagramExportMenu`, `DiagramInspector`,
  `DiagramMinimap` and `DiagramLegend` are the reader-facing half: pan and zoom,
  a grouped action bar, PNG / JPEG / WebP / SVG / share-card export with the
  theme's custom properties baked into real colours, a detail panel and an
  overview map.
  
  They ship from their own entry point so a page rendering a `Badge` does not pay
  for a routing engine; `check-size` fails if they ever leak into the main
  barrel. The shared SVG export helpers now live in `src/lib/svg-export.ts`.

### Patch Changes

- [#55](https://github.com/Misoto22/misoto22-design/pull/55) [`eff6c5c`](https://github.com/Misoto22/misoto22-design/commit/eff6c5c3f18b867d6950ed7896eb2c171ff8eb7e) Thanks [@Misoto22](https://github.com/Misoto22)! - Fold the chart PNG export onto the shared SVG export.
  
  `charts/lib/export.ts` and `lib/svg-export.ts` each carried the same computed-
  style walker, the same standalone-document builder and the same canvas
  rasteriser — arrived at independently, for charts and for diagrams, and already
  diverging: the shared copy had picked up `marker-start`/`mid`/`end`, without
  which an exported arrow comes out headless. Two copies of a paint walker means
  the next fix lands in one of them.
  
  The chart module keeps only what a Recharts chart knows and a diagram does not:
  which `<svg>` in the subtree is the plot, what a row of chart data looks like as
  a CSV record, and that the ground behind an exported plot is `--chart-surface`.
  It is 387 lines down to 182, and `chartToPng`'s signature is unchanged.
  
  `findPlotSvg` now has a test, which it did not before. Both of its narrowings
  are load-bearing and each fails the same silent way — the toolbar sits outside
  the plot wrapper and every control in it is an `<svg>`, the legend draws its
  swatches inside it — so an export that skipped either one would be a picture of
  an icon, which looks like a working download until somebody opens the file.
  
  Two visible differences, both from the shared serialiser: the exported title
  band is 34px at 15px rather than 30px at 13px, and a chart exported before it
  has been measured now says `serializeSvg:` rather than `chartToPng:` in the
  error it throws.

## 0.6.1

### Patch Changes

- [#53](https://github.com/Misoto22/misoto22-design/pull/53) [`4f7ebd8`](https://github.com/Misoto22/misoto22-design/commit/4f7ebd82961bd7745a0c665295b5c1ac5306b3ab) Thanks [@Misoto22](https://github.com/Misoto22)! - Fix the `Import:` line the offline documentation prints for a chart.
  
  `dist/agent/AreaChart.md` said `import { AreaChart } from '@misoto22/design'`,
  which throws. Charts ship from `@misoto22/design/charts` behind optional peers,
  and that separation is the whole reason an app rendering a Badge never resolves
  `recharts` — so the root barrel does not export them and never will. Twenty
  components carried the wrong line, in the tarball and in the site's `llms.txt`
  alike. It is the one line an agent pastes without checking.
  
  Which specifier a component is imported from is now derived from the tree its
  directory sits in — `ENTRY_POINTS` maps each specifier to one directory under
  `src/`, and nothing is authored per component. The alternative was a field on
  every entry, which is a second copy of something the filesystem already says.
  `catalog.test.ts` fails when a catalog entry names no entry point's tree.
  
  The skill was stale in the same direction and is corrected with it: it said 52
  primitives when there are 72, never mentioned the charts entry or
  `@misoto22/design/tokens`, and still offered `data-accent` — an attribute that
  has never existed, in the same skill whose own `rules/tokens.md` says so. Two
  tests now hold that line: every specifier in `exports` has to appear in
  `SKILL.md`, and no skill file may offer `data-accent` as something to set.
  
  Nothing about the runtime changed: same exports, same CSS, same bundle.

## 0.6.0

### Minor Changes

- [#47](https://github.com/Misoto22/misoto22-design/pull/47) [`09fc30a`](https://github.com/Misoto22/misoto22-design/commit/09fc30a621361f2c705829c60552c288320637d4) Thanks [@Misoto22](https://github.com/Misoto22)! - The package documents itself for agents, offline: a `misoto22-design` CLI, a
  skill, and a README.
  
  The docs were on a website while the version being written against was in
  `node_modules`, and neither side could see the disagreement. Everything an agent
  needs now ships in the same tarball as the source it was generated from.
  
  - `npx misoto22-design docs <Component>` prints one component in full — every
    prop with its type and default, the exported unions, the keyboard contract,
    the accessibility promises, the `@example` blocks. The median component is
    about 500 tokens, against roughly 28,000 for all fifty-two. It resolves parts
    and types too, so `docs CardBody`, `docs TH` and `docs ButtonVariant` all land
    on the right file — which is what you have when an import just failed.
  - `npx misoto22-design docs --installed` is the cheap half: the resolved version
    and every component name, a few hundred tokens.
  - `npx misoto22-design init --agents-md` installs the skill under
    `.claude/skills/` and points `AGENTS.md` at it. Its name and description are
    about 110 tokens and are all a session carries until something touches the
    package; the body and the five rule files load from there.
  - `README.md` was listed in `files` and did not exist, so the npm page has been
    blank. It exists now.
  
  Two things the old documentation said were not true. There has never been a
  `data-accent` attribute — `--accent` is a custom property — and
  `data-surface="glass"` was never listed, so nothing pointed at an axis value
  that does work. The axes are now read out of the stylesheets that define them
  rather than described by hand, and a test fails when the authored half stops
  matching.
  
  Nothing about the runtime changed: same exports, same CSS, same bundle.

- [#49](https://github.com/Misoto22/misoto22-design/pull/49) [`625198b`](https://github.com/Misoto22/misoto22-design/commit/625198b30a106c4c6e56df5d9e353f944f2bca18) Thanks [@Misoto22](https://github.com/Misoto22)! - Add twenty data-visualisation primitives.
  
  Sixteen ship from a new `@misoto22/design/charts` entry with `recharts` and
  `motion` as OPTIONAL peer dependencies — `AreaChart`, `BarChart`, `LineChart`,
  `ComposedChart`, `ScatterChart`, `PieChart`, `RadarChart`, `RadialChart`,
  `FunnelChart`, `TreemapChart`, `SankeyChart`, `BoxPlot`, `Histogram`,
  `WaterfallChart`, `Facet` and the toolbar-driven zoom — each a compound component
  composed from axes, grid, tooltip, legend, dots, a background plate and a
  keyboard-driven zoom brush. The main entry and its size budget are unchanged: an
  app that renders a Badge does not pay for a rendering engine.
  
  `Heatmap`, `Sparkline`, `BarList`, `BigNumber` and `BulletChart` ship from the
  same entry and need NO engine at all.
  The heatmap is a real `<table>` with weighted cells, so the structure a screen
  reader walks is the structure the eye reads; the sparkline is one `<path>`, so a
  hundred of them in a table cost nothing.
  
  The token layer gains a data block: `--series-1` … `--series-8` (a neutral ramp
  whose adjacent steps clear ΔE 21 and 3:1 on their own ground), the `--chart-*`
  roles, and `--chart-fill` / `--chart-texture` — the only tokens in the system
  that hold different numbers on the two grounds, because ink at 14% over paper is
  a legible band and paper-white at 14% over near-black is nothing. Texture is the
  primary carrier of series identity; the ramp supports it. `data-chart-palette`
  is a seventh theme axis that swaps the ramp for a validated categorical palette.
  
  Every chart requires a `title`, renders its rows again as a visually hidden
  table, and drops its intro animation under `prefers-reduced-motion`.
  
  Borrowed from a survey of the field, and each one fixing something that was
  missing rather than adding a variant:
  
  - **An annotation layer** — `ReferenceLine`, `ReferenceBand` and `Annotation` on
    every cartesian chart, stacked in the order editorial charting settled on
    (band behind the grid, line above the marks, note above both). Most charts
    that look like they need a second series need a target line instead.
  - **Axis titles** (`<Chart.XAxis label>`), because an axis reading 0 · 100 · 200
    says nothing about whether those are people, milliseconds or dollars.
  - **Selective value labels** — `<Chart.Values show="last | first-last | extremes
    | all">`. The default prints one number, not one per point.
  - **`formatNumber`** with compact, percent, currency, duration and byte styles,
    and a compact default on every value axis above four digits.
  - **An empty state.** `data: []` now renders `ChartEmpty` rather than a bare
    pair of axes, which is indistinguishable from a failed load.
  - **Forced-colours support** in `tokens.css`. Browsers do not remap SVG, so the
    chart tokens re-point onto system colours there and texture carries the
    series apart; `Heatmap` reveals its numbers, since its wash is gone.
  - **`BarList`** — a ranked list with the bar behind the name, which a
    horizontal bar chart cannot do.
  - **`BigNumber`** — one figure at headline size with a delta whose direction is
    stated by the call site, never inferred from the sign.
  - **`BulletChart`** — Stephen Few's replacement for the dashboard gauge: a
    measure, its target and its qualitative bands in the height of a line of
    text. Plain HTML, so ten of them stack into a status page for free.
  - **The statistical family** — `BoxPlot`, `Histogram` and `WaterfallChart`.
    Each documents what it HIDES rather than only what it shows: a box cannot
    tell one hump from two, a histogram's shape is a property of its bin width,
    and a waterfall's connectors imply a sequence most breakdowns do not have.
  - **`Facet`** — the same chart once per group on one shared scale, which is the
    answer to eight series overplotted into a hairball. The shared domain is the
    default: on independent scales a group peaking at 40 and one peaking at 4,000
    draw the same shape, and the comparison is not merely lost but inverted.
  - **Sonification** — `<Chart.Sonify>` plays a series as pitch over time for a
    reader who cannot see the plot. Never autoplays; sound only ever starts from
    an explicit user action, which is a different question from
    `prefers-reduced-motion`.
  - **A chart toolbar** — step zoom, reset, and taking the figure away as a PNG
    or a CSV. Capped at five controls with no overflow menu, so a cartesian chart
    does not statically reach a menu component every consumer would then ship.
    Zoom and the brush drive ONE window, so they cannot disagree.

## 0.5.0

### Minor Changes

- [#42](https://github.com/Misoto22/misoto22-design/pull/42) [`682e85e`](https://github.com/Misoto22/misoto22-design/commit/682e85e05495d2dbbb3308345881b0817de93135) Thanks [@Misoto22](https://github.com/Misoto22)! - `AppShell` takes `sidebarLabel`, `navLabel`, `openLabel` and `closeLabel`.
  
  Both landmark names were hardcoded English. Two `complementary` landmarks with
  the same name cannot be told apart, which is exactly the pair a shell rendered
  inside another page makes — a preview, a screenshot harness — and it was the
  only part of the component a non-English app could not translate.

## 0.4.0

### Minor Changes

- [#40](https://github.com/Misoto22/misoto22-design/pull/40) [`fb9b117`](https://github.com/Misoto22/misoto22-design/commit/fb9b11721c0f5000c62860f3358d1893c181318f) Thanks [@Misoto22](https://github.com/Misoto22)! - One radius ladder driven by one factor, a calendar that picks a month in place
  of the grid, a reading surface for long-form content, and a numbered rail for
  the sequences a diagram should not be drawing.
  
  **The radius is a ladder now, and a theme moves one number.** The four steps
  were four independent values, and the radius theme re-typed all four — so
  nothing held them in proportion and a corner nested inside another corner was
  right at the one setting somebody checked and wrong at every other. Every step
  is now `calc(<n>px * var(--radius-factor))` — 4, 6, 8, 12 and the pill, which is
  where Tailwind's scale, shadcn's `--radius` ± 2 and ± 4, Radix Themes' steps 3
  and 4 and Material's `xs`/`sm`/`md` all land within a pixel of each other.
  `sharp` sets the factor to `0` and `round` to `2`, and the pill is on the ladder
  with everything else: a square theme that left every button a capsule was not a
  square theme. A true circle — an avatar, a status dot, a spinner, a radio — is
  geometry and stays round.
  
  **`Button` now draws `--radius`, the control step**, which is the same corner an
  `Input`, a `Select` trigger and a `Textarea` draw. It was a pill, and a pill
  beside an 8px field is two different ideas of what a control is — the one
  inconsistency in the system that every reader noticed and no component page
  could explain. The capsule is kept for the things that genuinely are one: a
  badge, a status pill, a segmented strip, a progress track. `Calendar`'s own
  chrome buttons follow, and its caption arrows are now the same height as the
  month they sit beside rather than ten pixels above it.
  
  Two rounded edges separated by a gap of `p` are concentric only when the inner
  radius is the outer minus `p`. Both directions are named rather than left for
  each surface to guess: `--radius-row` subtracts (a row inside a panel padded by
  6px) and `--radius-frame` adds (a frame sitting 16px outside a `--radius-lg`
  panel), with the adding one gated so a square theme stays square. Menus,
  popovers, selects and the command palette now round their panel at
  `--radius-lg` and their rows at `--radius-row`, which is the pairing that
  actually holds at every setting.
  
  The ladder is declared for `:root` **and** `[data-radius]`. A custom property
  substitutes `var()` where it is declared, so a ladder written only on the root
  bakes the root's factor in and a themed subtree never reaches its own — which
  is exactly what the themes page does, five radii on five wrappers.
  
  **New `Article`** — the long-form reading surface. Everything a Markdown
  pipeline emits, set in this system's type, colour and rules: headings and their
  anchors, lists, tables, quotations, code, figures, footnotes and MathML. The
  styles ship as `@misoto22/design/article.css` and are scoped to a data
  attribute, so a site with its own pipeline can take the reading surface without
  taking the components.
  
  **New `Diagram`** — a flow or architecture figure drawn from the system's own
  parts. Nesting is containment and an edge is a step between siblings; it takes a
  spec rather than markup, so a fenced ```diagram block and a hand-written figure
  are one renderer, and it server-renders because it is markup rather than a
  canvas.
  
  **`Calendar` picks a month in place of the grid.** The month and year were two
  `Select`s that portalled a ten-rem list over the calendar — three visible months
  out of twelve, with a scroll arrow at each end, floating on top of the thing the
  reader opened it to change. The caption is now one control reading "September
  2026", and it swaps the day grid for a 3×4 month grid or a 4×6 year grid at the
  same size. Nothing overlaps, nothing scrolls, Escape closes it and hands focus
  back, and the year pages tile the range from its first year so every year in the
  span is reachable — the old arrangement could offer a year it never showed.
  
  The picker BROWSES; it does not navigate. Stepping the year moves the grid under
  the arrows and leaves the calendar where it was, so one click does one thing:
  choosing a month is what moves the calendar and closes the panel. It used to
  navigate and close on the arrow, which meant `‹` on "2026" left the reader
  looking at a different month with the picker gone.
  
  **New `Steps`** — a numbered sequence as a rail: a marker, a rule through them,
  a name and a line of detail. It is the figure a technical page reaches for
  after a diagram and is not one, because nothing branches and nothing points at
  anything; drawing an order with boxes and arrows says otherwise. An `<ol>`, with
  the connector on the item so it stops between markers rather than running
  through them and off the end.
  
  **New floating-surface tokens, and a glass theme that spends them.**
  `--panel-bg`, `--panel-border` and `--panel-filter` are what a surface that
  FLOATS fills with and what it does to whatever is behind it — read by `Dialog`,
  `Sheet`, `Popover`, `DropdownMenu`, `ContextMenu`, `Select` and `Command`, and
  by nothing that sits in the page, because a card has nothing behind it to treat.
  All three default to the plain surface, and `--panel-filter: none` is not a blur
  of zero: any `backdrop-filter` value promotes its element to a compositing layer
  and makes it a containing block for fixed descendants, which is a cost every
  menu would pay for a theme most readers never turn on.
  
  `[data-surface='glass']` then sets a translucent panel, a specular edge and
  `blur(20px) saturate(180%)`. It does not break law 2: the blur is not UNDER a
  surface pretending to be a shadow, it is BEHIND one. A shadow claims a light
  source this system does not have; a frosted panel claims a material, and says
  honestly that the page is still there behind it.
  
  `Collapsible` also exports `CollapsibleTrigger` and `CollapsibleContent`, for a
  disclosure that needs its own header layout.
  
  **`FigureBand` reaches four columns again.** Its container query was declared on
  the same element it queried, which can never match, so the band stayed two
  columns at every width — four figures on a full page came out as a 2×2 block
  with a hole in it.

### Patch Changes

- [#34](https://github.com/Misoto22/misoto22-design/pull/34) [`7fcaf6c`](https://github.com/Misoto22/misoto22-design/commit/7fcaf6cd48a05d4e67cd9d3bc572c381b1222838) Thanks [@Misoto22](https://github.com/Misoto22)! - `ToggleGroup`'s sliding pill lands on its segment inside a scaled container.
  
  The indicator measured with `getBoundingClientRect`, which reports visual
  pixels, and positioned with `transform`, which is interpreted in the element's
  own coordinate space. Inside anything zoomed or scaled — a thumbnail, a device
  preview — the two disagreed by exactly the scale factor and the pill sat short
  of its segment. It now accumulates layout offsets up to the strip instead.

## 0.3.1

### Patch Changes

- [#28](https://github.com/Misoto22/misoto22-design/pull/28) [`4f4a433`](https://github.com/Misoto22/misoto22-design/commit/4f4a433504cf254e87ff69afd56771cf46cf364e) Thanks [@Misoto22](https://github.com/Misoto22)! - Restore the table's column gutter, which a unitless zero had been silently
  eating.
  
  `--table-pad-x` was `0` rather than `0px`. The cell rule adds to it inside a
  calc, so it resolved to `calc(0 + 1.5rem)` — invalid at computed-value time,
  which drops the whole declaration instead of falling back. Every non-last cell
  of every `borders="rows"` or `borders="none"` table therefore had no
  `padding-inline-end` at all, and an `align="end"` column butted straight against
  its neighbour. The ruled variants were unaffected, because they set the variable
  to `0.75rem` and a unit came with it.

- [#29](https://github.com/Misoto22/misoto22-design/pull/29) [`d97ad30`](https://github.com/Misoto22/misoto22-design/commit/d97ad30f35ba3be5f19dc4e50e529e0c5098e28c) Thanks [@Misoto22](https://github.com/Misoto22)! - Ten fixes from a walk over the published site.
  
  - `FigureBand` collapsed to two zero-width columns of overlapping text. It
    declares `@container`, which computes its width without looking at its
    contents — as a shrink-to-fit flex item that resolved to nothing.
  - `CardTitle` on the reversed `plate` was ink on near-black, at 1.25:1.
  - `ToggleGroup` stretched to whatever its flex parent was, leaving dead space
    after the last segment. `inline-flex` does not opt out of that; `w-fit` does.
  - Anchored panels grow from their trigger and now animate on the way out too.
  - `Select` takes `contentClassName`, and the calendar's year list uses it: the
    default 18rem covered the calendar the reader opened it to change.
  - `Combobox` and `SearchableMenu` name their filter field for what it does. It
    inherited the control's own name, so a screen reader met two comboboxes
    called the same thing, one inside the other.
  - New `scroll-hairline` for a bounded panel, used by the command palette.

## 0.3.0

### Minor Changes

- [#21](https://github.com/Misoto22/misoto22-design/pull/21) [`30a3f0c`](https://github.com/Misoto22/misoto22-design/commit/30a3f0c5061a824e9babffe27a980dac36a5a745) Thanks [@Misoto22](https://github.com/Misoto22)! - Configurable Table, a searchable action menu, and calendar/date-picker repairs.
  
  - `Table` takes `borders` (`rows` | `grid` | `bordered` | `bordered-grid` | `none`),
    `density`, per-column `align`, and per-column opt-in `sortable` with
    `sortDirection` / `onSort`. All rules are drawn from the wrapper, so the
    component stays server-renderable.
  - New `SearchableMenu`: a filterable menu of actions, for the case
    `DropdownMenu` outgrows and `Combobox` does not fit (it sets no value).
  - `Calendar` month and year pickers are our own `Select` rather than the native
    dropdown, and span 10 years either side instead of the full century.
  - A selected day is round again. In range mode a one-day selection was both
    range start and range end, and the two overrides summed to `border-radius: 0`.
  - `DatePicker` and `DateRangePicker` take `presets`: a shortcut rail (Last 30
    days, Last 90 days, Year to date…), computed on click so "today" means today.

- [#23](https://github.com/Misoto22/misoto22-design/pull/23) [`de06cfb`](https://github.com/Misoto22/misoto22-design/commit/de06cfbeff0e83cac3b432cfa9f9158d5207fb65) Thanks [@Misoto22](https://github.com/Misoto22)! - `Command` rows carry a glyph and a note, and the palette says which keys do what.
  
  - `CommandItem` takes `icon` and `meta`. Forty rows of bare text cannot be
    scanned — the eye sorts by shape before it reads.
  - New `CommandFooter` and `CommandHint`: the key-hint strip a palette needs,
    because nothing else on screen says the arrows move the row.
  - The highlighted row reads `--accent` with a leading rule, rather than a flat
    grey fill.
  - `CommandDialog` is wider and sits above centre, where a palette belongs.

- [#17](https://github.com/Misoto22/misoto22-design/pull/17) [`5278356`](https://github.com/Misoto22/misoto22-design/commit/52783560faddae03d4f282999ac4fe17ce0d3a4c) Thanks [@Misoto22](https://github.com/Misoto22)! - Fix the interactions that were drawn but not wired, and give selection
  something that moves.
  
  `Select` is now the styled control and the native one becomes `NativeSelect`.
  The old default stopped being part of the system the moment it opened — the
  option list is drawn by the operating system and carries none of these tokens.
  The one genuine argument for staying native was the keyboard contract, and
  Radix answers it: typeahead, arrows, Home and End, Escape without choosing.
  
  `Slider` printed a figure that never moved. It read the value off the props, and
  an uncontrolled slider's `defaultValue` does not change — so the number sat at
  its starting point while the thumb travelled, which is the one thing `showValue`
  exists to prevent.
  
  `ToggleGroup` looked identical whether it held one value or several, so a
  multiple-value group looked like a broken single one. A single-value strip now
  moves ONE pill between its options and a multiple-value strip fills each
  pressed option separately. `Pagination` gets the same treatment: a shape that
  travels reads as the one thing that changed, where two backgrounds cross-fading
  reads as two.
  
  `Combobox` takes several values, keeps the panel open while you pick them, and
  clips the command list to its own corners — the list's square edges had been
  poking through the panel's radius.
  
  `Calendar` navigates by month and year dropdowns rather than two arrows.
  Twenty-four clicks to reach two years ago is not a navigation model. Its nav
  also sat above the grid rather than beside the caption, because the nav renders
  first in the DOM and was left in the flow.
  
  `DateRangePicker` is new. It shows two months, and closes only once two days
  have actually been clicked — the library reports `{ from, to }` on the FIRST
  click, so a completeness check closed the panel instantly and produced a
  one-day range every time.
  
  `Switch` narrows its thumb as it travels, and `Slider`'s grows as it is
  grabbed, so both read as something being moved rather than a value blinking to
  a new state.

- [#19](https://github.com/Misoto22/misoto22-design/pull/19) [`1580754`](https://github.com/Misoto22/misoto22-design/commit/15807547bb628e59a0d2283b75582fe47cbe0401) Thanks [@Misoto22](https://github.com/Misoto22)! - Route every chosen-state surface through the accent pointer.
  
  Law 7 says the system has one pointer and that the pointer is ink. Half the
  components were reading `--ink` directly instead — a primary button, a checked
  box, an active tab, the current page, a slider's filled range, a selected day.
  While the accent IS ink the two render identically, which is exactly why nobody
  noticed, and why the law was true on the principles page and not in the code.
  
  They read `--accent` now. Nothing changes at the default, and re-pointing that
  one token re-skins the system without a component being touched — which is what
  having a pointer was for.

- [#22](https://github.com/Misoto22/misoto22-design/pull/22) [`81ae658`](https://github.com/Misoto22/misoto22-design/commit/81ae658dba21127790f6b03fc8749dc7e52c97f2) Thanks [@Misoto22](https://github.com/Misoto22)! - Overlays and the fluid scale can be re-based onto a bounded frame.
  
  - New `OverlayContainer`: names the element that `Popover`, `Select`,
    `DropdownMenu`, `ContextMenu` and `Tooltip` should render into. Panels then
    collide with that element's edges rather than the viewport's, and inherit the
    `dir` and `data-density` set on it. `Dialog` and `Sheet` still cover the
    viewport, which is what they are for.
  - New `--fluid` token, `1vw` by default. A frame that declares
    `container-type: inline-size` and sets `--fluid: 1cqi` on an element inside
    it carrying `data-fluid-frame` re-bases the whole type and spacing ramp onto
    its own width.
  - `FigureBand` is a query container and reads its own width, so four figures
    across is a decision about the band rather than about the window.

- [#27](https://github.com/Misoto22/misoto22-design/pull/27) [`46cfdde`](https://github.com/Misoto22/misoto22-design/commit/46cfdde90ae2f0ef283bd1da5863e3e428a304cf) Thanks [@Misoto22](https://github.com/Misoto22)! - Published to npmjs, publicly, instead of to GitHub Packages.
  
  The repository has been public and MIT-licensed for a while, but the package it
  ships was restricted on a registry that needs a token to read — so the install
  instructions were a gate rather than a command. It now publishes to the default
  registry with `access: public`, which every client reads without an `.npmrc`.
  
  Two consequences for anything already installing it. The scope no longer needs
  pointing anywhere, so the `@misoto22:registry` and `_authToken` lines can come
  out of the consumer's `.npmrc`; and the versions published to GitHub Packages
  stay where they are — nothing was copied across, and `0.3.0` is the first
  version on npmjs.
  
  The manifest's `description` also changes. It, the repository's About field and
  the README's opening line each carried a different sentence, so two of them were
  always the stale one; they now say the same thing, and it carries no component
  count, because a number in a manifest has nothing to check it and had already
  drifted by two.

- [#24](https://github.com/Misoto22/misoto22-design/pull/24) [`6110ccc`](https://github.com/Misoto22/misoto22-design/commit/6110ccc4898286d4aa2503e296414f63521967ae) Thanks [@Misoto22](https://github.com/Misoto22)! - New `themes.css`: theming beyond the accent.
  
  Six axes, each an attribute that re-points tokens the package already defines —
  `data-surface`, `data-radius`, `data-rules`, `data-type`, `data-motion`, and the
  existing `data-density`. No component reads any of them, and the layer
  introduces no token of its own; a theme re-points, it does not invent.
  
  Nothing is anchored to `:root`, so an axis can sit on any element and the
  subtree below takes it. That is what lets a page print five themes side by side
  without five documents.
  
  Available as `@misoto22/design/themes.css`, and included in `styles.css`.

## 0.2.0

### Minor Changes

- [#13](https://github.com/Misoto22/misoto22-design/pull/13) [`0a4d5e9`](https://github.com/Misoto22/misoto22-design/commit/0a4d5e9ebb9883d432ad985091d5655a550ecdcb) Thanks [@Misoto22](https://github.com/Misoto22)! - Add eleven components and make the table do what a table is for.
  
  `Popover`, `Sheet`, `ContextMenu`, `Command` (the ⌘K palette), `Combobox`,
  `Slider`, `ToggleGroup`, `Collapsible`, `ScrollArea`, `Calendar` and
  `DatePicker`. Each documents the neighbour it could be confused with, because
  the interesting question is rarely how a component looks: a tooltip cannot hold
  a control, an accordion of one manages a value nobody reads, a native select
  beats a combobox up to about a dozen options, and a toggle group changes a
  value where tabs change a panel.
  
  `Table` gains sortable headers and a sticky header row. The sort control is a
  `<button>` inside the `<th>` rather than a click handler on the cell — a cell
  with an `onClick` is not focusable and not announced, so the sort exists only
  for a mouse — and it sets `aria-sort`, which is the only way a screen reader
  learns the table is ordered at all.
  
  `Dialog` gains `hideTitle`, for a surface whose purpose is obvious to anyone
  who can see it. The title itself stays required.
  
  Two defects the browser suite caught on the way in: the calendar's
  out-of-month days were drawn in the rule colour at 1.38:1, and `cmdk` renders
  its separator as `role="separator"` inside a `role="listbox"`, which ARIA
  forbids and which put a critical violation inside every palette.

- [#12](https://github.com/Misoto22/misoto22-design/pull/12) [`ec362c1`](https://github.com/Misoto22/misoto22-design/commit/ec362c1135d3b2e7e2e6e47e282106d3e2ef7e8b) Thanks [@Misoto22](https://github.com/Misoto22)! - Add a density axis, make every component direction-independent, and ship the
  tokens in a machine-readable form.
  
  `data-density="compact"` on any container tightens every control below it —
  44px at the default, which is the pointer target WCAG 2.5.5 asks for, and 36px
  compact, which still clears 2.5.8 and no longer meets 2.5.5. It is for a dense
  desktop tool driven by a mouse, and the docs say so rather than presenting it
  as free.
  
  Every component now uses logical properties, so `dir="rtl"` mirrors the system
  with no stylesheet of its own. A source test fails the build on a physical one
  and on any inline-axis transform without an `rtl:` counterpart; a browser test
  checks the result actually mirrors, which a source test cannot.
  
  `@misoto22/design/tokens` exports every token with its light value, dark value,
  category and explaining comment, as JSON and as a typed module — for a Figma
  sync, a native app, or any consumer that needs the values and cannot read a
  stylesheet. The documentation site now reads that artifact instead of parsing
  the CSS a second time, so the site and the package can no longer disagree about
  what a token is.
  
  `FloatingIconButton`'s `position` is now `start` / `end` rather than
  `left` / `right`, so the API does not hard-code one script's layout.

### Patch Changes

- [#10](https://github.com/Misoto22/misoto22-design/pull/10) [`fddb290`](https://github.com/Misoto22/misoto22-design/commit/fddb290e93ce7cb84afd99da7c70c16c8556bf63) Thanks [@Misoto22](https://github.com/Misoto22)! - Ship the package with a licence, a publish target and a changelog. It is MIT
  licensed, published to GitHub Packages under the `@misoto22` scope, and
  versioned by changesets — so a consumer can install it, and can tell what
  changed between two versions without reading the commit log.

- [#14](https://github.com/Misoto22/misoto22-design/pull/14) [`4c051b3`](https://github.com/Misoto22/misoto22-design/commit/4c051b3f407391d2a3843e1cab1ff118de505b68) Thanks [@Misoto22](https://github.com/Misoto22)! - Add a size and tree-shaking budget to the build (`pnpm check:size`).
  
  The absolute numbers are the boring half. The useful one is the proportion:
  bundling a single component and comparing it to the whole package is the only
  way to notice that tree shaking has quietly stopped working — one barrel
  import, one side effect in the entry, and every consumer ships the calendar to
  render a badge. It is invisible in review and shows up months later as a bundle
  nobody can explain.

- [#11](https://github.com/Misoto22/misoto22-design/pull/11) [`225ec72`](https://github.com/Misoto22/misoto22-design/commit/225ec72b7268c6cc8dbf084ef31da6c16aefed24) Thanks [@Misoto22](https://github.com/Misoto22)! - Fix three defects a browser found that a jsdom suite could not see.
  
  `Table`'s scroll container was unreachable by keyboard: a scrollable region
  whose contents are not themselves focusable has nothing to Tab to, so every
  column past the fold did not exist for anyone not using a mouse. It is now a
  focusable, labelled region.
  
  `RadioGroup` moved focus with the arrow keys but not the selection. The
  upstream primitive gates that on a flag cleared by `keyup`, and loses the race
  against its own focus move — a normal keypress releases before React commits,
  so the outline moved and nothing was chosen. Tracked by timestamp instead,
  which cannot be cleared out from under the focus handler.
  
  `AppShell` renders a `<main>`, which is right for an application shell and
  wrong for one embedded in another page — a document may contain exactly one. It
  now takes `contentAs`.
