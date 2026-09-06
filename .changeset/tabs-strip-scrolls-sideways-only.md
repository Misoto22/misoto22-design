---
'@misoto22/design': patch
---

`TabsList` no longer grows a vertical scrollbar beside a row of tabs.

`overflow-x: auto` on its own computes `overflow-y` to `auto` as well, and the
active trigger's `-mb-px` rule leaves the content exactly one pixel taller than
the box — enough for a browser to draw a full-height scrollbar next to a strip
with nothing to scroll. A strip only ever scrolls sideways, so it now says so.
