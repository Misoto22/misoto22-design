# Releasing

`@misoto22/design` is published to **GitHub Packages** as a restricted package
under the `@misoto22` scope. Versioning is driven by changesets, so the
changelog is written by whoever made the change, at the moment they understood
it — rather than reconstructed from commit subjects a month later.

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

GitHub Packages needs the scope pointed at its registry and an authenticated
read. In the consuming repository's `.npmrc`:

```
@misoto22:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` needs `read:packages`. In GitHub Actions the workflow's own
token is enough; locally, use a personal access token from 1Password rather
than pasting one into the file — the `${VAR}` form above reads the environment,
so the file itself stays free of the value.

```bash
pnpm add @misoto22/design
```

## Why not npmjs

The npm automation token in 1Password (`npm-registry-token`) is expired, and
minting a replacement requires an interactive login that CI cannot perform.
GitHub Packages needs no new credential: `GITHUB_TOKEN` already authorizes it.

Publishing to npmjs as well is one secret away — add `NPM_TOKEN` to the
repository, drop the `registry` line from the package's `publishConfig`, and
add a second `setup-node` step with `registry-url: https://registry.npmjs.org`.
Do that when someone outside these repositories needs to install it.

## Pre-1.0

Below `1.0.0`, SemVer's guarantees are weaker by convention: a `minor` may
break. The package is treated as if that convention did not apply — a removed
or renamed export, a changed default, or a token that no longer resolves is a
`major`, and the `CHANGELOG` says so. The version number is cheap; a consumer
discovering a silent break is not.
