---
title: One factor moves them all
subtitle: What went wrong when the radius scale was four independent numbers
date: 2026-09-06
author: Henry Chen
role: Design systems
category: Foundations
tags: [Radius, Tokens, Theming]
summary: A corner nested inside another corner is only ever right while the two stay in proportion. Four hand-typed numbers cannot promise that, and here is what it cost.
---

The radius scale used to be four numbers typed by hand, and a theme that wanted
square corners typed four more. It looked fine at the setting somebody checked
and was wrong at every other one. This is the arithmetic of why, and what
replaced it.

## The nesting law

Two rounded edges separated by a gap of $p$ are **concentric** only when the
inner radius is the outer minus the gap:

$$
r_{\text{inner}} = \max\left(0,\; r_{\text{outer}} - p\right)
$$

Anything else pinches at the corner. The gap between the two curves is $p$ along
the straight edges and narrows as it turns, and the eye reads that narrowing
long before anyone can name it. A panel inset by 16px inside a frame rounded to
$r$ therefore wants $r - 16$, and a frame wrapped 16px outside a panel rounded
to $r$ wants $r + 16$.

> Depth is a hairline and a change of ground, never a blur.
>
> <cite>The White Reset, law 2</cite>

### Why four numbers could not hold it

A theme that re-types every step can put the steps out of proportion with each
other — and once they are out of proportion, no single inset is right for two
different settings at the same time. Here is what the old `round` theme did:

| Step            | Default | `round` | Ratio |
| --------------- | ------: | ------: | ----: |
| `--radius-sm`   |     6px |    10px |  1.67 |
| `--radius`      |     8px |    14px |  1.75 |
| `--radius-lg`   |    14px |    22px |  1.57 |
| `--radius-pill` |   999px |   999px |  1.00 |

Three different ratios and an exemption. The pill was exempt on the grounds
that a pill is a shape rather than a corner — which is true, and which is also
how a "square corners" theme shipped with every button still a capsule.[^pill]

[^pill]: A true *circle* is different again, and stays a circle: an avatar, a
    status dot, a spinner, a radio button. Those are geometry, not corners, and
    a radio that stopped being round would stop being distinguishable from a
    checkbox.

## What replaced it

One factor, and the ladder derived from it:

```css
:root,
[data-radius] {
  --radius-factor: 1;
  --radius-xs: calc(4px * var(--radius-factor));
  --radius-sm: calc(6px * var(--radius-factor));
  --radius: calc(8px * var(--radius-factor));
  --radius-lg: calc(12px * var(--radius-factor));
  --radius-pill: calc(999px * var(--radius-factor));
}
```

A theme now sets one number. `sharp` sets it to `0` and everything squares off
together, the pill included; `round` sets it to `2` and every step doubles, so
the proportions hold.

The numbers themselves are not invented either, and that is deliberate: 8px for
a control and 12px for a panel is where Tailwind's scale, shadcn's `--radius`
± 2 and ± 4, Radix Themes' steps 3 and 4, and Material's `xs`/`sm`/`md` all
land within a pixel of each other. A design system is allowed one opinion per
decision, and this was not the decision worth spending it on.

Both directions of the nesting law are named, so a surface never has to guess:

1. `--radius-row` subtracts — a row inside a panel padded by 6px.
2. `--radius-frame` adds — a frame sitting 16px outside a `--radius-lg` panel.

- [x] Ladder derived from one factor
- [x] Both nesting directions named
- [ ] A visual regression test that measures the corners

### Where the tokens are read

```diagram
{
  "caption": "One number, and everything that reads it.",
  "direction": "column",
  "edges": [{ "from": "factor", "to": "ladder", "label": "calc()" }],
  "nodes": [
    { "id": "factor", "label": "--radius-factor", "note": "the one number a theme sets", "accent": true },
    {
      "id": "ladder",
      "label": "The ladder",
      "note": "tokens.css",
      "children": [
        { "label": "--radius-xs", "note": "marks" },
        { "label": "--radius-sm", "note": "chips" },
        { "label": "--radius", "note": "controls" },
        { "label": "--radius-lg", "note": "panels" },
        { "label": "--radius-pill", "note": "capsules" }
      ]
    },
    {
      "label": "Derived",
      "note": "the nesting law",
      "children": [
        { "label": "--radius-row", "note": "outer − 6px", "footnote": "menu rows" },
        { "label": "--radius-frame", "note": "outer + 16px", "footnote": "preview frames" }
      ]
    }
  ]
}
```

### How a corner gets its number

```steps
{
  "label": "From one factor to a drawn corner",
  "steps": [
    { "title": "A theme sets the factor", "note": "data-radius=\"sharp\" · --radius-factor: 0" },
    { "title": "The ladder recomputes", "note": "calc(<n>px * factor) — five steps, one ratio" },
    { "title": "The nesting law derives two more", "note": "--radius-row subtracts · --radius-frame adds" },
    { "title": "A component reads a step", "note": "rounded-(--radius-lg) — never a literal" },
    { "title": "The corner is drawn", "note": "concentric with whatever contains it", "current": true }
  ]
}
```

The declaration sits on `:root` **and** on `[data-radius]`, and that is
load-bearing rather than tidy. A custom property substitutes `var()` where it is
*declared*, so a ladder written only on the root bakes in the root's factor and
a themed subtree deeper in the page never reaches it — which is exactly the case
the themes page exercises, five radii on five wrappers of one document.

---

## The cost of getting it wrong

Let $n$ be the number of nested surfaces on a screen and $k$ the number of
radius settings a theme offers. Hand-typed steps make the number of
arrangements somebody has to check $n \times k$; a derived ladder makes it $n$,
because the proportions are a property of the ladder rather than of the
setting. On this system that was $12 \times 3$ against $12$ — and the
twenty-four nobody checked are where every mismatched corner lived.

Press <kbd>⌘</kbd> <kbd>K</kbd> and type `radius` to see the tokens themselves.
