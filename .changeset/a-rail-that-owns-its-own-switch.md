---
'@misoto22/design': minor
---

`Sidebar` — a navigation rail down the side of an application, with the control
that hides it living on the thing it hides.

Composed rather than configured: `SidebarProvider`, `Sidebar`, `SidebarHeader`,
`SidebarContent`, `SidebarGroup`, `SidebarItem`, `SidebarFooter`,
`SidebarSeparator`, `SidebarTrigger` and `useSidebar`. A rail is a header, a
scrolling middle and a footer, and every product wants different things in all
three; what the component owns is the part that is the same everywhere — the
width, the edge, the scrolling, and what happens when it closes.

- **Closing has three shapes.** `icon` keeps the rail and drops the labels,
  which suits a fixed set a reader learns the shape of. `offcanvas` takes the
  whole rail away, which suits a long index nobody memorises — ninety-two rows
  collapse to ninety-two identical file icons, which is width answering
  nothing. `none` is a rail that does not close.
- **The trigger belongs inside.** A control that hides a thing lives on the
  thing: in an application's masthead it is one more anonymous icon in a row of
  them, with nothing connecting it to the column it operates.
- **A collapsed row is still a named row.** The label leaves the layout — a
  `sr-only` label still occupies the flex row's gap — and becomes the row's
  tooltip, because an icon alone is a guess for a sighted reader and nothing at
  all for a screen reader. The provider supplies the tooltip provider that needs,
  so the icon state works without the app being told to wrap itself in one.
- **A `<nav>`, not an `<aside>`.** The element decides the landmark, and a rail
  of links announced as "complementary" is not the one a reader jumps to when
  they go looking for the navigation.
- `--sidebar-w` and `--sidebar-w-icon` are tokens, because the shell beside the
  rail has to reserve exactly what the rail believes it is.
