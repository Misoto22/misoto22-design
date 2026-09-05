# Releasing

`@misoto22/design` is published to **npmjs** as a public package under the
`@misoto22` scope. Versioning is driven by changesets, so the changelog is
written by whoever made the change, at the moment they understood it — rather
than reconstructed from commit subjects a month later.

## Shipping a change

```bash
pnpm changeset          # pick the packages, the bump, and write one sentence
git add .changeset
```

Commit that file with the change itself. On `main`, the release workflow opens
a **Version Packages** pull request that collects every pending changeset, bumps
the version and folds the sentences into `CHANGELOG.md`. Merging that PR
publishes.

A change to the documentation site, to CI, or to a test needs no changeset;
`@misoto22/design-docs` is in the `ignore` list because it is deployed, not
versioned.

## Consuming it

Nothing to configure. The package is public on the default registry, so every
package manager reads it without a token or an `.npmrc` — `npm`, `pnpm`, `yarn`
and `bun` are four clients of one registry, not four places to publish.

```bash
pnpm add @misoto22/design
```

## The publish credential

`NPM_TOKEN` is an npmjs **automation** token — the granular kind, scoped to
read and write `@misoto22/*` and nothing else. Automation rather than
publish-classic because a classic token is refused when the account has 2FA on
publish, which is where an account holding a public package should be.

It lives in two places and no third:

| Where | What it is for |
|---|---|
| 1Password `01 Personal Development`, item `npm-registry-token` | the durable copy, tagged `project/personal-website` · `provider/npm` · `env/production` |
| the repository's Actions secret `NPM_TOKEN` | what the release workflow reads |

Minting one needs an interactive npmjs login, so it is a job for a person and
never for CI. Rotating it means replacing both copies; the workflow reads only
the secret, so a stale 1Password entry fails silently the next time someone
needs it by hand.

If the publish step ever fails with `402 Payment Required`, the cause is
`publishConfig.access` — npm treats a scoped package as private unless told
`public`, and a private package needs a paid account.

## Tags

`changesets/action` decides whether anything shipped by parsing the publish
CLI's human-readable output, and does not recognise the current CLI's wording —
so after a successful publish it reports nothing and pushes no tags. The
workflow therefore runs `changeset tag` itself, which reads the version out of
`package.json` rather than out of a log line, and skips tags that already exist.

If a release ever appears on the registry with no matching tag, that step is
where to look.

## Pre-1.0

Below `1.0.0`, SemVer's guarantees are weaker by convention: a `minor` may
break. The package is treated as if that convention did not apply — a removed
or renamed export, a changed default, or a token that no longer resolves is a
`major`, and the `CHANGELOG` says so. The version number is cheap; a consumer
discovering a silent break is not.
