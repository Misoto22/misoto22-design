---
'@misoto22/design': minor
---

`Command` rows carry a glyph and a note, and the palette says which keys do what.

- `CommandItem` takes `icon` and `meta`. Forty rows of bare text cannot be
  scanned — the eye sorts by shape before it reads.
- New `CommandFooter` and `CommandHint`: the key-hint strip a palette needs,
  because nothing else on screen says the arrows move the row.
- The highlighted row reads `--accent` with a leading rule, rather than a flat
  grey fill.
- `CommandDialog` is wider and sits above centre, where a palette belongs.
