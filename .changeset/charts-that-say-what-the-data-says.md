---
'@misoto22/design': minor
---

Sixteen charts that drew a readable, plausible, wrong picture.

None of these threw, none looked broken, and none could be caught by rendering
the chart and looking at it — the plot was always confident. What they had in
common is that the picture disagreed with the rows behind it, and the reader had
no way to tell.

- **`BarChart`'s `buffer` hatched the last VISIBLE bar, not the last row.**
  `dataLength` came from the brushed window, so brushing back into the middle of
  a range drew a month that closed in March as still being counted. It now
  resolves the last row's position in the window, and hatches nothing when that
  row is off the end of it.

- **`BarChart` painted `Math.max(0, height - 3)`.** Anything under three pixels
  rendered at zero height, so a count of two on a scale topping out at a thousand
  was pixel-identical to a category with no rows — while the invisible
  full-column hit rect still caught the pointer, giving the reader a bar to hover
  that was not there. A bar with a value on it is now floored at one pixel.

- **`TreemapChart` emitted `<desc>{chartId}</desc>` inside every tile.** The
  comment called it a hidden id; `<desc>` IS the accessible description, so every
  tile was announced as its name followed by an opaque generated string. Removed,
  along with the id it needed.

- **`TreemapChart` dropped a leaf with no area and said nothing.** A tile at zero
  or below is laid out at zero width and never drawn, so the picture and the
  hidden leaf table disagreed about how many leaves there were. The table now
  prints such a leaf as "not drawn".

- **`RadialChart.onSelectionChange` reported `value: 0` from the legend.** The
  arc handed its own number in; the legend had only a name, and `value ?? 0`
  invented one — so the same selection reported two different values depending on
  which control the reader used. The value now comes from the row, through
  `valueKey` or, failing that, the `dataKey` of the composed
  `<RadialChart.RadialBar>` — which also gives a chart that named neither a
  hidden table, where it previously had none at all.

- **`AreaChart` silently ignored a `tickFormatter` under `stackType="expanded"`.**
  The axis wrote `isExpanded ? percentTick : (tickFormatter ?? defaultTick)`, so
  a formatter handed to the YAxis was indistinguishable from a typo. A caller's
  formatter now wins; the percentage default applies when there is none.

- **`Histogram` discarded observations outside explicit `bins` edges.** The
  tooltip's share-of-total was taken over the bins, so it always summed to 100%
  however much of the sample the edges cut off — the one number that would have
  revealed the tail was the one that hid it. Out-of-range observations now count
  toward the share and get their own "Below" and "Above" rows in the table.

- **`BigNumber` announced a verdict on a change of zero.** The tone, the arrow
  and the word all said "no change" while the sr-only text still took the
  intent's side, so `{ value: 0, intent: 'up-is-good' }` was read out as "no
  change, worse". There is no direction for an intent to judge, so the verdict is
  now dropped with it. `value` also gains an empty state — `null` prints an em
  dash with "No data" behind it rather than leaving a label over a blank line.

- **`Sparkline` drew an unchanged run along the floor.** `span = max - min || 1`
  normalised every point of a constant series to the BOTTOM edge, so "unchanged"
  and "pinned at its worst" were the same picture — in a column of sparklines,
  the one distinction that matters. `Heatmap` answered a zero span with the
  middle and `BulletChart` with the start; all three now agree on the middle,
  through one shared `fraction`.

- **`Heatmap` stretched its domain with a number it never drew.** Values were
  collected from every cell, but the grid renders by row-and-column lookup — so
  one misspelt header inflated the derived domain invisibly and pushed every
  drawn cell into the first fraction of the ramp. The domain now comes from the
  cells the grid can place.

- **`BulletChart` clamped without saying so.** A value past the domain filled the
  track exactly as the domain's top did; a notch at the end of the track now says
  it happened. Range bounds outside the domain were also filtered before the band
  label was built, so `[60, 80]` on `[0, 50]` produced one flat band AND lost the
  bounds from the table — the label now names what the caller set.

- **Seven charts had no empty state at all.** `PieChart`, `RadarChart`,
  `RadialChart`, `SankeyChart`, `ScatterChart`, `FunnelChart` and `TreemapChart`
  drew a named figure over a blank box at zero rows, and `ChartDataTable` renders
  nothing below one row — so the picture and its text equivalent went silent
  together and "no data" looked exactly like "failed to load". `BarList`,
  `BigNumber` and `Heatmap` were in the same position. The state now lives in
  `ChartFigure`, which every chart root already wraps itself in, and every chart
  in the package routes through it.

- **`ScatterChart`'s `isLoading` was hard-coded `false`.** It is now a prop, with
  the same badge every other chart shows.

- **`defaultSelectedDataKey` and its siblings seeded `useState` once.** Nine
  charts had a default and no controlled counterpart, so a call site that wanted
  a chart's selection to follow a filter, a route or a sibling chart had no way
  to say so — the prop that looks like the way to do it silently was not. Each
  now takes `selectedDataKey` / `selectedSector` / `selectedBar` /
  `selectedNode` beside its default, through one shared hook.

- **`FunnelChart` emitted an unreferenced `<defs>` block.** The root generated
  stage gradients under its own `useId` while `<Funnel>` generated and painted
  from its own — one gradient definition per stage, per chart, drawn and never
  used.

The three gaps that were "chart N forgot what charts 1 to N-1 do" are now gates
rather than review items: the shared chart fixture requires an empty render per
chart, and the suite walks every chart for its empty state and for the keyboard
cursor over its plot. Recharts 3.8 has no `accessibilityLayer` for `Sankey` or
`Treemap`, which is recorded as the exception it is rather than left looking like
an oversight.
