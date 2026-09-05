---
'@misoto22/design': patch
---

Restore the table's column gutter, which a unitless zero had been silently
eating.

`--table-pad-x` was `0` rather than `0px`. The cell rule adds to it inside a
calc, so it resolved to `calc(0 + 1.5rem)` — invalid at computed-value time,
which drops the whole declaration instead of falling back. Every non-last cell
of every `borders="rows"` or `borders="none"` table therefore had no
`padding-inline-end` at all, and an `align="end"` column butted straight against
its neighbour. The ruled variants were unaffected, because they set the variable
to `0.75rem` and a unit came with it.
