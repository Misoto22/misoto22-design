---
'@misoto22/design': patch
---

`Heatmap` lays its grid out as a fixed table now, so its cells keep a real width instead of collapsing to 0px.

Every cell's printed reading is `sr-only`, so automatic table layout had no content to size a data column by and handed the row-header column all the slack it could find. Measured in a consumer at 1440px: 919 of 1035px went to the header, and every one of a year calendar's 392 cells came out 0px wide — an invisible grid. `CalendarHeatmap` inherits `Heatmap`, so it carried the same defect.

The row-header column gets its width from a `colgroup` rather than from a cell, because fixed layout only ever reads a column's width off a cell in the table's first row, and that row's own corner cell is `sr-only` — `position: absolute` — so a width placed there was never seen. A `col` is read regardless of which cell in the column, or which row, is hidden.
