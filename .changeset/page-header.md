---
'@misoto22/design': minor
---

`PageHeader` — a page opening, with the order of its parts fixed: the trail, the kicker, the title, the controls that qualify it, and the sentence under them.

The system had `Heading` for a heading and `Breadcrumb` for a trail and nothing
that said how a page STARTS, so every application invented the arrangement — and
the eyebrow landed above the title on one screen and below it on the next. Two
consoles built on this package had two different answers, which is one more than
a design system is for.

**Where the range picker goes is the argument.** It sits beside the title, above
the rule, because it does not act on the records: it says which slice of them the
title refers to. Below the rule it becomes a toolbar competing with whatever
strip the page starts with, which is where every application had put it.

The title is an `h1` by default because a page has one name, and a shell that
owns the document's heading has taken the page's own name away from it; `level`
moves it for the case where the opening is not the document's, which is a
preview canvas or a template inside a page that already has an `h1`. The SIZE
does not move with it: `--fs-heading` at every level, rather than `Heading`'s own
level-1 default of `--fs-title`, because a page opening stands over a working
screen and moving one down the outline is a fact about the document rather than
a request for smaller type.
