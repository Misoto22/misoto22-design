---
root: true
targets: ["agentsmd"]
description: Project-owned rules for the misoto22 design system
scope: project
---

# @misoto22/design

- **[DESIGN-ARCH-001] MUST — Keep primitives reusable.** Tokens and components may serve the public site and admin console but must not absorb either host's routes, data access, or business logic.
- **[DESIGN-TOKEN-001] MUST — Preserve token ownership.** Change the canonical CSS and TypeScript token sources, then rebuild exported CSS and package artifacts instead of editing `dist/`.
- **[DESIGN-API-001] MUST — Treat exports as consumer contracts.** Review public exports, CSS entry points, peer dependencies, and accessible behavior before changing a primitive.
- **[DESIGN-I18N-001] MUST — Ship both languages, or record the deferral.** A reader-facing string added to the documentation site carries its Chinese in the same change: site chrome in `apps/docs/src/i18n/messages.ts`, catalog and site prose in `apps/docs/src/i18n/zh.ts`. When the Chinese is genuinely deferred, add a pattern to `apps/docs/src/i18n/deferred.ts` with an owner, a date and a reason. Never widen a type, delete a key, or relax a gate to make the build pass.
- **[DESIGN-TEST-001] MUST — Run package gates.** Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` for affected code and output.
- **[DESIGN-SYNC-001] MUST — Keep Claude Design sync interactive.** Use the documented skill only after local verification; do not move credentials or interactive approval into CI.
