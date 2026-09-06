'use client'

import { Button, Card, CardBody } from '@misoto22/design'
import { Check } from 'lucide-react'
import type { Locale } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import { AXES, DEFAULTS, PRESETS, useTheme, type Axis } from './ThemeProvider'
import { ThemeSpecimen } from './ThemeSpecimen'

/** The axes a PRESET combines — the ones that change how the page looks. */
const ORDER: Axis[] = ['surface', 'radius', 'rules', 'type', 'motion', 'density']

/**
 * Every axis the system has, for the reference card.
 *
 * `chartPalette` is here and not in `ORDER` on purpose: it changes what a chart
 * is painted with and nothing else, so a preset that carried it would be
 * claiming a look it does not have.
 */
const ALL_AXES: Axis[] = [...ORDER, 'chartPalette']

/** `chartPalette` as it is written in the DOM. */
const attribute = (axis: Axis) => `data-${axis.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`

/**
 * Five themes on one page, each drawn by the components below it.
 *
 * The attributes go on a wrapper rather than on the document, which is only
 * possible because nothing in `themes.css` is anchored to `:root`. That is the
 * argument the page is making, made structurally: if a theme needed to own the
 * document, five of them could not share a page.
 */
export function ThemeGallery({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const { apply, matching } = useTheme()

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 md:grid-cols-2">
        {PRESETS.map((preset) => {
          const copy = t.themes.presets[preset.id]
          const active = matching?.id === preset.id
          const axes = Object.fromEntries(
            ORDER.filter((axis) => (preset.values[axis] ?? DEFAULTS[axis]) !== DEFAULTS[axis]).map(
              (axis) => [`data-${axis}`, preset.values[axis]],
            ),
          )

          return (
            <section key={preset.id} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="m-0 font-heading text-[length:var(--fs-sub)] text-(--ink)">
                  {copy?.name ?? preset.name}
                </h2>
                <Button
                  size="sm"
                  variant={active ? 'ghost' : 'secondary'}
                  className="gap-1.5"
                  onClick={() => apply(preset)}
                  aria-pressed={active}
                >
                  {active && <Check size={13} strokeWidth={1.5} aria-hidden />}
                  {active ? t.appearance.current : t.themes.title}
                </Button>
              </div>
              <p className="m-0 min-h-10 text-[13px] leading-relaxed text-(--ink-3-aa)">
                {copy?.note ?? preset.note}
              </p>
              <div
                {...axes}
                data-accent={preset.values.accent}
                // Inert, not role="img". The specimen is built from real
                // controls, so calling it a picture would lie, and leaving five
                // copies of the same form in the tab order would put forty
                // stops between the reader and the next heading.
                inert
                // The overflow clip is what makes the corner radius visible at
                // the frame's own edge rather than only on the pieces inside.
                className="overflow-hidden rounded-(--radius-frame) border border-(--rule-2)"
              >
                <ThemeSpecimen />
              </div>
              <dl className="m-0 flex flex-wrap gap-x-4 gap-y-1">
                {ORDER.map((axis) => (
                  <div key={axis} className="flex gap-1.5">
                    <dt className="mono-meta text-(--ink-3-aa)">{t.themes.axes[axis]}</dt>
                    <dd className="m-0 mono-meta text-(--ink-2)">
                      {t.themes.values[preset.values[axis] ?? DEFAULTS[axis]]}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )
        })}
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <h2 className="m-0 font-heading text-[length:var(--fs-sub)] text-(--ink)">
            {t.themes.axesTitle}
          </h2>
          <p className="m-0 text-[13px] leading-relaxed text-(--ink-2)">{t.themes.axesLead}</p>
          <dl className="m-0 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {ALL_AXES.map((axis) => (
              <div key={axis} className="flex flex-col gap-0.5 border-t border-(--rule) pt-2">
                <dt className="eyebrow text-(--ink-3-aa)">
                  {t.themes.axes[axis]} <span className="lowercase">— {attribute(axis)}</span>
                </dt>
                <dd className="m-0 text-[13px] text-(--ink-2)">
                  {AXES[axis].map((value) => t.themes.values[value] ?? value).join(' · ')}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  )
}
