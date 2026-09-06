---
'@misoto22/design': patch
---

Diagram edges go straight when straight is available.

Two bugs, one symptom. The port spread keyed on the word `auto` rather than on
the face a line would actually use, so every auto-routed line leaving one node
counted as sharing a face with every other — a node with one line going right
and one going down had both nudged off centre to make room for each other on a
face neither was on. Each line then arrived a few units out of true, and the
router answered that with a dogleg: two corners, an S, and a line that looks
like it is avoiding something.

The spread now keys on the resolved face, and a line whose two ends are within
two corner radii of each other is drawn straight rather than kinked — below
that threshold the dogleg cannot even draw its own corners. Real turns keep
their elbows.
