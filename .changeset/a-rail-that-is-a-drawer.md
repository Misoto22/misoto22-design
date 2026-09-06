---
'@misoto22/design': minor
---

`Sidebar` is a drawer where a column will not fit, and a page has a side to sit on.

Five things the rail could not do, and one of them was the reason every
application built on it wrote a second navigation by hand.

**Under `breakpoint` it is an overlay**, not a narrower column: `fixed` against
its own edge, over a scrim, and `inert` while closed. That last part is the one
hand-written versions skip — a drawer merely translated off-screen still holds
focus and is still read aloud, so a closed one puts its whole index between the
reader and the page they were on. The scrim is a real button, because tapping
beside a drawer is how a drawer is closed and that gesture has to exist for a
keyboard too. A row closes it: following a link inside an overlay and leaving
the overlay up is a reader landing somewhere they cannot see.

The switch is a media query in the stylesheet, not a branch on `matchMedia`.
The first version asked JavaScript and rendered a different tree from the
answer — an answer that does not exist until an effect runs, so a phone painted
a 256px column beside a 390px screen and the page scrolled sideways until React
caught up. `breakpoint` is therefore one of `'sm' | 'md' | 'lg' | 'xl'` rather
than a number: these are literal class strings, and a class built from a runtime
number is one the compiler never emitted. `null` pins the rail as a column at
every width, and `contained` points the overlay at a positioned ancestor instead
of the window — for a rail inside a device preview or an embedded console.

**`side="end"`** puts the rail on the other edge, logically: the right in a
Latin document and the left in an Arabic one, with the hairline, the collapse
glyph and the row tooltips all following rather than being written twice.

**`variant`** decides which of the two pieces is the panel. `flush` is a column
and a page divided by a hairline. `floating` lifts the rail off the ground as
its own bordered panel. `inset` is the same gesture the other way up — the rail
becomes the ground and the new `SidebarInset` draws the page as the panel, which
is why the setting lives on the provider: one decision, two components, and no
way to set half of it.

**`SidebarInset`** is the column beside the rail. Every layout built on this was
writing the same `flex min-w-0 flex-1 flex-col` by hand, and `min-w-0` is the
half everybody forgets: a flex child's floor is its content, so one wide table
inside pushes the whole page past the viewport and takes the rail's width with
it.

**`persist`** takes a `localStorage` key and remembers the docked state. A
reader who put the rail away did not mean "until the next page". Only the docked
state is kept — restoring an open drawer is a page that loads with its own
navigation over the top of itself — and it is read after mount, never during
render, because a value from storage in the first pass is a hydration mismatch.
