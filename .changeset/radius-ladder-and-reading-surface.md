---
'@misoto22/design': minor
---

One radius ladder driven by one factor, a calendar that picks a month in place
of the grid, a reading surface for long-form content, and a numbered rail for
the sequences a diagram should not be drawing.

**The radius is a ladder now, and a theme moves one number.** The four steps
were four independent values, and the radius theme re-typed all four — so
nothing held them in proportion and a corner nested inside another corner was
right at the one setting somebody checked and wrong at every other. Every step
is now `calc(<n>px * var(--radius-factor))` — 4, 6, 8, 12 and the pill, which is
where Tailwind's scale, shadcn's `--radius` ± 2 and ± 4, Radix Themes' steps 3
and 4 and Material's `xs`/`sm`/`md` all land within a pixel of each other.
`sharp` sets the factor to `0` and `round` to `2`, and the pill is on the ladder
with everything else: a square theme that left every button a capsule was not a
square theme. A true circle — an avatar, a status dot, a spinner, a radio — is
geometry and stays round.

**`Button` now draws `--radius`, the control step**, which is the same corner an
`Input`, a `Select` trigger and a `Textarea` draw. It was a pill, and a pill
beside an 8px field is two different ideas of what a control is — the one
inconsistency in the system that every reader noticed and no component page
could explain. The capsule is kept for the things that genuinely are one: a
badge, a status pill, a segmented strip, a progress track. `Calendar`'s own
chrome buttons follow, and its caption arrows are now the same height as the
month they sit beside rather than ten pixels above it.

Two rounded edges separated by a gap of `p` are concentric only when the inner
radius is the outer minus `p`. Both directions are named rather than left for
each surface to guess: `--radius-row` subtracts (a row inside a panel padded by
6px) and `--radius-frame` adds (a frame sitting 16px outside a `--radius-lg`
panel), with the adding one gated so a square theme stays square. Menus,
popovers, selects and the command palette now round their panel at
`--radius-lg` and their rows at `--radius-row`, which is the pairing that
actually holds at every setting.

The ladder is declared for `:root` **and** `[data-radius]`. A custom property
substitutes `var()` where it is declared, so a ladder written only on the root
bakes the root's factor in and a themed subtree never reaches its own — which
is exactly what the themes page does, five radii on five wrappers.

**New `Article`** — the long-form reading surface. Everything a Markdown
pipeline emits, set in this system's type, colour and rules: headings and their
anchors, lists, tables, quotations, code, figures, footnotes and MathML. The
styles ship as `@misoto22/design/article.css` and are scoped to a data
attribute, so a site with its own pipeline can take the reading surface without
taking the components.

**New `Diagram`** — a flow or architecture figure drawn from the system's own
parts. Nesting is containment and an edge is a step between siblings; it takes a
spec rather than markup, so a fenced ```diagram block and a hand-written figure
are one renderer, and it server-renders because it is markup rather than a
canvas.

**`Calendar` picks a month in place of the grid.** The month and year were two
`Select`s that portalled a ten-rem list over the calendar — three visible months
out of twelve, with a scroll arrow at each end, floating on top of the thing the
reader opened it to change. The caption is now one control reading "September
2026", and it swaps the day grid for a 3×4 month grid or a 4×6 year grid at the
same size. Nothing overlaps, nothing scrolls, Escape closes it and hands focus
back, and the year pages tile the range from its first year so every year in the
span is reachable — the old arrangement could offer a year it never showed.

The picker BROWSES; it does not navigate. Stepping the year moves the grid under
the arrows and leaves the calendar where it was, so one click does one thing:
choosing a month is what moves the calendar and closes the panel. It used to
navigate and close on the arrow, which meant `‹` on "2026" left the reader
looking at a different month with the picker gone.

**New `Steps`** — a numbered sequence as a rail: a marker, a rule through them,
a name and a line of detail. It is the figure a technical page reaches for
after a diagram and is not one, because nothing branches and nothing points at
anything; drawing an order with boxes and arrows says otherwise. An `<ol>`, with
the connector on the item so it stops between markers rather than running
through them and off the end.

**New floating-surface tokens, and a glass theme that spends them.**
`--panel-bg`, `--panel-border` and `--panel-filter` are what a surface that
FLOATS fills with and what it does to whatever is behind it — read by `Dialog`,
`Sheet`, `Popover`, `DropdownMenu`, `ContextMenu`, `Select` and `Command`, and
by nothing that sits in the page, because a card has nothing behind it to treat.
All three default to the plain surface, and `--panel-filter: none` is not a blur
of zero: any `backdrop-filter` value promotes its element to a compositing layer
and makes it a containing block for fixed descendants, which is a cost every
menu would pay for a theme most readers never turn on.

`[data-surface='glass']` then sets a translucent panel, a specular edge and
`blur(20px) saturate(180%)`. It does not break law 2: the blur is not UNDER a
surface pretending to be a shadow, it is BEHIND one. A shadow claims a light
source this system does not have; a frosted panel claims a material, and says
honestly that the page is still there behind it.

`Collapsible` also exports `CollapsibleTrigger` and `CollapsibleContent`, for a
disclosure that needs its own header layout.

**`FigureBand` reaches four columns again.** Its container query was declared on
the same element it queried, which can never match, so the band stayed two
columns at every width — four figures on a full page came out as a 2×2 block
with a hole in it.
