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

Two corrections found by the browser sweep, in the same layer:

`[data-density='comfortable']` first landed on a `:root` block that also carries
the status colours, the floating surfaces and the motion steps, so every element
declaring the default density re-declared the whole LIGHT palette on itself — in
dark mode, a light `--danger` painted on a dark ground. A neutral value may only
restate the axis it names, so density now sits on a rule holding nothing else.

And the dark block was missing the compound forms — `[data-mode='dark'][data-surface='paper']`
and the rest — so a dark subtree that named its own default surface got the light
one back.
