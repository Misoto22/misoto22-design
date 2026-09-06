---
'@misoto22/design': minor
---

Add twenty data-visualisation primitives.

Sixteen ship from a new `@misoto22/design/charts` entry with `recharts` and
`motion` as OPTIONAL peer dependencies — `AreaChart`, `BarChart`, `LineChart`,
`ComposedChart`, `ScatterChart`, `PieChart`, `RadarChart`, `RadialChart`,
`FunnelChart`, `TreemapChart`, `SankeyChart`, `BoxPlot`, `Histogram`,
`WaterfallChart`, `Facet` and the toolbar-driven zoom — each a compound component
composed from axes, grid, tooltip, legend, dots, a background plate and a
keyboard-driven zoom brush. The main entry and its size budget are unchanged: an
app that renders a Badge does not pay for a rendering engine.

`Heatmap`, `Sparkline`, `BarList`, `BigNumber` and `BulletChart` ship from the
same entry and need NO engine at all.
The heatmap is a real `<table>` with weighted cells, so the structure a screen
reader walks is the structure the eye reads; the sparkline is one `<path>`, so a
hundred of them in a table cost nothing.

The token layer gains a data block: `--series-1` … `--series-8` (a neutral ramp
whose adjacent steps clear ΔE 21 and 3:1 on their own ground), the `--chart-*`
roles, and `--chart-fill` / `--chart-texture` — the only tokens in the system
that hold different numbers on the two grounds, because ink at 14% over paper is
a legible band and paper-white at 14% over near-black is nothing. Texture is the
primary carrier of series identity; the ramp supports it. `data-chart-palette`
is a seventh theme axis that swaps the ramp for a validated categorical palette.

Every chart requires a `title`, renders its rows again as a visually hidden
table, and drops its intro animation under `prefers-reduced-motion`.

Borrowed from a survey of the field, and each one fixing something that was
missing rather than adding a variant:

- **An annotation layer** — `ReferenceLine`, `ReferenceBand` and `Annotation` on
  every cartesian chart, stacked in the order editorial charting settled on
  (band behind the grid, line above the marks, note above both). Most charts
  that look like they need a second series need a target line instead.
- **Axis titles** (`<Chart.XAxis label>`), because an axis reading 0 · 100 · 200
  says nothing about whether those are people, milliseconds or dollars.
- **Selective value labels** — `<Chart.Values show="last | first-last | extremes
  | all">`. The default prints one number, not one per point.
- **`formatNumber`** with compact, percent, currency, duration and byte styles,
  and a compact default on every value axis above four digits.
- **An empty state.** `data: []` now renders `ChartEmpty` rather than a bare
  pair of axes, which is indistinguishable from a failed load.
- **Forced-colours support** in `tokens.css`. Browsers do not remap SVG, so the
  chart tokens re-point onto system colours there and texture carries the
  series apart; `Heatmap` reveals its numbers, since its wash is gone.
- **`BarList`** — a ranked list with the bar behind the name, which a
  horizontal bar chart cannot do.
- **`BigNumber`** — one figure at headline size with a delta whose direction is
  stated by the call site, never inferred from the sign.
- **`BulletChart`** — Stephen Few's replacement for the dashboard gauge: a
  measure, its target and its qualitative bands in the height of a line of
  text. Plain HTML, so ten of them stack into a status page for free.
- **The statistical family** — `BoxPlot`, `Histogram` and `WaterfallChart`.
  Each documents what it HIDES rather than only what it shows: a box cannot
  tell one hump from two, a histogram's shape is a property of its bin width,
  and a waterfall's connectors imply a sequence most breakdowns do not have.
- **`Facet`** — the same chart once per group on one shared scale, which is the
  answer to eight series overplotted into a hairball. The shared domain is the
  default: on independent scales a group peaking at 40 and one peaking at 4,000
  draw the same shape, and the comparison is not merely lost but inverted.
- **Sonification** — `<Chart.Sonify>` plays a series as pitch over time for a
  reader who cannot see the plot. Never autoplays; sound only ever starts from
  an explicit user action, which is a different question from
  `prefers-reduced-motion`.
- **A chart toolbar** — step zoom, reset, and taking the figure away as a PNG
  or a CSV. Capped at five controls with no overflow menu, so a cartesian chart
  does not statically reach a menu component every consumer would then ship.
  Zoom and the brush drive ONE window, so they cannot disagree.
