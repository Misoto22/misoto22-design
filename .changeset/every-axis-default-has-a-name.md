---
'@misoto22/design': minor
---

Every theme axis default now has a name, so a subtree can opt OUT of an
ancestor's theme rather than only into a different one.

`[data-surface='paper']`, `[data-rules='hairline']`, `[data-type='editorial']`
and `[data-density='comfortable']` join `[data-radius]`, which already worked
this way. Each sits on the rule that declares the defaults rather than
restating them, so there is nothing new to drift.

The gap this closes: "the White Reset" used to be spelled "write no attribute",
which works exactly once — at the root. Inside a page whose root carries a
theme, an unset axis is not the default, it is whatever the ancestor said. Five
theme specimens on one page each inherited whichever theme the reader had
applied to the site, and all five showed the same colours.
