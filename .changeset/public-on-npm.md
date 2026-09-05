---
'@misoto22/design': minor
---

Published to npmjs, publicly, instead of to GitHub Packages.

The repository has been public and MIT-licensed for a while, but the package it
ships was restricted on a registry that needs a token to read — so the install
instructions were a gate rather than a command. It now publishes to the default
registry with `access: public`, which every client reads without an `.npmrc`.

Two consequences for anything already installing it. The scope no longer needs
pointing anywhere, so the `@misoto22:registry` and `_authToken` lines can come
out of the consumer's `.npmrc`; and the versions published to GitHub Packages
stay where they are — nothing was copied across, and `0.3.0` is the first
version on npmjs.

The manifest's `description` also changes. It, the repository's About field and
the README's opening line each carried a different sentence, so two of them were
always the stale one; they now say the same thing, and it carries no component
count, because a number in a manifest has nothing to check it and had already
drifted by two.
