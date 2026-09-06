---
'@misoto22/design': patch
---

Fold the chart PNG export onto the shared SVG export.

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
