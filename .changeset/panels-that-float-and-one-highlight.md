---
'@misoto22/design': patch
---

A floating panel now reads as floating, and a list draws one highlight rather
than two.

**Depth.** Every overlay — menu, popover, select, dialog, sheet, palette — sat
on `--paper` over a page of `--paper` with a hairline between them, so nothing
said the two were different surfaces. `--panel-lift` is the offset under them,
and it does not break Law 2: the law says a box-shadow is never BLURRED, not
that there is never one. Two hard steps in the rule colours, which is a stack
seen from the front — the flattest way to say depth without drawing light.

**One highlight.** `SidebarItem` drew the current page filled and filled a row
under the pointer, which is two rows claiming to be where the reader is. While
the pointer is in the list the fill is the pointer's, and it returns to the
current row when the pointer leaves. `aria-current` never moves — nothing about
what is TRUE changes, only what is drawn.
