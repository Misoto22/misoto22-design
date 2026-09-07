---
'@misoto22/design': patch
---

`--bar-h`: the band across the top of an application, as one number.

It was five literals in two packages, and they disagreed. `AppShell` said
`h-14` and the documentation site said `h-16` — the same role, 56px in the
component this system ships and 64px on the site documenting it. A sixth,
`SidebarHeader`'s `min-h-14` floor, is what accidentally kept the rail's head
level with the masthead beside it, and what would have stopped it staying level
the moment either moved. `--scroll-offset` was a seventh: "a masthead plus a
line of air", written as `88px`, a number derived by hand from whichever of the
two answers its author had on screen.

Derived rather than typed. A bar is a row of controls and the air around them,
so it is the control it seats plus six pixels above and below — the same twelve
`--sidebar-w-icon` adds to a rail's collapsed width, for the same reason. A bar
can no longer be set to a height its own controls do not fit in, and
`--scroll-offset` is now `calc(var(--bar-h) + 1.5rem)`, so a bar that moves
takes every anchored heading with it.

WHICH control depends on the pointer. A bar is chrome: its controls are `sm`,
the density this system documents as a deliberate below-the-floor size for a
mouse. A finger is not a mouse, so on a coarse pointer they grow to the 44px
target WCAG 2.5.5 asks for and the bar grows with them. 48px comfortable and
42px compact with a pointer; 56px and 48px with a finger.

Declared on the root, which is load-bearing rather than incidental: a `var()`
inside a custom property is substituted where the property is DECLARED, so
`--control-h-md` resolves once and every descendant inherits the same answer —
including a rail that pins its own `data-density`, which is what keeps a
compact rail's head level with a comfortable page's bar.

The documentation site's masthead loses 16px in the process — 64px down to 48px
on a desktop, unchanged at 56px on a phone. It was seating 39px of content in
64px of bar, and holding a further 8px for a 44px target that only exists when
the pointer is a finger.
