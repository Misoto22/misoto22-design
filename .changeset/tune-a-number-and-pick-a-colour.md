---
'@misoto22/design': minor
---

Two controls the forms group was missing, and the way out of the one a slider
cannot do: `ColorPicker`, `NumberField`, and `editable` on `Slider`.

The gap was written down in the package's own documentation. `Slider`'s
catalogue entry said "put an `Input` beside it when the exact number matters",
which is a component library telling a caller to build the missing half by hand
and keep two controls in step themselves. There was no numeric control with a
range and no colour control at all.

- **`ColorPicker`** — a swatch trigger and a panel that works in OKLCH. That is
  the substance rather than the styling: in HSV, which is what
  `<input type="color">` and most libraries use, a row of constant "lightness"
  visibly darkens as it saturates, so a reader tuning a palette is fighting the
  instrument. The plane is normalised to the gamut row by row, so its whole
  surface is reachable instead of a lens of colour inside bands of clipped
  duplicates, and the hue strip is taken at the lightness already chosen. It
  reads and writes hex, `rgb()`, `hsl()`, `oklch()` and `color(display-p3 …)`;
  the notation a caller passes in is the notation they get back. The plane is a
  group of two real sliders under the canvas rather than key handlers on it, so
  the arrows move it and a screen reader announces which axis it is on — the
  part a 2D picker usually leaves out, and leaving it out makes the control
  unusable rather than merely awkward.
- **`NumberField`** — a real `<input type="number">` in the shared control box,
  with a grip that sweeps the value as it is dragged, one step every 4px and ten
  with Shift held. A value that is TUNED — a duration, a line height, an offset
  — is found by passing through its neighbours, not by typing candidates one at
  a time. Clamping happens when the field is left rather than on every
  keystroke, because a minimum of 10 otherwise makes 50 unreachable: the `5` is
  pushed up before the `0` arrives.
- **`Slider`'s `editable`** — turns the readout into a box per thumb, showing
  `format`'s output at rest and the bare number on focus, so a reader still sees
  "$1,200" and a typist is never asked to type a currency symbol back. A typed
  value is held inside the neighbouring thumb as well as inside `min` and `max`,
  which is the bound a dragged one cannot cross and a typed one can.

`Slider` is now controlled from its own state whether or not the caller controls
it, because a number typed into the readout never passes through Radix — left as
it was, the thumb stayed where it had been while the figure above it moved.

The colour maths is adapted from [DialKit](https://github.com/joshpuckett/dialkit)
(MIT, Copyright (c) 2026 Josh Puckett); the notice travels with it in
`src/lib/color.ts`.
