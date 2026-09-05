# @misoto22/design

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
