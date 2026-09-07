---
'@misoto22/design': patch
---

Hovering a rail no longer emboldens the section under the pointer.

The fill follows the pointer while the pointer is in the list, and the three
declarations that do it land on every row. Two are no-ops on a row that is not
current — it has no fill and no ink to give up. `font-normal` was not: it is an
absolute weight rather than an undo, so in a rail whose base face is lighter
than 400 — the White Reset's own sidebar runs at 300 — every row got HEAVIER
the moment the pointer arrived. Selecting one row appeared to embolden its
whole section, which is the opposite of a highlight that follows the pointer.

The weight is now scoped to `aria-current="page"`, which is the only row that
has a weight to give up. The fill and the ink still relax on every row, because
there the class says what it means.
