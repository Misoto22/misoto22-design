---
'@misoto22/design': minor
---

The package documents itself for agents, offline: a `misoto22-design` CLI, a
skill, and a README.

The docs were on a website while the version being written against was in
`node_modules`, and neither side could see the disagreement. Everything an agent
needs now ships in the same tarball as the source it was generated from.

- `npx misoto22-design docs <Component>` prints one component in full — every
  prop with its type and default, the exported unions, the keyboard contract,
  the accessibility promises, the `@example` blocks. The median component is
  about 500 tokens, against roughly 28,000 for all fifty-two. It resolves parts
  and types too, so `docs CardBody`, `docs TH` and `docs ButtonVariant` all land
  on the right file — which is what you have when an import just failed.
- `npx misoto22-design docs --installed` is the cheap half: the resolved version
  and every component name, a few hundred tokens.
- `npx misoto22-design init --agents-md` installs the skill under
  `.claude/skills/` and points `AGENTS.md` at it. Its name and description are
  about 110 tokens and are all a session carries until something touches the
  package; the body and the five rule files load from there.
- `README.md` was listed in `files` and did not exist, so the npm page has been
  blank. It exists now.

Two things the old documentation said were not true. There has never been a
`data-accent` attribute — `--accent` is a custom property — and
`data-surface="glass"` was never listed, so nothing pointed at an axis value
that does work. The axes are now read out of the stylesheets that define them
rather than described by hand, and a test fails when the authored half stops
matching.

Nothing about the runtime changed: same exports, same CSS, same bundle.
