# @misoto22/design

The misoto22 design system — design tokens, brand colors, and React primitives
shared by [misoto22-site](../misoto22-site) (public site + backend) and
misoto22-admin (CMS console).

> 🚧 Early development — extracted from `misoto22-site`'s `globals.css` token
> system and `ui/` primitives, with form-oriented primitives authored fresh for
> the admin console.

## What's inside

- **Tokens** (`styles/tokens.css`) — the warm-cream / ink theme as portable CSS
  custom properties (light + dark, WCAG AAA), radius/shadow/motion scales, fonts.
- **Brand** (`tokens/brand.ts`) — hex SSOT for surfaces that can't read CSS vars.
- **Components** — React primitives styled with Tailwind v4 arbitrary-property
  syntax against the tokens (`Button`, … more to come).

## Usage

```ts
import { Button } from '@misoto22/design'
import '@misoto22/design/styles.css' // compiled tokens + utilities
```

A Tailwind app that already imports Tailwind can pull only the token layer:

```ts
import '@misoto22/design/tokens.css'
```

## Develop

```bash
pnpm install
pnpm build      # tsup (JS + d.ts) → dist, then Tailwind → dist/styles.css
pnpm dev        # watch JS
pnpm typecheck
```

## Sync to claude.ai/design

This package is the source for the **misoto22** Claude Design project — run the
`/design-sync` skill from this directory to push verified components up so the
design agent builds on-brand.
