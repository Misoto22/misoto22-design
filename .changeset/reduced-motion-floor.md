---
'@misoto22/design': patch
---

`prefers-reduced-motion` is now honoured by everything, instead of by whatever
remembered to ask.

The rule in `keyframes.css` was an opt-in: a surface that animated carried
`data-m22-animated`, and that attribute was what got cancelled. Four
independent documentation passes each found a different piece of the same
failure.

- Half the selector matched nothing at all. `[class*='m22-anim']` was written
  for a class-name scheme the package never adopted — Tailwind emits
  `animate-[m22-collapsible-down_…]`, which contains no `m22-anim` — so that
  branch had never once fired, and nothing anywhere said so.
- The rule only ever set `animation`. Anything animated by `transition`
  escaped it entirely, which is most things that slide: `SheetContent` and
  `AppShell`'s drawer both move on `transition-transform`.
- Two siblings disagreed. `CollapsibleContent` carried
  `motion-reduce:animate-none`; `CollapsibleSection` — the composed one its own
  JSDoc calls what most call sites want — carried nothing, and neither did
  `Accordion`'s panel.

Four authors forgetting the same thing in four components is a fact about the
mechanism, not about the authors. So the guarantee is no longer the marker: the
block now carries the universal reduced-motion reset, capping both
`animation-duration` and `transition-duration`. A component added tomorrow is
covered before its author has read the file.

This is a `*` rule in a stylesheet consumers import, and that is intended. It
fires only when the reader has asked their operating system for less motion,
and a caller with motion they consider essential can still keep it — an
`!important` on `*` is the weakest one there is, so any class-level
`animation-duration: … !important` outranks it. What changes is which way round
the default falls: keeping motion under this preference is now something you
write down, rather than something you get by forgetting.

Durations collapse to `0.01ms` rather than to `none`, because JavaScript
listens — Radix unmounts a closing panel on `animationend`, and consumer code
may await `transitionend`. A near-zero duration still fires both.

`data-m22-animated` stays and is now deliberately redundant: it is a component
asserting its motion is decorative, and it goes further than the floor by
removing the animation outright. `Accordion`'s panel and both `Collapsible`
panels now carry it, so the two siblings finally agree.
`src/__tests__/reduced-motion.test.tsx` fails if the block stops being
universal, stops naming transitions, grows a selector that matches nothing, or
if a component reaches for a system keyframe without making the assertion.
