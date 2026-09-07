---
'@misoto22/design': minor
---

Every icon in the package is a Remix Icon glyph now, and the brand marks lucide dropped come
back with them.

`lucide-react` is gone from `dependencies` and `@remixicon/react` replaces it, across all
thirty-four components that draw one. The names change with it — `Check` is `RiCheckLine`,
`X` is `RiCloseLine`, `Settings` is `RiSettings3Line` — but no export of this package's own
changes, so an app that never imported an icon directly sees only different glyphs.

BRAND MARKS ARE THE REASON. lucide removed every one of them, and a design system that
cannot draw a GitHub octocat without redrawing somebody's trademark in a house stroke is a
design system that pushes that decision onto its consumers. This site had already paid it:
the mark in its own masthead was a hand-drawn path in a file of its own, and that file is
deleted. Remix Icon ships `RiGithubFill`, `RiTwitterXFill`, `RiDiscordFill`, `RiSlackFill`,
`RiFigmaFill` and a couple of hundred more, each in a Fill and a Line.

Three things change for a consumer, and all three are visible rather than silent.

`--ico-stroke` IS REMOVED. A Remix glyph is a filled path on a 24px grid, so there is no
weight to set and nothing for the token to name; a token that documents a knob the system no
longer has is worse than no token. `--ico-s`, `--ico-m` and `--ico-l` are unchanged, and so
is every size the package draws at.

`LucideIcon` becomes `RemixiconComponentType` in the props that take an icon COMPONENT —
`NavItem.icon`, `EmptyState.icon`, `DropdownMenuItem.icon`, `ContextMenuItem.icon`,
`CommandItem.icon`, and the chart toolbar's. Both are `ComponentType`s over an SVG's props,
so a lucide icon passed to one still type-checks and still renders; the name in the
reference is what moved.

AND `aria-hidden` IS NOW WRITTEN RATHER THAN INHERITED. lucide stamped `aria-hidden="true"`
onto any icon it had not been handed an `aria-` prop or a role for. `@remixicon/react` adds
nothing and spreads what it is given straight onto the `svg`, so every decorative glyph in
the package carries the attribute at its own call site — thirty-nine of them, added in this
change. Anything drawing its own icons should check the same thing on upgrade: nothing
fails, the icon simply starts being announced.
