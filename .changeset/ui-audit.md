---
'@misoto22/design': patch
---

Ten fixes from a walk over the published site.

- `FigureBand` collapsed to two zero-width columns of overlapping text. It
  declares `@container`, which computes its width without looking at its
  contents — as a shrink-to-fit flex item that resolved to nothing.
- `CardTitle` on the reversed `plate` was ink on near-black, at 1.25:1.
- `ToggleGroup` stretched to whatever its flex parent was, leaving dead space
  after the last segment. `inline-flex` does not opt out of that; `w-fit` does.
- Anchored panels grow from their trigger and now animate on the way out too.
- `Select` takes `contentClassName`, and the calendar's year list uses it: the
  default 18rem covered the calendar the reader opened it to change.
- `Combobox` and `SearchableMenu` name their filter field for what it does. It
  inherited the control's own name, so a screen reader met two comboboxes
  called the same thing, one inside the other.
- New `scroll-hairline` for a bounded panel, used by the command palette.
