'use client'

import {
  createContext,
  useContext,
  useId,
  useMemo,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '../../lib/cn'

/**
 * How many series the system will paint before it refuses.
 *
 * Eight is not a rendering limit — it is the width of the validated ramp in
 * `tokens.css`. A ninth series has no slot, and generating one would mean
 * inventing a colour nobody checked against the eighth. The catalogued answer
 * to "I have twelve categories" is to fold the tail into an "Other" series or
 * to facet, and this constant is where that decision is enforced rather than
 * left to whoever is looking at the chart.
 */
export const SERIES_SLOTS = 8

/** Theme name → the selector its block is written under. */
const THEMES = { light: '', dark: "[data-mode='dark']" } as const

type ThemeKey = keyof typeof THEMES

const THEME_KEYS = Object.keys(THEMES) as ThemeKey[]

/** Colours for one series, per theme. At least one theme must be given. */
type ThemeColors = {
  [K in ThemeKey]: Required<Pick<Record<ThemeKey, string[]>, K>> &
    Partial<Omit<Record<ThemeKey, string[]>, K>>
}[ThemeKey]

export interface ChartSeries {
  /**
   * What the legend, the tooltip and the hidden data table call this series.
   *
   * Required, unlike the shape this was ported from. Colour is never the only
   * carrier of identity in this system, and a legend entry with no label is a
   * swatch that means nothing — least of all in the monochrome default, where
   * two series differ by a step of grey and a texture.
   */
  label: ReactNode
  /** Drawn in place of the legend/tooltip swatch. Decorative; label still wins. */
  icon?: ComponentType
  /**
   * Explicit colours for this series, overriding its slot on the series ramp.
   *
   * Reach for this only when the data itself carries a colour the reader
   * already knows — a brand, a traffic light, a map key. For "I want my chart
   * to have colours", set `data-chart-palette="chroma"` on any ancestor: that
   * swaps the whole ramp for a palette validated against both grounds, which a
   * hand-picked array is not.
   *
   * More than one colour paints the series as a horizontal gradient across
   * those stops. Values are plain CSS colours; anything that could break out of
   * a declaration is rejected at the boundary rather than injected.
   */
  colors?: ThemeColors
}

/** Series keys → how each is labelled and painted. Declaration order is slot order. */
export type ChartConfig = Record<string, ChartSeries>

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = createContext<ChartContextValue | null>(null)

/** The chart config of the nearest chart root. Throws outside one. */
export function useChart(): ChartContextValue {
  const context = useContext(ChartContext)
  if (!context) throw new Error('A chart part must be rendered inside a chart root')
  return context
}

/**
 * A CSS colour, or something that would escape the declaration it is written
 * into.
 *
 * `ChartStyle` writes consumer-supplied values into a `<style>` element, which
 * makes this a system boundary in the security sense: without the check, a
 * `colors` array carrying `red; } html { display: none } .x {` is not a colour,
 * it is a stylesheet. The allowed set is deliberately shaped around what a
 * colour is made of — identifiers, digits, `#`, brackets, commas, percent — so
 * `var(--x)`, `oklch(…)` and `color-mix(in srgb, …)` all pass and no `;`, `{`,
 * `}`, `<`, `\` or comment sequence does.
 */
const CSS_COLOR = /^[A-Za-z0-9#(),.%\-\s_]{1,120}$/

function isSafeColor(value: unknown): value is string {
  return typeof value === 'string' && CSS_COLOR.test(value) && !value.includes('/*')
}

/**
 * Distributes fewer colours than slots, giving the surplus to the last stops.
 * Two colours over four slots read as `[a, a, b, b]`; three over four as
 * `[a, b, c, c]`.
 */
function distribute(colors: string[], slots: number): string[] {
  if (colors.length >= slots) return colors.slice(0, slots)

  const base = Math.floor(slots / colors.length)
  const extra = slots % colors.length
  const out: string[] = []
  colors.forEach((color, index) => {
    const count = base + (index >= colors.length - extra ? 1 : 0)
    for (let n = 0; n < count; n += 1) out.push(color)
  })
  return out
}

/** How many gradient stops a series paints with — one means a flat fill. */
export function colorStops(series: ChartSeries | undefined): number {
  if (!series?.colors) return 1
  return Math.max(1, ...THEME_KEYS.map((theme) => series.colors?.[theme]?.length ?? 0))
}

/**
 * The custom properties one chart instance paints from.
 *
 * Every series resolves to `--color-<key>-<n>`, and every mark, swatch and
 * gradient stop in the package reads only those names. That indirection is what
 * lets the same chart be repainted by an ancestor attribute — a theme, a
 * palette, dark mode — without a component knowing anything about colour.
 *
 * A series with no `colors` takes its slot on the ramp, in declaration order.
 * That is the "assign in fixed order, never cycle" rule expressed as code: the
 * fourth series is `--series-4` whether or not the first three are on screen,
 * so hiding a series never repaints the survivors.
 */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const css = useMemo(() => {
    const entries = Object.entries(config)

    const rules = (theme: ThemeKey) =>
      entries
        .flatMap(([key, series], slot) => {
          const stops = colorStops(series)
          const slotColor = `var(--series-${(slot % SERIES_SLOTS) + 1})`
          const given = series.colors?.[theme] ?? series.colors?.light ?? series.colors?.dark
          const safe = given?.filter(isSafeColor) ?? []
          // A rejected colour falls back to the ramp rather than to nothing: an
          // unpainted series is invisible, which is a worse failure than an
          // ignored value and a harder one to notice.
          const colors = safe.length > 0 ? safe : [slotColor]
          return distribute(colors, stops).map(
            (color, index) => `  --color-${cssName(key)}-${index}: ${color};`,
          )
        })
        .join('\n')

    return THEME_KEYS.map((theme) => {
      const body = rules(theme)
      if (!body) return ''
      return `${THEMES[theme]} [data-chart='${id}'] {\n${body}\n}`
    })
      .filter(Boolean)
      .join('\n')
  }, [id, config])

  if (!css) return null

  return <style>{css}</style>
}

/**
 * A series key, reduced to what may appear in a custom property name. Keys come
 * from consumer data, so the same boundary argument as `isSafeColor` applies —
 * here it is the property NAME rather than its value.
 */
export function cssName(key: string): string {
  return key.replace(/[^A-Za-z0-9_-]/g, '-')
}

export interface ChartContainerProps
  extends Omit<ComponentProps<'div'>, 'children'>,
    Pick<
      ComponentProps<typeof ResponsiveContainer>,
      'initialDimension' | 'minHeight' | 'minWidth' | 'maxHeight' | 'height' | 'width' | 'children'
    > {
  config: ChartConfig
  /** Rendered under the plot, inside the same measured box — the brush lives here. */
  footer?: ReactNode
}

/**
 * The measured box every chart is drawn into, and the only place Recharts'
 * hard-coded greys are re-pointed at system tokens.
 *
 * Recharts paints its axes, grid, cursor and radial track with literal `#ccc`
 * and `#fff`. The selectors below catch each of those and hand it a token, so a
 * chart follows light/dark and a surface theme without a consumer configuring
 * anything — and so nothing in the package has to pass a colour down by prop.
 */
export function ChartContainer({
  id,
  config,
  initialDimension = { width: 320, height: 200 },
  className,
  children,
  footer,
  ...rest
}: ChartContainerProps) {
  const generated = useId().replace(/:/g, '')
  const chartId = `chart-${id ?? generated}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          'relative flex min-h-0 w-full flex-1 flex-col justify-center text-xs',
          // 16:9 is right for a card and wrong for a full-width panel: at
          // 1200px it is a 675px-tall plot with six points in it. The cap is
          // what stops the aspect ratio running away with a wide container,
          // and `min-h` keeps it from collapsing in a narrow one.
          //
          // With a footer the shape moves DOWN one element rather than being
          // dropped — see the container below. Sizing this box 16:9 would hand
          // the footer's height to the footer out of the plot's share, which is
          // a plot that shrinks as its brush grows.
          !footer && 'aspect-video max-h-[26rem] min-h-[13rem]',
          // Recharts' own defaults, re-pointed at the token layer.
          "[&_.recharts-cartesian-axis-tick_text]:fill-(--chart-axis)",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-(--chart-grid)",
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-(--chart-cursor)',
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-(--chart-grid)",
          '[&_.recharts-radial-bar-background-sector]:fill-(--chart-track)',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--chart-track)',
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-(--chart-grid)",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          // Keyboard-focusable SVGs use the same global :focus-visible rule as
          // every other control. A utility-level outline reset here overrides
          // that base rule and leaves a working chart with no visible focus.
          className,
        )}
        {...rest}
      >
        <ChartStyle id={chartId} config={config} />
        {/* The plot carries the shape when there is a footer under it.
            It used to carry nothing: the outer box dropped `aspect-video` AND
            `min-h` the moment a footer existed, on the reasoning that a fixed
            aspect plus a footer overflows — which is true of the aspect and
            not of the floor. So a chart with a brush had a plot with no
            intrinsic height at all, and in any container that sizes to its
            content the plot measured zero and only the brush's own 56px
            survived. Recharts says so out loud — "width(-1) and height(-1) of
            chart should be greater than 0" — into a console nobody reads. */}
        <ResponsiveContainer
          className={cn(
            'w-full flex-1',
            footer ? 'aspect-video max-h-[26rem] min-h-[13rem]' : 'min-h-0',
          )}
          initialDimension={initialDimension}
        >
          {children}
        </ResponsiveContainer>
        {footer}
      </div>
    </ChartContext.Provider>
  )
}

/**
 * Reads the config entry behind a Recharts payload item.
 *
 * Recharts hands the same series different names in different chart types — a
 * pie sector's key is on `payload.payload[nameKey]`, a bar's is `dataKey` — so
 * this is the one place that disagreement is resolved.
 */
export function seriesFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
): ChartSeries | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined

  const nested =
    'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null
      ? (payload.payload as Record<string, unknown>)
      : undefined

  let name = key
  const direct = (payload as Record<string, unknown>)[key]
  if (typeof direct === 'string') name = direct
  else if (nested && typeof nested[key] === 'string') name = nested[key] as string

  return name in config ? config[name] : config[key]
}

/** Formats an expanded stack's axis, where 0–1 means 0–100%. */
export function percentTick(value: number): string {
  return `${Math.round(value * 100)}%`
}
