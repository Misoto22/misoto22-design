---
'@misoto22/design': patch
---

`--control-lh`: every control is now the height its token claims.

`--control-h-sm` is 36px and an `sm` Button measured 39. `md` said 44 and
measured 46; `lg` said 48 and measured 50. `min-height` is a floor, and a floor
only binds while the box is under it — the box being the line, the padding and
the border. The padding was already scaled per density for exactly this reason,
with a comment saying so. The LINE was not: it inherited the body's 1.6 reading
leading, which no control asked for, and 20.8 + 16 + 2 clears 36 on its own.

So every text button in the system was two to three pixels taller than the
number documenting it, and the documentation said 36 and 44. The Button page
still says "sm is 36px at the default density"; it is now true.

`--control-lh: 1.2` is the missing term, declared beside the padding it belongs
with, and `tokens.test.ts` now runs the arithmetic — line plus padding plus
border against the height token, at every size, on both densities.

`Kbd` carried the same literal `1.6`. Everything about it tracks its context in
`em` — "so it tracks whatever type it sits beside" — except the leading, which
was pinned at the reading value, so a keycap inside a control stood proud of
the label next to it. That is what kept the documentation site's search field
at 39px after the button itself was fixed, and what made it the one control in
the masthead taller than the four beside it.
