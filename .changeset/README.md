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

## What counts as a consumer-visible change

- A new component, prop, or export → `minor`
- A behaviour or visual fix, a doc comment the site renders → `patch`
- A removed or renamed export, a changed default, a token that no longer
  resolves → `major`

A change to the documentation site alone, to CI, or to a test needs no
changeset.
