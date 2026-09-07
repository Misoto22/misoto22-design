---
'@misoto22/design': minor
---

The chart palette gains a third value, and forced colours gets its ramp back.

`data-chart-palette` had two answers — `mono` and `chroma` — and neither one
was "our accent is not ink". A consumer whose buttons, pills and rules had all
re-pointed off `--clay` still got eight greys in every chart, and the only way
out was the thing the axis exists to prevent: hand-picked hexes in a `colors`
config. `accent` derives all eight names from `--clay` instead, so it works for
an accent nobody here has seen.

It pins the LIGHTNESS and inherits the hue, because separation and contrast are
carried almost entirely by lightness — eight even steps across L 0.173–0.640 on
paper and L 0.967–0.530 on the dark ground, both bounds set by the weakest hue
rather than the prettiest. Measured across all 360 hues at maximum chroma:
adjacent-pair separation ΔE 26.7 light / 25.0 dark (OKLab ×100, against a floor
of 15), minimum contrast 3.11 on both grounds. `--series-1` sits mid-band, so a
one-series chart paints within ΔE 2 of the accent itself rather than in the
accent's darkest possible shade, and ink stays available as `--series-2`. What
it is NOT is a categorical palette: one hue laddered eight ways is guesswork at
eight series, and `chroma` is still the answer for a reader comparing
categories.

Separately, and older than this: `tokens.css` collapses the ramp to
`CanvasText` under `forced-colors`, and it writes that on `:root` — which any
palette attribute then outranks, because an element matching
`[data-chart-palette]` directly beats a value it merely inherits from the root,
and beats it on source order at the root itself. A reader in Windows High
Contrast who was on `chroma` kept getting the eight hues, which is the setting
being ignored rather than honoured. The ramp is restated after the palettes, at
the specificity the dark blocks use.
