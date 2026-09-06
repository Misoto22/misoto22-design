---
'@misoto22/design': minor
---

Eight components that rendered correctly and described something else.

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
