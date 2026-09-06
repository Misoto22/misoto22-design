---
'@misoto22/design': minor
---

`AppShell` takes `sidebarLabel`, `navLabel`, `openLabel` and `closeLabel`.

Both landmark names were hardcoded English. Two `complementary` landmarks with
the same name cannot be told apart, which is exactly the pair a shell rendered
inside another page makes — a preview, a screenshot harness — and it was the
only part of the component a non-English app could not translate.
