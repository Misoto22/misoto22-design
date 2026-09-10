---
'@misoto22/design': minor
---

`data-accent` is a shipped theme axis now — `ink`, `clay`, `forest`, `cobalt`, `moss` and `plum`, each re-pointing one token the whole system reads.

**The site could show it and no consumer could have it.** Five accents lived in
the documentation app's own `globals.css`, so a page on ui.misoto22.com
demonstrated a re-pointing that no installed copy of the package could
reproduce — while `SKILL.md`, `rules/tokens.md` and the emitted `llms.txt` each
said in so many words that no such attribute existed. All three were right about
the package and wrong about what the reader had just been shown.

`moss` is the sixth and it is the one the axis was moved for: a green-grey with
almost no chroma left in it, for a dense working screen where the accent has to
mark a choice without becoming the loudest thing on the page.

Every value carries a light hex, a dark hex and a collapse to `CanvasText` under
forced colours. The last of those is not politeness — a browser remaps an
element's own colours and does not reach inside an SVG or a `color-mix()`, and
`[data-accent='moss']` matches an element directly, so it outranks anything
`:root` merely offers. Without the restatement a reader in Windows High Contrast
who had chosen an accent kept it.

Nothing is authored twice. `scripts/theme-axes.mjs` reads the axis out of the
selectors that define it, so the skill, the offline agent documentation and the
site's index gained the row because the CSS exists. The one thing a selector
cannot say — that an unset accent is `ink` rather than the ancestor's — is the
line `catalog.mjs` still authors.
