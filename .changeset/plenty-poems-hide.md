---
'@misoto22/design': patch
---

Add a size and tree-shaking budget to the build (`pnpm check:size`).

The absolute numbers are the boring half. The useful one is the proportion:
bundling a single component and comparing it to the whole package is the only
way to notice that tree shaking has quietly stopped working — one barrel
import, one side effect in the entry, and every consumer ships the calendar to
render a badge. It is invisible in review and shows up months later as a bundle
nobody can explain.
