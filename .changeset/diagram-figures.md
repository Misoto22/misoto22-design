---
'@misoto22/design': minor
---

Add `@misoto22/design/diagrams`: five diagram figures and the chrome to explore one.

`ArchitectureFigure`, `WorkflowFigure`, `SequenceFigure`, `DataflowFigure` and
`LifecycleFigure` render the JSON schemas published by
[archify](https://github.com/tt-a1i/archify), so a specification authored for
that tool renders here with no translation step — in this system's own terms
rather than in archify's palette. Where archify separates seven kinds of node
by hue, these carry the kind twice, as a drawn sigil and as a word on the
plate's eyebrow, so the distinction survives a greyscale print and a
colour-blind reader. The only colour any of them spends is `--success` and
`--danger` on a terminal lifecycle state, which is what those two tokens were
reserved for.

Every position comes out of the specification, so the figures render on a
server and produce identical markup twice — there is no layout to do and
therefore no shift on hydration. The `<svg>` is `role="img"` with a name, and
each figure publishes its nodes and relationships beside it as an ordinary
list; passing `onSelectNode` turns that list into the keyboard's route to a
selection.

`DiagramCanvas`, `DiagramToolbar`, `DiagramExportMenu`, `DiagramInspector`,
`DiagramMinimap` and `DiagramLegend` are the reader-facing half: pan and zoom,
a grouped action bar, PNG / JPEG / WebP / SVG / share-card export with the
theme's custom properties baked into real colours, a detail panel and an
overview map.

They ship from their own entry point so a page rendering a `Badge` does not pay
for a routing engine; `check-size` fails if they ever leak into the main
barrel. The shared SVG export helpers now live in `src/lib/svg-export.ts`.
