'use client'

import { Button } from '@misoto22/design'
import { Check } from 'lucide-react'
import type { Locale } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import { fill } from '@/i18n/messages'
import { SectionHeading } from './PageIntro'
import { attribute, AxisRack } from './AxisRack'
import { LOOK_AXES } from './AxisChip'
import { AXES, DEFAULTS, PRESETS, useTheme, type Axis } from './ThemeProvider'
import { ThemeSpecimen } from './ThemeSpecimen'

/**
 * The themes page.
 *
 * Two sections, in this order, because the order is the argument.
 *
 * **The dials first.** The page used to open on eight preset cards and close on
 * a list naming the axes and their values in plain text — which tells a reader
 * that six dials exist without showing them a single turn of one. Anybody
 * wanting to know what `rules: firm` does had to diff two presets that differ
 * in five places. `AxisRack` is that missing half: one row per axis, one chip
 * per value, the same object under every chip.
 *
 * **The looks second**, now that the words mean something. Each preset is its
 * specimen edge to edge with a footer under it, rather than a specimen buried
 * between a heading row and a six-row list of axis values — five-sixths of
 * which was the default value, printed identically on all eight cards. What is
 * printed now is what this preset CHANGES, which is the fact the reader came
 * for and is different on every card.
 *
 * The attributes go on a wrapper rather than on the document, which is only
 * possible because nothing in `themes.css` is anchored to `:root`. That is the
 * argument made structurally: if a theme needed to own the document, eight of
 * them could not share a page.
 */
export function ThemeGallery({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const { apply, matching } = useTheme()

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <SectionHeading id="axes">{t.themes.axesTitle}</SectionHeading>
          <p className="m-0 max-w-(--w-reading) text-[13px] leading-relaxed text-(--ink-2)">
            {t.themes.axesLead}
          </p>
        </div>
        <AxisRack locale={locale} />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <SectionHeading id="looks">{t.themes.looksTitle}</SectionHeading>
          <p className="m-0 max-w-(--w-reading) text-[13px] leading-relaxed text-(--ink-2)">
            {fill(t.themes.looksLead, { count: PRESETS.length })}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {PRESETS.map((preset) => {
            const copy = t.themes.presets[preset.id]
            const active = matching?.id === preset.id
            // EVERY axis, including the ones this preset leaves at the default.
            // An unset axis is not "the default" inside a themed ancestor; it is
            // whatever the ancestor said — so writing only the differences meant
            // all eight specimens repainted in whichever theme the reader had
            // applied to the site.
            const axes = Object.fromEntries(
              LOOK_AXES.map((axis) => [`data-${axis}`, preset.values[axis] ?? DEFAULTS[axis]]),
            )
            // What it CHANGES, which is the half that differs between cards.
            // This is a caption, not markup: the attributes above are complete
            // whatever this says.
            const changes = LOOK_AXES.filter(
              (axis) => (preset.values[axis] ?? DEFAULTS[axis]) !== DEFAULTS[axis],
            )

            return (
              <article
                key={preset.id}
                aria-labelledby={`preset-${preset.id}`}
                className="flex flex-col overflow-hidden rounded-(--radius-frame) border border-(--rule-2)"
              >
                <div
                  {...axes}
                  data-accent={preset.values.accent}
                  // Inert, not role="img". The specimen is built from real
                  // controls, so calling it a picture would lie, and leaving
                  // eight copies of the same form in the tab order would put
                  // sixty stops between the reader and the next heading.
                  inert
                  className="border-b border-(--rule-2)"
                >
                  <ThemeSpecimen />
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3
                      id={`preset-${preset.id}`}
                      className="m-0 font-heading text-[length:var(--fs-item)] font-normal text-(--ink)"
                    >
                      {copy?.name ?? preset.name}
                    </h3>
                    <Button
                      size="sm"
                      variant={active ? 'ghost' : 'secondary'}
                      className="gap-1.5"
                      onClick={() => apply(preset)}
                      aria-pressed={active}
                    >
                      {active && <Check size={13} strokeWidth={1.5} aria-hidden />}
                      {active ? t.appearance.current : t.themes.apply}
                    </Button>
                  </div>
                  <p className="m-0 flex-1 text-[13px] leading-relaxed text-(--ink-3-aa)">
                    {copy?.note ?? preset.note}
                  </p>
                  {/* Only what it moves. All six, printed on every card, was
                      five-sixths the same sentence eight times. */}
                  <p className="m-0 mono-meta text-(--ink-3-aa)">
                    {changes.length === 0
                      ? t.themes.everyDefault
                      : changes
                          .map(
                            (axis) =>
                              `${t.themes.axes[axis]} ${t.themes.values[preset.values[axis]!] ?? preset.values[axis]}`,
                          )
                          .join(' · ')}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <SectionHeading id="chart-palette">{t.themes.axes.chartPalette}</SectionHeading>
          <p className="m-0 max-w-(--w-reading) text-[13px] leading-relaxed text-(--ink-2)">
            {t.themes.paletteLead}
          </p>
        </div>
        <PaletteRow locale={locale} />
      </section>
    </div>
  )
}

/**
 * The seventh axis, kept out of the rack and out of the presets.
 *
 * It is documented with the others and belongs with neither: a preset is a
 * page's LOOK, and this one changes nothing a page is made of — only what a
 * chart's series are painted with. Putting it in the rack would have implied a
 * turn of it changes the furniture above, which it does not.
 */
function PaletteRow({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const SERIES = ['--series-1', '--series-2', '--series-3', '--series-4', '--series-5']

  return (
    <div className="flex flex-wrap gap-6">
      {AXES.chartPalette.map((value) => (
        <figure
          key={value}
          data-chart-palette={value}
          className="m-0 flex flex-col gap-2 rounded-(--radius-lg) border border-(--rule-2) p-4"
        >
          <div className="flex items-end gap-1.5" aria-hidden>
            {SERIES.map((token, index) => (
              <span
                key={token}
                style={{ background: `var(${token})`, height: `${1.25 + index * 0.5}rem` }}
                className="w-6 rounded-(--radius-sm)"
              />
            ))}
          </div>
          <figcaption className="flex items-baseline gap-2.5">
            <span className="text-sm text-(--ink)">{t.themes.values[value] ?? value}</span>
            <code className="mono-meta text-(--ink-3-aa)">
              {attribute('chartPalette')}=&quot;{value}&quot;
            </code>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/** Re-exported so nothing else has to know where the axis list lives. */
export type { Axis }
