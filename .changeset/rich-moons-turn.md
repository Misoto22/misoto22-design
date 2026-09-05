---
'@misoto22/design': minor
---

Add a density axis, make every component direction-independent, and ship the
tokens in a machine-readable form.

`data-density="compact"` on any container tightens every control below it —
44px at the default, which is the pointer target WCAG 2.5.5 asks for, and 36px
compact, which still clears 2.5.8 and no longer meets 2.5.5. It is for a dense
desktop tool driven by a mouse, and the docs say so rather than presenting it
as free.

Every component now uses logical properties, so `dir="rtl"` mirrors the system
with no stylesheet of its own. A source test fails the build on a physical one
and on any inline-axis transform without an `rtl:` counterpart; a browser test
checks the result actually mirrors, which a source test cannot.

`@misoto22/design/tokens` exports every token with its light value, dark value,
category and explaining comment, as JSON and as a typed module — for a Figma
sync, a native app, or any consumer that needs the values and cannot read a
stylesheet. The documentation site now reads that artifact instead of parsing
the CSS a second time, so the site and the package can no longer disagree about
what a token is.

`FloatingIconButton`'s `position` is now `start` / `end` rather than
`left` / `right`, so the API does not hard-code one script's layout.
