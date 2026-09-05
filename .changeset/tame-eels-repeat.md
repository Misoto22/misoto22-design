---
'@misoto22/design': patch
---

Fix three defects a browser found that a jsdom suite could not see.

`Table`'s scroll container was unreachable by keyboard: a scrollable region
whose contents are not themselves focusable has nothing to Tab to, so every
column past the fold did not exist for anyone not using a mouse. It is now a
focusable, labelled region.

`RadioGroup` moved focus with the arrow keys but not the selection. The
upstream primitive gates that on a flag cleared by `keyup`, and loses the race
against its own focus move — a normal keypress releases before React commits,
so the outline moved and nothing was chosen. Tracked by timestamp instead,
which cannot be cleared out from under the focus handler.

`AppShell` renders a `<main>`, which is right for an application shell and
wrong for one embedded in another page — a document may contain exactly one. It
now takes `contentAs`.
