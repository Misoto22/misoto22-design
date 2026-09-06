---
'@misoto22/design': minor
---

Nine places where what was drawn and what was announced were two different
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
