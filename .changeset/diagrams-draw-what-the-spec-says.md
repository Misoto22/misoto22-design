---
'@misoto22/design': minor
---

Twelve fields in `@misoto22/design/diagrams` that typechecked and drew something
else — and the half of every figure a screen reader was never given.

Each of these renders without an error, a warning or a missing box. The
specification is valid, the picture is not the one it describes, and the only
way to find out was to look at the drawing already knowing what it should have
been. Every one now does what its type implies, or says so by name in
development. None of the warnings reaches a production bundle.

**Placement that quietly disagreed with the specification.**

- **An `ArchitectureFigure` component that declared neither `row` nor `col` was
  drawn at row 0, column 0** — along with every other component that declared
  neither, which is one plate with the rest underneath it. They now flow into
  the next free cell in declaration order, wrapping at `layout.cols`, stepping
  around whatever the placed ones claimed. `layout.cols` had been accepted and
  read by nothing.

- **`layout.cellW` moved plates without widening them.** The pitch came from
  the layout and the plate's own width from the module default, so `cellW: 240`
  was a grid with wider gaps rather than wider boxes.

- **Two components on one cell** are still one plate over another — there is no
  second place to put the second plate — but development now prints
  `DIAGRAM_CELL_COLLISION` naming both.

- **A spec object mutated in place drew the picture it was first given.** The
  model is memoised on the spec's identity, and a `push` does not change it.
  All five figures now print `DIAGRAM_SPEC_MUTATED` when they catch that.

- **An unknown `lane` id resolved to lane 0** in `WorkflowFigure` and
  `LifecycleFigure`, drawing the step in the right column and the wrong band.
  It still does — there is nowhere else to put the box — but it prints
  `DIAGRAM_LANE_UNKNOWN`, and in a lifecycle it no longer enrols the state in
  the implicit main rail: a typo could previously add an arrow the machine does
  not have.

- **A `DataflowFigure` node past the declared `stages`** is drawn past the last
  heading, under no heading at all. Now `DIAGRAM_STAGE_OUT_OF_RANGE`, and the
  text equivalent files it under a band named for what it is.

- **`LifecycleFigure.yOffset` was accepted and deliberately dropped**, while
  `WorkflowFigure` and `DataflowFigure` both applied theirs — one field name,
  two behaviours, nothing in the type to say which. It is applied.

- **A `SequenceFigure` message naming an undeclared participant** vanished from
  the picture and survived in the hidden summary as a raw id: the two halves of
  one figure disagreeing about what the exchange contains. Dangling edges are
  now dropped from both halves in every figure, and reported once as
  `DIAGRAM_EDGE_DANGLING`.

**The text equivalent carried half the diagram.** Each figure publishes a
`role="img"` picture beside a hidden list, and that list held nodes and edges
only — so a workflow's lane axis and a data flow's stage axis, the second
dimension of both diagrams, reached a screen reader not at all. The list is now
grouped by that axis, which makes it structural rather than a phrase repeated on
every row, and the statements that group nothing follow as sentences: an
architecture boundary and what it encloses, a workflow phase and the columns it
covers, a sequence segment and the messages inside it, an activation bar named
by the calls it spans. A lifecycle state's step number joins its line, and the
implicit rail — two of the three arrows in a three-state machine — is published
for the first time. Selecting a node from the list is unchanged: exactly one
control per node, wherever it is grouped.

**Fields that typechecked and did nothing.**

- **`WorkflowPhase.toCol` and `.variant` are drawn.** A phase's rule runs across
  the columns it claims instead of across the whole figure, so its extent is
  something a reader can see; `security` dashes that rule and `emphasis`
  thickens it.

- **`WorkflowEdge.role` reaches the line.** `async` and `error` take the quiet
  dashed stroke the docstring had been promising for `error`; `return` keeps its
  open arrowhead; `main` and `branch` add nothing, because `mainPath` already
  draws that distinction as weight. An explicit `variant` still wins.

- **`meta.views` and the three label nudges are documented as the no-ops they
  are**, the way `meta.viewBox` already was, and `column_fit: 'spread'` now
  describes what it does — the widest label sets the pitch for every column —
  rather than dividing the figure evenly, which it never did.

**The chrome.**

- **`DiagramExportMenu` reported a success it could not have known about.** With
  `onExport`, a handler that did nothing resolved exactly like one that wrote a
  file. `ExportResult` now carries `source`, and `ok` says only that the
  pipeline named by it finished.

- **There was no transparent export in any format.** A new `background` prop
  takes `null` for a figure going onto a coloured page; JPEG is still flattened
  onto the reader's own paper, because a transparent JPEG is a black one. The
  serialiser behind all of it — `serializeSvg`, `rasterize`, `downloadBlob`,
  `exportFilename` — is exported from `@misoto22/design/diagrams`, so a caller
  who needs a different pipeline has something to build on.

- **The five format rows are menu items.** They were plain buttons inside a
  `role="menu"`: no roving focus, no typeahead, and the menu stayed open over
  the file it had just written.

- **`DiagramInspector` keyed its facts by label**, so a node read out of two
  files showed one row. Both render.

- **`DiagramMinimap` asked for the one number that makes it lie.** A
  `DiagramCanvas` now reports the frame it was measured against on every view it
  emits, so `frame` is optional and wiring `onViewChange` through is enough. A
  `content` width of 0 — a ref measured on the first render — draws an empty
  plate rather than the artwork's top-left corner at full size; the viewport
  rectangle is clipped to the map; and a drag seeks only when it started on the
  map.

- **`LifecycleFigure`'s plates take a pointer cursor** when the caller can
  select them. It is the one figure that builds its own group rather than using
  the shared plate, and it was the one figure showing a text caret over a
  control.
