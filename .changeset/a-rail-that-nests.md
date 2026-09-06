---
'@misoto22/design': minor
---

`SidebarBranch` — a row that opens onto more rows — plus a `badge` slot on
`SidebarGroup`, and a 16rem rail.

Nesting is the thing a rail is for and the thing a flat list of groups cannot
do: a workspace with projects in it, a folder with documents in it, a service
with its environments. The line it draws is between a PLACE and a HEADING —
`SidebarGroup` is a heading over a set and has neither an icon nor a state
because it is not somewhere you can be; a branch has both because it is.

Children sit behind the same hairline a group draws, one indent further in, so
depth reads as depth. Two levels is what the indent has room for at this width;
a third is a horizontal scrollbar with an outline in it. Collapsed to icons a
branch is its icon and its children are not drawn — a nested glyph under an
unnested one is two marks with no visible relationship.
