"use client";

import { Button } from "@misoto22/design";
import { DEFAULTS, type Axis } from "./ThemeProvider";

/** The axes that make a LOOK — `chartPalette` changes what a chart is painted with. */
export const LOOK_AXES: Axis[] = [
  "surface",
  "radius",
  "rules",
  "type",
  "motion",
  "density",
];

/**
 * Every look axis written out, with one of them overridden.
 *
 * ALL of them, not just the one being demonstrated. An unset axis is not "the
 * default" — it is whatever the ancestor said, and this page's own ancestor is
 * a document carrying whatever theme the reader applied to the site. Writing
 * only the difference is how five specimens on one page all came out in the
 * reader's theme and the page stopped being able to make its own argument.
 */
export function isolate(axis: Axis, value: string): Record<string, string> {
  return Object.fromEntries(
    LOOK_AXES.map((each) => [
      `data-${each}`,
      each === axis ? value : DEFAULTS[each],
    ]),
  );
}

/**
 * One value of one axis, drawn on a piece of furniture small enough to line up.
 *
 * The page could not previously answer "what does `rules: firm` do?". It showed
 * eight PRESETS — bundles differing in five places at once — and then named the
 * axes in a list, which tells a reader that a dial exists without showing them
 * a single turn of it. This is that turn: the same object nineteen times, one
 * attribute different each time, so the difference between two chips is the
 * whole of what the axis means.
 *
 * The object has to carry every axis at once or the strip would need a
 * different specimen per row: a heading in the heading face (`type`), a
 * hairline (`rules`), a control with a corner and a height (`radius`,
 * `density`), a ground (`surface`), and a floating chip drawn from the panel
 * tokens — which is the only place `glass` is visible at all, since that
 * surface is a statement about what happens BEHIND things that float.
 *
 * `motion` is the one that cannot be seen standing still, so the button moves
 * on hover and the row says to try it.
 */
export function AxisChip({
  axis,
  value,
  label,
}: {
  axis: Axis;
  value: string;
  label: string;
}) {
  return (
    <figure className="m-0 flex w-[9.5rem] shrink-0 flex-col gap-1.5">
      <div
        {...isolate(axis, value)}
        // Inert: it is made of real controls, so calling it a picture would
        // lie — and nineteen live buttons in a strip would put nineteen tab
        // stops between the reader and the next heading.
        inert
        // Two grounds, not one. `--paper` moves very little between surfaces —
        // four near-whites in a row read as four identical chips — while
        // `--stone` moves enough to see. A chip showing both says what the axis
        // does; a chip showing one says that something imperceptible happened.
        // It also puts the corner on screen twice, at the frame and at the card.
        className="rounded-(--radius-frame) border border-(--rule-2) bg-(--stone) p-2"
      >
        <div className="rounded-(--radius) border border-(--rule) bg-(--paper) p-2.5">
          <div className="flex items-baseline justify-between gap-2 pb-1.5">
            <span className="font-heading text-[13px] leading-none text-(--ink)">
              Deploys
            </span>
            <span className="mono-meta text-(--ink-3-aa)">04</span>
          </div>
          <div className="border-t border-(--rule)" />
          <p className="m-0 py-1.5 text-[11px] leading-snug text-(--ink-2)">
            Two of four passed.
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="transition-transform duration-(--duration-base) ease-(--ease-out-expo) group-hover/rack:translate-x-1.5 rtl:group-hover/rack:-translate-x-1.5"
            >
              Run
            </Button>
            <span className="rounded-(--radius-pill) border border-(--panel-border) bg-(--panel-bg) px-2 py-0.5 mono-meta text-(--ink-2) panel-blur">
              4m
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mono-meta text-(--ink-3-aa)">{label}</figcaption>
    </figure>
  );
}
