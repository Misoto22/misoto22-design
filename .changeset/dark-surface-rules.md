---
'@misoto22/design': patch
---

The `warm` and `cool` surfaces keep their rules dark now — both set `--rule` and `--rule-2` once, so every border on a dark page rendered near-white.

**The dark block restated the grounds and not the rules.** Each surface moves
five tokens on the light ground and only three of them came back in dark, so
`#e8e4da` and `#e4e9ee` kept resolving over `#12110f` and `#0c0e11` — 14.86:1
and 15.82:1 against the surface's own paper, where the neutral dark rule sits at
1.42:1. Measured in a console built on this package: 33 routes, up to 174
near-white borders on one page. `glass` restates both and was never affected.

The replacements are built the way `tokens.css` builds its own, the system's
near-white at an alpha over whatever ground is under it, and at the SAME alphas
— 0.14 and 0.26 — because the alpha is what a rule's weight is. What moves is
the near-white: `#f4f4f2` held at its own lightness and turned onto the
surface's dark hue, 84.6° for warm and 258.4° for cool, at the chroma that
surface's light `--rule` carries. Composited on each surface's own dark paper
the two land at 1.45 / 2.19 and 1.42 / 2.17 against the root's 1.42 / 2.16.

The tint is not decoration. A light warm rule carries MORE chroma than the
ground it separates — C 0.0111 at `--stone` against 0.0185 at `--rule-2` — and
the root's neutral near-white inverts that on the dark ground: at 26% it washes
the tint out, leaving warm's heaviest rule at C 0.0075 over a `--stone` of
C 0.0103, the least warm thing on a warm page.

The test asks this per TOKEN now rather than per block, because a dark block
existing is not a dark block being complete — which is the whole of what the
surface axis was checking, and both of these had one.
