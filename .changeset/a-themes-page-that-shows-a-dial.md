---
'@misoto22/design': patch
---

Named axis defaults reach one more call site, and the argument for them is now
on the page.

`ThemeRail` wrote only the axes a preset moves, on the reasoning that the rest
are the White Reset. They are not: an unset axis is not "the default", it is
whatever the ancestor said — and that rail's ancestor is a document carrying
whichever theme the reader applied to the site. So every thumbnail showed the
reader's own corners, rules and face for five of its six axes, and eight
previews of eight different themes came out looking like eight previews of the
one already on screen. It is the same defect the themes gallery had, in the
second of the two files that draws a preview.
