---
'@misoto22/design': patch
---

The rail stops looking like a terminal listing.

A `SidebarGroup` heading was set in the MONO face at 15px medium. Ten of those
stacked in a column read as a code listing rather than as a navigation: mono is
this system's voice for code, metadata and figures, and a navigation heading is
none of those. The heading is now the same face and size as its rows and
outranks them by weight and by one step of ink — the two signals that can rank a
row without changing what kind of thing it is. Counts come off mono too.

`NavItem` tightens with it: `--radius-sm`, and the padding a 14px row wants
rather than the padding a 15px one did.
