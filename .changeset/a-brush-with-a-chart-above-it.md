---
'@misoto22/design': patch
---

A chart with a brush gets its plot back.

The brush is rendered as the chart container's FOOTER, and the footer branch
dropped the plot's whole shape: no `aspect-video` — correct, since sizing the
outer box 16:9 pays for the footer out of the plot's share — but also no
`min-h`, which was not. So a brushed chart had a plot with no intrinsic height
at all, and in any container that sizes to its content the plot measured zero
and only the brush's own 56px survived. The page showed a scrubber with nothing
above it to scrub. Recharts says so out loud — "width(-1) and height(-1) of
chart should be greater than 0" — into a console nobody reads, which is why it
stood.

The shape moves down one element instead of being dropped: with a footer, the
plot carries `aspect-video max-h-[26rem] min-h-[13rem]` and the footer sits
under it. `AreaChart`, `BarChart`, `LineChart` and `ComposedChart` are all
affected — every chart that takes a `Brush`.
