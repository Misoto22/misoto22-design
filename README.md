# misoto22 design

The **White Reset** — a pure-white monochrome design system for software, writing
and photography. The ground is paper-white, the mark is near-black, and the only
chroma left in the file is status, which is bound to state and never to brand.

📐 **[ui.misoto22.com](https://ui.misoto22.com)** — the component gallery, the
foundations, the principles and the templates. Also in Chinese, at
[/zh](https://ui.misoto22.com/zh/).

## Layout

A pnpm monorepo, two workspaces:

| Path | What it is |
|---|---|
| `packages/design` | `@misoto22/design` — the tokens and 47 React primitives |
| `apps/docs` | the documentation site, statically exported to Cloudflare Pages |

## Install

Published to GitHub Packages under the `@misoto22` scope. Point the scope at
that registry in the consuming project's `.npmrc`:

```
@misoto22:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

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

## Two axes, both attributes

```html
<html data-mode="dark">          <!-- light | dark  -->
  <div data-density="compact">   <!-- comfortable | compact -->
```

The mode is an attribute rather than a class so it can be written by an inline
script before the first paint and never flashes the wrong theme. Density is the
only other axis: set it on any container and every control below tightens —
44px at the default (the pointer target WCAG 2.5.5 asks for), 36px compact
(which still clears 2.5.8 and no longer meets 2.5.5, so it is for a dense
desktop tool driven by a mouse).

Every component is written in logical properties, so `dir="rtl"` mirrors the
whole system with no stylesheet of its own. A test fails the build on a physical
one.

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
- **Machine-readable tokens** (`@misoto22/design/tokens`) — every token with its
  light value, dark value, category and the comment that explains it, as JSON
  and as a typed module. For a Figma sync, a native app, a script: anything that
  needs the values and cannot read a stylesheet.
- **Components** — 47 primitives styled with Tailwind's arbitrary-property
  syntax against the tokens. Radix underneath wherever behaviour is involved,
  cmdk for the combobox pattern, react-day-picker for the calendar, lucide for
  icons, sonner for toasts, and clsx + tailwind-merge so a caller's `className`
  actually wins. No router, no state library, no CSS-in-JS.

## Develop

```bash
pnpm install
pnpm dev            # the docs site on http://localhost:4023
pnpm build          # the package, then the site
pnpm lint && pnpm typecheck && pnpm test
pnpm --filter @misoto22/design-docs test:e2e   # axe + keyboard, in a browser
pnpm --filter @misoto22/design check:size      # size and tree-shaking budget
```

### How it is tested

| Suite | Runs in | Answers |
|---|---|---|
| unit | jsdom | roles, names, `aria-*`, labelling — every component, from one fixture |
| server-render | node, no DOM | does anything touch `window` at import time |
| keyboard | jsdom | the interactions axe cannot see |
| browser | Chromium | colour contrast, page-level rules, RTL, density, the live editor |
| size | esbuild | did it grow; does tree shaking still work |

`coverage.test.ts` fails when a component has no fixture, so "every component is
checked" is a property the build enforces rather than a claim to audit.

The docs site reads the package from `packages/design/dist`, so run
`pnpm build:design` after changing a component before `pnpm dev` picks it up.
Its Tailwind compiles from the package's *source*, so styling changes are live.

### Two languages

English has no prefix and Chinese sits under `/zh`, the same shape
misoto22.com uses — and the same reason: the English URLs were linked before
Chinese existed, and a scheme that moves them all to `/en/…` breaks them for
nothing.

The **editorial** layer is translated: group names, component summaries, the
"when to reach for it" note, the foundations prose, the principles, the
templates. The **API reference** is not — prop descriptions, notes and type
signatures are parsed from the package's own source, and translating them would
be a second copy that drifts on the first doc-comment edit. The Chinese pages
say so in a line rather than leaving a reader to wonder, and anything missing
falls back to English rather than rendering blank.

### Nothing about the library is written twice

The site's prop tables are parsed out of the package's TypeScript at build time;
its token tables are parsed out of the CSS; its swatches are painted with the
tokens themselves. Every example is a real `.tsx` module that the page renders
*and* that the code block beneath it was read from — so a preview cannot drift
from the code printed under it.

The hand-written part is `apps/docs/src/content/registry.ts`: grouping, the
one-line summaries, and the accessibility promises. A test fails the build if it
falls out of step with what the package actually ships.

## Release

Every consumer-visible change ships with a changeset; `main` then opens a
version pull request, and merging it publishes. See [docs/releasing.md](docs/releasing.md).

```bash
pnpm changeset
```

## Deploy

Pushing to `main` runs lint, typecheck, tests and both builds, then publishes the
static export to the `misoto22-ui` Cloudflare Pages project and smoke-tests the
live routes. `ui.misoto22.com` is a proxied CNAME onto that project.

## Sync to claude.ai/design

This package is the source for the **misoto22** Claude Design project — run the
`/design-sync` skill from the repository root to push verified components up so
the design agent builds on-brand. See `.design-sync/NOTES.md`.
