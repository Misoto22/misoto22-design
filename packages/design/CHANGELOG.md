# @misoto22/design

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
