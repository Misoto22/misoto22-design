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

The `changeset` job in `.github/workflows/pr.yml` enforces exactly that split: a
pull request touching `packages/design/src` outside `__tests__` fails until it
carries a changeset, and everything else passes untouched. A refactor there that
no consumer can observe is waived with the `skip-changeset` label, so the
exception is a visible act rather than an omission nobody noticed.

Note what the gate is *not* protecting against. Two branches can never contest a
version number, because neither one writes one — a changeset names a bump kind
in a randomly named file, and `release.yml` computes the number afterwards, once,
under a `concurrency` group of one. What parallel work actually loses is the
sentence: a library change merged without a changeset still ships, folded into
whatever version the next changeset produces, and the `CHANGELOG` then describes
a release that quietly did more than it says.

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

### The Version Packages pull request arrives blocked, and the translation unblocks it

It is opened by the workflow's own `GITHUB_TOKEN`, and GitHub fires no workflows
for events from that token — the recursion guard that stops a workflow from
triggering itself. So the pull request arrives with no checks at all, and under
the `main` ruleset below, which requires three of them, it reads as `BLOCKED`.

**Any event from a real account starts them.** In practice there is already one
to make, and it is the step this release needs anyway:

```bash
git fetch origin && git checkout changeset-release/main
# translate this release's entries in apps/docs/src/i18n/changelog.ts
git commit -am 'docs(i18n): translate the <version> changelog' && git push
# the push starts verify, browser and changeset; when they are green:
gh pr merge <number> --squash
```

That is how 0.6.1 and 0.7.0 were cut — each of their pull requests carries the
bot's version commit and one `docs(i18n)` commit from a person, and the checks
ran off the second. When there is genuinely nothing to push, closing and
reopening the pull request does the same job; 0.6.0 was cut that way.

> [!IMPORTANT]
> Which is why the Chinese changelog goes in **before** the merge rather than
> after. `apps/docs/src/i18n/changelog.ts` carries each release's entries and a
> gate checks it, and it used to be fine to catch that later — the ruleset ended
> that, because later now means the post-merge `main` run, and that run is the
> publish. The translation is no longer only good manners; it is the event that
> makes the pull request mergeable at all.

> [!WARNING]
> **Not `--admin`.** An earlier version of this file recommended
> `gh pr merge --squash --admin <number>` and called it the escape hatch this
> step depends on. It is not one: `guard-git.py` in the misoto22 dev plugin
> refuses `gh pr merge --admin` unconditionally, with no exception for this
> pull request — so anyone following that advice, and every agent that reads
> this file, hits a hard stop and starts hunting for a way around a guard. The
> bypass has never actually been used to cut a release.

None of this is a design. The step exists only because of which token opens the
pull request, and it disappears entirely if the changesets action is given a
GitHub App installation token or a PAT instead — a version pull request opened
by either carries its own checks, and the translation goes back to being a
courtesy rather than a key. **That is Henry's call rather than part of this
process**: it means creating a credential, and by the machine's own rule a
credential is created by a person and lives in 1Password, never generated or
held by an agent.

## What protects `main`

A ruleset named `main` (repository → Settings → Rules), rather than the older
branch-protection screen:

| Rule | Why |
|---|---|
| Pull request required, squash only, zero approvals | A solo repository gains nothing from self-approval, but everything from the changes arriving as a reviewable unit with CI attached. |
| `verify / verify`, `browser / browser`, `changeset` must pass | The two gates that read the tree, plus the one that reads the pull request's manners. |
| Branch must be up to date before merging | See below — this is the load-bearing one. |
| No force-push, no deletion | `main` is what the registry and the site are cut from. |
| Repository admin may bypass | Present, and deliberately unused — see the Version Packages note above. `--admin` is refused by a hook, and reopening the pull request makes its checks run instead. |

**Up-to-date is the one that earns its keep with parallel work.** Two branches
can each be green against the `main` of an hour ago and still be broken
together — one renames a token, the other starts using it, and neither pull
request ever saw the other. Requiring the branch to be current forces the
second one to rebase onto the first and re-run the suite against the tree that
will actually exist. The cost is a rebase per collision; the alternative is
discovering the collision on `main`, after publish.

> [!NOTE]
> A **merge queue** is the automated form of that rule — it builds the combined
> tree and tests it for you, with no rebasing by hand. It is not available here:
> merge queues require an organization-owned repository, and this one is owned
> by a personal account, so the API rejects the rule outright. If the repository
> ever moves to an organization, replace the up-to-date requirement with a merge
> queue and add a `merge_group:` trigger to `pr.yml` — without that trigger the
> required checks never report and the queue stalls until it times out.

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
