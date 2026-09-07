---
'@misoto22/design': patch
---

An example's own knobs move out of the specimen and into the canvas toolbar.

A chart example that lets a reader switch the tooltip's ground had two
different things on the card: the chart, which is what the page is about, and
two pill groups, which are the demo's scaffolding. Drawn together they read as
one composition and the scaffolding won — it sat on top, it was the only thing
with a filled ground, and at 36px it was the system's smallest control against
a 26px toolbar two pixels above it. A reader looking for what `BarChart`
renders found a settings panel.

`ExampleControls` portals them up one band, beside LTR/RTL and the density
switch, at the same chrome scale — the same strip height, to the pixel. The
example's own code does not change: wiring state to a prop is the lesson in
several of these, so the controls stay where they were written and only the
canvas draws them elsewhere. `generate.mjs` unwraps the element out of the
printed snippet, the way it already drops `export function Example` and the
relative imports, so the code a reader copies is byte-for-byte what it was.

Twenty-four chart examples move. The four where a `ToggleGroup` IS the
specimen — its own three examples and `Field`'s group-naming one — stay put.

Separately, the tooltip knobs in `BarChart`'s interaction example now say what
they do: both move the floating panel and nothing else on the card, and
`frosted` is the plot showing THROUGH that panel, so it reads where the panel
crosses a bar and nowhere else. Over the white ground it is white at 75% over
white, which is white — a knob that appeared not to work.
