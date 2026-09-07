# Changesets

Every change to `@misoto22/design` that a consumer could notice ships with a
changeset — a small file saying which packages changed, how much (`patch`,
`minor`, `major`), and why in one sentence.

```bash
pnpm changeset          # write one, interactively
pnpm changeset status    # what is pending
```

The release workflow reads the pending set on `main`, bumps the version, folds
the sentences into `CHANGELOG.md`, and publishes. So the changelog is written by
whoever made the change, at the moment they understood it — not reconstructed
from commit subjects a month later.

`@misoto22/design-docs` is ignored: the documentation site is deployed, not
versioned, and a version bump on it would mean nothing to anyone.

## The shape of one

The FIRST PARAGRAPH is the changelog entry: one sentence, under 160 characters,
readable in a list of forty. Everything below a blank line is detail — kept in
full, folded away under the entry on the documentation site.

```markdown
---
'@misoto22/design': minor
---

`Sidebar` — a navigation rail down the side of an application, with the control
that hides it living on the thing it hides.

**Closing has three shapes.** `icon` keeps the rail and drops the labels …
```

That split is not a length budget in disguise. The reasoning is the reason an
entry here is worth reading; what it cost, unfolded, was the index — 0.9.0 ran
to 2,685 words at a median of 161 an entry, where Radix, Chakra and MUI run 10
to 25. Folding gives the index back and keeps the argument.

`node .changeset/shape.mjs` checks it, and the `changeset` job in `pr.yml` runs
that same file. It checks the shape and not the sentence: whether the entry is a
GOOD one is the same thing this repository already cannot check about a bump
level. See `DESIGN-CHANGELOG-001`.

## And its Chinese, in the same pull request

`apps/docs/src/i18n/changelog.ts` carries every entry in Chinese, keyed by the
fingerprint of the English, and `changelog.test.ts` asks for the pending
changesets to be covered — so a changeset with no translation is red on its own
branch rather than on the release it would otherwise stop. `DESIGN-I18N-001`.

## What counts as a consumer-visible change

- A new component, prop, or export → `minor`
- A behaviour or visual fix, a doc comment the site renders → `patch`
- A removed or renamed export, a changed default, a token that no longer
  resolves → `major`

A change to the documentation site alone, to CI, or to a test needs no
changeset.
