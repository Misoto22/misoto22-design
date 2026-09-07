---
'@misoto22/design': patch
---

A chart's empty state stays where its plot was, instead of pinning to the top of a taller figure.

`ChartEmpty` sizes itself 16:9 and stops at `max-h-[26rem]`, which is right for a card that grows to its content and short of a figure the page has given a fixed height — a dashboard tile, a cell in a grid. The box was then shorter than the figure holding it, so the words landed near the top while the plot they stand in for had filled the whole cell, and the same chart read at two different heights depending on whether it had data. The container it replaces is `flex-1` and `justify-center`; this was neither. An auto margin is the smaller of the two available fixes: it absorbs the free space when there is any and does nothing when there is none, so a chart that sizes to its own content keeps exactly the shape it had.
