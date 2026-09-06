---
'@misoto22/design': minor
---

Four record-and-settings primitives — `DescriptionList`, `Toolbar`, `Timestamp`
and `AspectRatio` — and three props that made a fourth and fifth component
unnecessary.

The evidence was a template pass: eight new pages built from the existing
library, and a list of what had to be hand-rolled and how many times. The
repeats are what shipped.

- **`DescriptionList`** — a record's fields as a real `<dl>`/`<dt>`/`<dd>`. The
  most repeated shape in any detail page, and the one most often built out of a
  `<div>` grid — which looks identical and tells a screen reader there are two
  columns of unrelated text. `layout` is `row` or `stacked`, `divided` draws the
  hairlines, and an empty `items` renders `null` rather than an empty bordered
  box.
- **`Toolbar`** — the sticky bar of actions at the edge of a working surface,
  built independently by two templates. Opaque `--paper` and not a blur, because
  content scrolls under it. It is a named `role="group"` and deliberately not
  `role="toolbar"`: that role promises arrow keys between the controls, and
  declaring it without roving tabindex tells a screen-reader user to press keys
  that do nothing.
- **`Timestamp`** — an instant, rendered the one way the system renders them.
  The first paint is the UTC calendar date sliced straight out of the ISO string
  with no `Intl` involved, so the server and the hydrating client cannot
  disagree; the relative and locale-aware forms are applied after mount. The
  `datetime` attribute is the full ISO instant from the first render and never
  changes. A value nothing can parse renders an em dash, never the browser's
  literal `Invalid Date`.
- **`AspectRatio`** — the one layout primitive that is genuinely hard by hand.
  The `padding-top` percentage trick resolves against the WIDTH, which is why it
  works and also why it breaks as a flex child. Here the box declares
  `aspect-ratio` and every direct child is stretched out of flow, so content
  with no intrinsic size still holds the box open.

Three additions that are props rather than components:

- **`Field` gains `description` and `layout="row"`** — the settings row, which a
  template hand-rolled three times. It is a layout on `Field` and not a
  `SettingRow` beside it, because the label wiring, the required marker and the
  message slot are the same three things either way. `description` explains the
  setting and sits under the label; `hint` explains the input and sits under the
  control. Both reach the control through `aria-describedby`. The association is
  `Field`'s existing `cloneElement` wiring, so it holds for `Input`, `Textarea`,
  `NativeSelect`, `Checkbox` and `Switch` — every control a settings row is
  built from — and not for the six composite controls that already carry their
  own `label` prop. That limit is now written into `Field`'s own documentation
  rather than only into the catalog.
- **`Tag` gains `onRemove` and `removeLabel`** — instead of a `Token` component.
  A token is a tag with a remove button; the difference is one prop, and this
  system already ships three things that look alike. `removeLabel` is required
  alongside `onRemove`, because "Remove" repeated down a row of filters is eight
  controls a screen reader cannot tell apart.
- **`Separator` gains `label`** — "or continue with" was two `Separator`s and a
  `span` at every call site. The rule is drawn twice, one `aria-hidden` piece
  either side of the words, so there is no ground to punch a hole in and the
  component never has to be told which surface it is on.
