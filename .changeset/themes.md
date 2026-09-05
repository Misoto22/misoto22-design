---
'@misoto22/design': minor
---

New `themes.css`: theming beyond the accent.

Six axes, each an attribute that re-points tokens the package already defines —
`data-surface`, `data-radius`, `data-rules`, `data-type`, `data-motion`, and the
existing `data-density`. No component reads any of them, and the layer
introduces no token of its own; a theme re-points, it does not invent.

Nothing is anchored to `:root`, so an axis can sit on any element and the
subtree below takes it. That is what lets a page print five themes side by side
without five documents.

Available as `@misoto22/design/themes.css`, and included in `styles.css`.
