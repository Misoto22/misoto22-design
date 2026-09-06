---
'@misoto22/design': minor
---

`EmptyState` and `ErrorState` take a `level`, and stop deciding the document
outline for the caller.

Both rendered a heading at a level that was fixed and could not be passed in —
`ErrorState` an `h1`, `EmptyState` an `h3`. That is not only a markup detail:
the catalog entry for `ErrorState` already told readers "do not render it inside
a shell that already has an h1", which was advice the API gave them no way to
take. A rule the caller cannot follow is worse than no rule.

Both now render through `Heading`, so the element and the size are separate
props and the size is pinned by the component: `EmptyState` is `--fs-sub` and
`ErrorState` is `--fs-heading` at every level. Moving a state down the outline
is a fact about the document, not a request for smaller type.

The two defaults differ, and deliberately:

- **`ErrorState` defaults to `1`, unchanged.** It replaces the page rather than
  sitting inside one — its own ground, its own viewport, its own top clearance —
  so the page's single `h1` is the one it renders. Existing call sites render
  exactly the markup they did. Inside an app shell that already owns the page
  heading, pass `level={2}`.
- **`EmptyState` defaults to `2`, changed from a fixed `3`.** It stands in for a
  whole view inside a page that already has an `h1`, so the level below that one
  is the level that does not leave a hole in heading navigation. The old `h3`
  was wrong in the ordinary case and impossible to correct.

Neither is required. The correct placement has one answer often enough that
making every call site restate it would buy nothing, and `Heading` already
proves the point that a good default is worth more than a forced decision.

**What a consumer has to do.** If you relied on `ErrorState` rendering the page
`h1`, nothing — that is still the default. If you relied on `EmptyState`
rendering an `h3` — a CSS selector, a snapshot, a test querying by level —
pass `level={3}` to keep it, or update the expectation. Nothing else about
either component moved.

One rendering difference beyond the element: the heading now takes its
line-height from the system ladder — 1.25 for `EmptyState`, 1.2 for
`ErrorState` — where before it inherited the ambient 1.5. That is the same
leading `article.css` gives a rendered Markdown heading, which is what makes a
component page and a post read as one publication. Font size, face, weight,
colour and the surrounding spacing are unchanged.
