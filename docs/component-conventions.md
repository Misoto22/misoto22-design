# misoto22-design — component conventions

The single styling + API contract every primitive in this package follows. New
components match these exactly so the system reads as one hand.

## Tech

- React 19 function components, TypeScript strict. Ref is a plain prop in React
  19 — no `forwardRef`.
- Styling: **Tailwind v4 arbitrary-property syntax** against CSS custom-property
  tokens (`bg-(--accent)`, `text-(--foreground)`, `rounded-(--radius)`). Never
  hardcode colors — tokens auto-swap under `.dark`.
- **Framework-agnostic**: no next-intl, no `next/image`, no app imports. A
  component that navigates renders a plain `<a>`; the app wraps with its router.
- Interactive components (state, portals, Radix) start with `'use client'`.
- Compose classes with `clsx`. Use **full literal class strings** — never
  interpolate a token name into a class — so Tailwind's scanner sees them.

## Tokens (the only color/shape vocabulary)

Surfaces: `--background`, `--background-elevated`, `--card-background`,
`--code-background`, `--nav-background`.
Text: `--foreground`, `--foreground-muted`, `--secondary-text`, `--on-dark`.
Lines: `--border-color`, `--border-subtle`.
Accent: `--accent`, `--accent-hover`, `--accent-muted` (12% wash for fills),
`--accent-wash` (4% tint), `--accent-foreground` (text/icon on an accent fill).
Status: `--success`, `--danger`, `--warning`, `--info`.
Spacing: `--space-1`…`--space-10` (4px base). Type scale is Tailwind's built-in
`--text-*` / `--leading-*`; custom label tracking is `--tracking-label`.
Focus / state: `--ring`, `--ring-offset`, `--overlay` (modal scrim),
`--disabled-opacity`. Z-index: `--z-dropdown|sticky|overlay|modal|toast`.

Radius: `--radius-sm` 8px (chips/keycaps) · `--radius` 12px (controls:
buttons/inputs/selects) · `--radius-lg` 18px (surfaces: cards/dialogs/panels) ·
`--radius-pill` (pills/dots).
Elevation: `--shadow-sm`, `--shadow`, `--shadow-lg`.
Motion: `--ease-out-expo`, `--duration-fast|base|slow`. Fonts: `font-sans`,
`font-heading` (Cormorant display), `font-mono`.

## Idioms

- Hover (color only): `transition-colors duration-300`.
- Controls (lift/shadow): `transition-all duration-150 ease-(--ease-out-expo)`.
- Mono labels: the `eyebrow` utility (uppercase kicker) and `mono-meta` (inline
  metadata); pair `eyebrow` with a `text-*` color.
- Chips: `font-mono text-xs tracking-wide … rounded-(--radius-sm)`.
- Focus: a global `:focus-visible` outline (`--ring`) exists; custom controls
  restore it with `focus-visible:outline-2 focus-visible:outline-(--ring) outline-offset-2`.
- Disabled: `disabled:opacity-50 disabled:pointer-events-none`.

## File + export shape

```
src/components/<Name>/<Name>.tsx     // 'use client' if interactive
```

```ts
export interface <Name>Props { … ; className?: string }
export function <Name>(props: <Name>Props) { … }
export default <Name>
```

Every component is re-exported (named) from `src/index.ts`. Each gets a usage
example in its own doc comment. `className` is always accepted and merged last.

## Reference: Button (the canonical control)

```tsx
const BASE =
  'inline-flex items-center gap-2.5 px-4 py-[11px] rounded-(--radius) text-sm transition-all duration-150 ease-(--ease-out-expo) hover:shadow-(--shadow) hover:-translate-y-px disabled:opacity-50 disabled:pointer-events-none'
const VARIANT = {
  primary: 'bg-(--foreground) text-(--background) border border-(--foreground) hover:bg-(--accent) hover:border-(--accent) hover:text-(--accent-foreground)',
  secondary: 'border border-(--border-color) text-(--foreground) hover:border-(--accent) hover:text-(--accent)',
}
```

Interactive primitives wrap **Radix UI** (Dialog, DropdownMenu, Tabs, Switch,
Checkbox), toast uses **sonner**, icons use **lucide-react** — all styled with
the tokens above, never Radix's defaults.
