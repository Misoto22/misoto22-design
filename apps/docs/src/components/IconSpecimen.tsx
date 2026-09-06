import { Check, ChevronRight } from 'lucide-react'

/**
 * The icon scale, drawn at the sizes the package actually renders.
 *
 * Read off `packages/design/src/components`, not off the token file. The two
 * disagree in a way worth showing — `--ico-s`, `--ico-m` and `--ico-l` name
 * three of these six sizes and no component reads any of them — and a specimen
 * built from the tokens alone would show a scale the library does not use.
 *
 * Every glyph here is a real `lucide-react` icon at the real stroke, so the
 * page renders the claim rather than describing it.
 */

const SIZES: { size: number; token?: string; note: string }[] = [
  { size: 12, note: 'Not a size — a mark inside an 18px box: a checkbox tick, a chip’s close, a table’s sort caret.' },
  { size: 14, token: '--ico-s', note: 'Inside a control’s own padding, where 16 would crowd the label: a select indicator, a popover close.' },
  { size: 16, token: '--ico-m', note: 'The default, and most of what the package draws: a chevron, a close, a check, a caret.' },
  { size: 18, note: 'A leading mark that opens a row rather than sitting inside one: a nav item, an alert’s tone, the palette’s search.' },
  { size: 20, token: '--ico-l', note: 'The app shell’s menu toggle.' },
  { size: 24, note: 'Reserved for an EmptyState, where the icon is the only thing on the surface.' },
]

/** The stroke exception, at the one size that forces it. */
const STROKES = [1.5, 2, 3]

export function IconSpecimen() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col divide-y divide-(--rule) border-y border-(--rule)">
        {SIZES.map((step) => (
          <div key={step.size} className="flex items-center gap-5 py-4">
            {/* A fixed box, so the glyphs share a centre line and the scale
                reads as a scale rather than as six left-aligned marks. */}
            <span className="flex w-8 shrink-0 items-center justify-center text-(--ink)">
              <ChevronRight size={step.size} strokeWidth={1.5} aria-hidden />
            </span>
            <p className="m-0 w-28 shrink-0 mono-meta text-(--ink-3-aa)">
              {step.size}px{step.token ? ` · ${step.token}` : ''}
            </p>
            <p className="m-0 max-w-(--measure-record) text-[13px] leading-relaxed text-(--ink-2)">
              {step.note}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <p className="m-0 eyebrow text-(--ink-3-aa)">Stroke, at 12px</p>
        <div className="flex flex-wrap items-center gap-8">
          {STROKES.map((stroke) => (
            <div key={stroke} className="flex items-center gap-3">
              {/* Drawn on the accent, the way a checked box actually draws it —
                  the whole reason 1.5 fails here is that it is a light mark on
                  a filled ground rather than ink on paper. */}
              <span className="flex size-[18px] items-center justify-center rounded-(--radius-xs) bg-(--accent) text-(--accent-foreground)">
                <Check size={12} strokeWidth={stroke} aria-hidden />
              </span>
              <span className="mono-meta text-(--ink-3-aa)">{`strokeWidth={${stroke}}`}</span>
            </div>
          ))}
        </div>
        <p className="m-0 max-w-(--measure-record) text-[13px] leading-relaxed text-(--ink-3-aa)">
          Checkbox draws its tick at 3. The rule is one weight, 1.5, and
          everything in the package that breaks it is a 12px mark like this one,
          where 1.5 thins below a hairline and the glyph stops reading as a
          glyph.
        </p>
      </section>
    </div>
  )
}
