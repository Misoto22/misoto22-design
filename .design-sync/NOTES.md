# design-sync notes — @misoto22/design

Repo-specific gotchas for future syncs.

## Build
- The package builds with `pnpm build` = `tsup` (JS+dts) then Tailwind CLI (CSS). The DS entry is `./dist/index.js`.
- tsup uses **`bundle: false`** (+ `esbuild-fix-imports-plugin`) on purpose: bundling/splitting strips `'use client'` directives, which breaks RSC consumers. Don't switch to bundled output.
- `tsconfig.json` needs `"ignoreDeprecations": "6.0"` (TS 6.0 + tsup dts trips on `baseUrl`).
- `pnpm-workspace.yaml` `allowBuilds` must list esbuild / @tailwindcss/oxide / @parcel/watcher or installs skip native build scripts.

## Fonts
- Brand fonts (Geist, Cormorant Garamond, JetBrains Mono) are self-hosted: woff2 copied from `@fontsource/*` into `src/styles/fonts/`, declared in `src/styles/fonts.css` under the EXACT family names the tokens fall back to. Wired into the design-sync bundle via `cfg.extraFonts`.
- NOTE: `fonts.css` is shipped ONLY into the design-sync bundle (extraFonts), NOT `@import`ed by the package's app-facing `dist/styles.css`. Apps (misoto22-site/admin) load these via `next/font` and set `--font-geist`/`--font-cormorant`/`--font-jetbrains-mono`, so they never hit the fallback. A standalone non-next/font consumer who wants the brand fonts must import `fonts.css` themselves.

## Render / previews
- Playwright pinned to **1.59.1** in `.ds-sync` to match the already-cached chromium build **1217** (`~/Library/Caches/ms-playwright`) — avoids a ~100MB download. 1.60.x wants build 1223 (not cached).
- **Toaster** ships as a FLOOR CARD on purpose: sonner renders nothing until a `toast()` call, so it can't render statically. Authorable later only with a mount-time toast + capture-timing hack.
- **FloatingIconButton** is `position: fixed`; its preview frames it in a `transform: translateZ(0)` box so the fixed button anchors inside the card (a transform establishes a containing block for fixed descendants). Without that the card is blank.
- Overlay/full-page components use `cfg.overrides.<Name>.cardMode` + `viewport` so their open/large state renders inside the card: ErrorState (column), Dialog, DropdownMenu, AppShell, FloatingIconButton (single + sized viewport).
- 15 compound sub-parts (CardHeader/Body/Footer/Title, Dialog*/DropdownMenu*/Tabs* parts) are floor cards — used via their parent's composition, which IS authored. Authorable on any re-sync.

## Known render warns
- None as of the first sync (render check clean: 0 bad/blank/thin).

## Re-sync risks
- **Token drift**: `src/styles/tokens.css` + `tokens/brand.ts` are ported from `misoto22-site/src/app/globals.css` (the runtime SSOT). If the site's theme changes, re-port — there is no automated link.
- **Floor-card backlog**: Toaster + the 15 sub-parts are the standing offer for incremental preview authoring.
- **Playwright/chromium**: the 1.59.1↔build-1217 pairing depends on the local browser cache; a cache cleanup needs re-resolving the version (see Render section).
- **Fonts**: only the latin subset + a few weights are shipped (Geist 400/500/600, Cormorant 300–600, JetBrains Mono 400/500). Wider coverage needs more woff2 in `src/styles/fonts/` + `fonts.css` rules.
