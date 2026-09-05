'use client'

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
} from '@misoto22/design'
import { Palette, RotateCcw } from 'lucide-react'
import { useMessages } from '@/i18n/useLocale'
import { ACCENTS } from './AccentProvider'
import { AXES, DEFAULTS, PRESETS, RESET_PRESET, useTheme, type Axis } from './ThemeProvider'

/** The order the axes are offered in — ground first, then shape, then feel. */
const ORDER: Axis[] = ['surface', 'radius', 'rules', 'type', 'motion', 'density']

/**
 * The theme panel.
 *
 * The old version offered five accents and called itself a theme switcher,
 * which was fair comment: it changed one token. This changes the ground, the
 * corners, the rules the system draws, which face carries a heading, how fast
 * anything moves, and how tight the rows are — and none of it touches a
 * component. That is the claim the token layer has been making all along, and
 * this is where it is testable.
 *
 * Presets first, because most readers want a look rather than six decisions;
 * the axes below them, because the ones who want the decisions should not have
 * to accept somebody's bundle to get at them.
 */
export function ThemeMenu() {
  const { theme, set, apply, matching } = useTheme()
  const t = useMessages()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button iconOnly size="sm" variant="ghost" aria-label={t.appearance.theme}>
          <Palette size={16} strokeWidth={1.5} aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        label={t.appearance.theme}
        align="end"
        className="max-h-[min(34rem,80vh)] w-[21rem] overflow-y-auto p-0 scroll-slim"
      >
        <div className="flex items-baseline justify-between gap-3 px-4 pb-2 pt-4">
          <h2 className="m-0 font-heading text-[length:var(--fs-item)] text-(--ink)">
            {t.appearance.theme}
          </h2>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => apply(RESET_PRESET)}
            disabled={matching?.id === 'reset'}
          >
            <RotateCcw size={13} strokeWidth={1.5} aria-hidden />
            {t.appearance.reset}
          </Button>
        </div>

        <div className="flex flex-col gap-1 px-2 pb-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={matching?.id === preset.id}
              onClick={() => apply(preset)}
              className="flex flex-col items-start gap-0.5 rounded-(--radius-sm) px-2.5 py-2 text-start transition-colors duration-(--duration-fast) hover:bg-(--stone) aria-pressed:bg-(--accent-muted)"
            >
              <span className="flex w-full items-center gap-2 text-sm text-(--ink)">
                {t.themes.presets[preset.id]?.name ?? preset.name}
                {matching?.id === preset.id && (
                  <span className="ms-auto mono-meta text-(--ink-3-aa)">{t.appearance.current}</span>
                )}
              </span>
              <span className="text-[12px] leading-snug text-(--ink-3-aa)">
                {t.themes.presets[preset.id]?.note ?? preset.note}
              </span>
            </button>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-4 p-4">
          <p className="m-0 text-[12px] leading-relaxed text-(--ink-3-aa)">{t.appearance.axesNote}</p>

          {ORDER.map((axis) => (
            <div key={axis} className="flex flex-col gap-1.5">
              <span className="eyebrow text-(--ink-3-aa)">{t.themes.axes[axis]}</span>
              <ToggleGroup
                type="single"
                value={theme[axis]}
                aria-label={t.themes.axes[axis]}
                // A strip cannot be emptied: unpicking the ground leaves the
                // page with no ground, so an empty value falls back.
                onValueChange={(next) => set(axis, next || DEFAULTS[axis])}
                className="w-full"
              >
                {AXES[axis].map((option) => (
                  <ToggleGroupItem key={option} value={option} className="flex-1 text-[13px]">
                    {t.themes.values[option] ?? option}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <span className="eyebrow text-(--ink-3-aa)">{t.appearance.accentTitle}</span>
            <div className="flex flex-wrap gap-1.5">
              {ACCENTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={theme.accent === option.id}
                  aria-label={option.name}
                  title={option.name}
                  onClick={() => set('accent', option.id)}
                  className="grid size-8 place-items-center rounded-(--radius-sm) border border-transparent transition-colors duration-(--duration-fast) hover:border-(--rule-2) aria-pressed:border-(--ink)"
                >
                  <span
                    aria-hidden
                    className="size-4 rounded-full border border-(--rule-2)"
                    style={{ background: option.swatch }}
                  />
                </button>
              ))}
            </div>
            <p className="m-0 text-[12px] leading-relaxed text-(--ink-3-aa)">
              {t.appearance.accentNote}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
