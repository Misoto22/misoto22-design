---
'@misoto22/design': minor
---

`Metric` — the stat tile that sits four across on a console: a label, a monospaced figure, a status tone and a free slot under the number.

**`BigNumber` was the only figure in the set and it is the wrong size for four
of them.** It is one headline in the editorial face with a delta under it, for
the ONE number a view is about, and it needs the charts entry. A dashboard whose
tiles have to be a `<div>` because the delta does not apply is a dashboard with
two tile designs in it, which is what every console built on this package had.

The figure is monospace and tabular by construction rather than by a prop.
Four tiles in a row are read down the column as much as along it, and
proportional digits put the same magnitude at two different widths — which is a
comparison the reader came for and cannot make.

`asChild` is how a tile becomes a link, and it is `Slottable` underneath rather
than a bare `Slot`: a bare one hands the child the props and leaves it holding
its own content, so `<a href="…" />` would render a correctly styled empty box
and nothing would say so. The whole plate becomes the link, which also means the
link's accessible name is every word in the tile, read in order.
