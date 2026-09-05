# misoto22 design

The **White Reset** — a pure-white monochrome design system for software, writing
and photography. The ground is paper-white, the mark is near-black, and the only
chroma left in the file is status, which is bound to state and never to brand.

📐 **[ui.misoto22.com](https://ui.misoto22.com)** — the component gallery, the
foundations, and the principles.

## Layout

A pnpm monorepo, two workspaces:

| Path | What it is |
|---|---|
| `packages/design` | `@misoto22/design` — the tokens and 36 React primitives |
| `apps/docs` | the documentation site, statically exported to Cloudflare Pages |

## Install

```bash
pnpm add @misoto22/design
```

```tsx
// Once, at your app root — the compiled stylesheet carries the tokens, the
// utilities the components use, and the vendored faces.
import '@misoto22/design/styles.css'

import { Button, Field, Input } from '@misoto22/design'
```

An app that already compiles Tailwind takes the portable layers instead and
skips a second copy of the utilities:

```css
@import 'tailwindcss';
@import '@misoto22/design/tokens.css';    /* primitives  */
@import '@misoto22/design/semantic.css';  /* roles       */
@import '@misoto22/design/keyframes.css'; /* motion      */

@source '../node_modules/@misoto22/design/dist';

@custom-variant dark (&:is([data-mode='dark'] *));
```

The mode is an attribute on `<html>` — `data-mode="dark"` — so it can be written
by an inline script before the first paint and never flashes the wrong theme.

## What is inside

- **Tokens** (`styles/tokens.css`) — the White Reset as portable CSS custom
  properties: two themes, one heading ladder, four radii, three rule weights,
  and a status scale that is the system's only chroma.
- **Semantics** (`styles/semantic.css`) — what each primitive is *for*. A
  component reads only from here, which is why dark mode is a value swap rather
  than a second palette.
- **Brand** (`tokens/brand.ts`) — hex mirrors for surfaces that cannot read a
  custom property (OpenGraph cards, a web manifest, a build script). A test
  parses the CSS and fails if the two drift.
- **Components** — 36 primitives styled with Tailwind's arbitrary-property
  syntax against the tokens. Radix underneath wherever behaviour is involved;
  no router, no state library, no CSS-in-JS.

## Develop

```bash
pnpm install
pnpm dev            # the docs site on http://localhost:4023
pnpm build          # the package, then the site
pnpm lint && pnpm typecheck && pnpm test
```

The docs site reads the package from `packages/design/dist`, so run
`pnpm build:design` after changing a component before `pnpm dev` picks it up.
Its Tailwind compiles from the package's *source*, so styling changes are live.

### Nothing about the library is written twice

The site's prop tables are parsed out of the package's TypeScript at build time;
its token tables are parsed out of the CSS; its swatches are painted with the
tokens themselves. Every example is a real `.tsx` module that the page renders
*and* that the code block beneath it was read from — so a preview cannot drift
from the code printed under it.

The hand-written part is `apps/docs/src/content/registry.ts`: grouping, the
one-line summaries, and the accessibility promises. A test fails the build if it
falls out of step with what the package actually ships.

## Deploy

Pushing to `main` runs lint, typecheck, tests and both builds, then publishes the
static export to the `misoto22-ui` Cloudflare Pages project and smoke-tests the
live routes. `ui.misoto22.com` is a proxied CNAME onto that project.

## Sync to claude.ai/design

This package is the source for the **misoto22** Claude Design project — run the
`/design-sync` skill from the repository root to push verified components up so
the design agent builds on-brand. See `.design-sync/NOTES.md`.
