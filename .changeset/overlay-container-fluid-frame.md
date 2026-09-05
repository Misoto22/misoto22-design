---
'@misoto22/design': minor
---

Overlays and the fluid scale can be re-based onto a bounded frame.

- New `OverlayContainer`: names the element that `Popover`, `Select`,
  `DropdownMenu`, `ContextMenu` and `Tooltip` should render into. Panels then
  collide with that element's edges rather than the viewport's, and inherit the
  `dir` and `data-density` set on it. `Dialog` and `Sheet` still cover the
  viewport, which is what they are for.
- New `--fluid` token, `1vw` by default. A frame that declares
  `container-type: inline-size` and sets `--fluid: 1cqi` on an element inside
  it carrying `data-fluid-frame` re-bases the whole type and spacing ramp onto
  its own width.
- `FigureBand` is a query container and reads its own width, so four figures
  across is a decision about the band rather than about the window.
