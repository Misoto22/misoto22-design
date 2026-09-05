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

### What a publish is gated on

`publish` is a job in `.github/workflows/release.yml` that `needs: [verify,
browser]`, so the full pull-request gate — lint, typecheck, tests, both builds,
the size and tree-shaking budget, and the axe, keyboard and RTL suite in a real
browser — runs to green before anything reaches the registry.

That ordering is the point. `publish` used to be its own workflow triggered by
the same push, which meant it raced the checks rather than waiting for them: it
finished in a minute and a quarter while the browser suite was still six minutes
from done. A version that fails the a11y suite cannot be recalled, because npm
does not let a version number be reused.

> [!NOTE]
> The **Version Packages** pull request is opened by the workflow's own
> `GITHUB_TOKEN`, and GitHub does not trigger workflows for events from that
> token — so that pull request carries no checks and cannot. Its tree is
> verified after the merge, by the `main` run that publishes it.

## Consuming it

Nothing to configure. The package is public on the default registry, so every
package manager reads it without a token or an `.npmrc` — `npm`, `pnpm`, `yarn`
and `bun` are four clients of one registry, not four places to publish.

```bash
pnpm add @misoto22/design
```

## There is no publish credential

Publishing authenticates through **trusted publishing**: the workflow mints a
short-lived OIDC token, npmjs checks it against a publisher registered on the
package, and grants publish rights for that run. No npm token is stored in the
repository, in 1Password, or on anyone's laptop, so there is nothing to leak,
rotate, or discover expired on a Friday.

The two halves have to agree exactly, and npm does not validate the pairing
when you save it — a mismatch surfaces as a `404` at publish time, never as a
configuration error:

| Where | What it says |
|---|---|
| `.github/workflows/release.yml` | `permissions: id-token: write` |
| npmjs → the package → Settings → Trusted Publisher | repository `Misoto22/misoto22-design`, workflow `release.yml` |

Renaming the workflow file, or moving the publish into a different one, breaks
publishing until the npmjs side is updated to match.

### The one time a token is needed

Trusted publishing is configured on a package's settings page, which only
exists once the package does — so the **first ever version** of a new package
cannot be published this way ([npm/cli#8544](https://github.com/npm/cli/issues/8544)).
That version is published by hand, from an interactive terminal, with a
granular token and a 2FA code typed in at the prompt:

```bash
cd packages/design && pnpm build
env "npm_config_//registry.npmjs.org/:_authToken=$(op read 'op://01 Personal Development/npm-registry-token/credential')" \
  npm publish --access public --otp=<six digits>
```

The value stays in the process environment and never reaches disk. Afterwards
the trusted publisher is registered and the token is revoked; it exists for one
publish, not as standing infrastructure.

### When a publish fails

| Symptom | Cause |
|---|---|
| `404` from the registry | The trusted publisher does not match this workflow run. Check the repository name, the workflow filename, and that `id-token: write` is still granted. |
| `ERR_PNPM_OTP_NON_INTERACTIVE` | A token is being used instead of OIDC, and it does not bypass 2FA. CI has no terminal to type a code into. |
| `402 Payment Required` | `publishConfig.access` — npm treats a scoped package as private unless told `public`, and a private package needs a paid account. |

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
