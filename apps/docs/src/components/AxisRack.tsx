'use client'

import type { Locale } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import { AxisChip, LOOK_AXES } from './AxisChip'
import { AXES, type Axis } from './ThemeProvider'

/** `chartPalette` as it is written in the DOM. */
export const attribute = (axis: Axis) =>
  `data-${axis.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`

/**
 * The six dials, one row each, every value drawn.
 *
 * It comes BEFORE the presets on purpose. A preset is a combination, and a page
 * that opens with eight combinations is asking a reader to learn the vocabulary
 * by diffing bundles that differ in five places at once. The rack is the
 * vocabulary: one row per axis, one chip per value, the same object underneath
 * every chip, so the difference between two chips is the whole of what the axis
 * decides — and nothing else.
 *
 * `group/rack` on the row rather than on each chip: hovering anywhere in the
 * motion row moves every button in it at once, which is what makes three
 * durations comparable. Hovering them one at a time is three separate memories
 * of a thing that is only meaningful as a difference.
 */
export function AxisRack({ locale }: { locale: Locale }) {
  const t = getMessages(locale)

  return (
    <div className="flex flex-col divide-y divide-(--rule) border-y border-(--rule)">
      {LOOK_AXES.map((axis) => (
        <section key={axis} className="group/rack flex flex-col gap-3 py-6">
          <div className="flex flex-col gap-1">
            <h3 className="m-0 flex items-baseline gap-2.5 font-heading text-[length:var(--fs-item)] font-normal text-(--ink)">
              {t.themes.axes[axis]}
              <code className="mono-meta font-normal text-(--ink-3-aa)">{attribute(axis)}</code>
            </h3>
            <p className="m-0 max-w-(--measure-record) text-[13px] leading-relaxed text-(--ink-3-aa)">
              {t.themes.does[axis]}
            </p>
          </div>
          {/* Scrolls rather than wraps: four chips at 9.5rem is wider than the
              column on a phone, and a strip that wraps to two lines stops
              reading as one comparison. */}
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scroll-slim">
            {AXES[axis].map((value) => (
              <AxisChip
                key={value}
                axis={axis}
                value={value}
                label={t.themes.values[value] ?? value}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
