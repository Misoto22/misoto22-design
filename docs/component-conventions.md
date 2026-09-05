# Component conventions

What every component in `packages/design/src/components` is expected to do, and
why. These are the rules a review checks against; the visual rules live on
[ui.misoto22.com/principles](https://ui.misoto22.com/principles/).

## Shape

- **One directory per component**, named for the component: `Button/Button.tsx`,
  and its test beside it as `Button/Button.test.tsx`. The documentation
  generator keys off that directory name, so a mismatch is caught by
  `apps/docs/src/content/__tests__/registry.test.ts` rather than by a blank page.
- **Named export plus a default.** The named export is the contract; the default
  exists so a call site can import either way.
- **`'use client'` only when the component owns state, an effect, or a browser
  API.** Buttons, cards, badges and tables stay server-renderable; anything
  wrapping Radix does not.

## Styling

- **Read semantic tokens, never primitives.** `text-(--ink)` and
  `border-(--rule)`, not a hex and not `--paper` where `--background` is meant.
  Dark mode is a value swap on those names, so a component that reads the right
  layer inherits it for free.
- **Merge the caller's `className` last, through `cn`.** `clsx` alone emits both
  sides of a conflict and lets the stylesheet's own order decide the winner,
  which means an override works or does not for reasons neither side can see.
- **No blurred shadow.** `--shadow*` resolves to `none` on purpose. Depth is a
  hairline, a change of ground, or `--lift` — a hard ink offset with no blur.
- **Full literal class strings for variants.** Tailwind only generates what it
  can see verbatim, so a side or a size is looked up in a `Record`, never
  interpolated into a template string.
- **Durations and easing come from tokens.** `duration-(--duration-fast)`, not
  `duration-150`.
- **Logical properties, always.** `ps-`/`pe-`, `start-`/`end-`, `border-s`/
  `border-e`, `text-start`. `direction.test.ts` fails the build on a physical
  one. Anything that slides along the inline axis (`translate-x-`) needs an
  explicit `rtl:` counterpart, because Tailwind has no logical translate.
- **Control sizes come from the density tokens.** `min-h-(--control-h-md)`, not
  `min-h-11`, and the vertical padding too — a control whose padding alone
  exceeds the compact height never shrinks, because `min-height` is a floor.

## Behaviour

- **Reach for Radix before re-implementing a pattern.** Focus traps, roving
  tabindex, typeahead and portal placement are where a hand-rolled component
  quietly becomes unusable with a keyboard.
- **Frameworks stay out.** No router import. A component that navigates takes
  `asChild` so the call site supplies its own `Link`.
- **A prop that is required for accessibility is required in the type.**
  `Table.caption`, `Progress.label`, `Avatar.alt`, `FloatingIconButton.label`.
  If it can be forgotten, it will be.

## Accessibility

- **Decoration is `aria-hidden`.** A status dot beside the word "Available"
  repeats it; an arrow inside a link is read as "north east arrow".
- **Colour is never the only carrier.** Every status tone is doubled by an icon,
  by the words, or by both.
- **44px is the pointer-target floor** for anything a finger has to hit.
- **Motion is gated behind `motion-safe`**, and every animated element carries
  `data-m22-animated` so the one reduced-motion rule in `keyframes.css` can
  reach it.

## Documentation

A component's JSDoc IS its documentation — the site parses it. So:

- The description says what the component is FOR and, where there is a
  neighbour it could be confused with, which one to reach for.
- Every prop that is not self-evident carries its own doc comment; the site
  prints an em dash where one is missing.
- Defaults are written as destructuring defaults in the implementation, not as
  `@default` tags. The generator reads the implementation, so the two cannot
  disagree.
- At least one `@example`, and at least one live example under
  `apps/docs/src/examples/<Component>/NN-name.tsx`. The registry test fails a
  component that has none.

## Gates

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

New or changed behaviour needs a test that exercises the real boundary — see
`Field.test.tsx` for the shape: it asserts what a screen reader receives, not
which classes were emitted.
