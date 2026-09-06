/**
 * How a number is written on a chart.
 *
 * `compact` is the one an axis almost always wants and almost never gets:
 * an axis reading 1,200,000 spends four characters saying "this is a big
 * number" and pushes the plot inward to do it, where 1.2M says the same thing
 * in four characters total. Every other option here exists because a bare
 * `toLocaleString` cannot say what the number IS — a share, a price, a span.
 */
export type NumberStyle = 'plain' | 'compact' | 'percent' | 'currency' | 'duration' | 'bytes'

export interface NumberFormatOptions {
  style?: NumberStyle
  /** BCP 47 tag. Omit and the reader's own locale decides. */
  locale?: string
  /** ISO 4217, for `currency`. */
  currency?: string
  /** Digits after the point. Defaults to what the style needs. */
  fractionDigits?: number
  /** Written after the number — "req/s", "kB", "°C". Ignored by `currency`. */
  unit?: string
}

const MINUTE = 60
const HOUR = 3600
const DAY = 86_400

/** 1024-based steps, because a byte count is not a decimal quantity. */
const BYTE_STEPS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'] as const

/**
 * Seconds as a span a person reads — "1h 12m", not "4320".
 *
 * Two units at most on purpose: "1h 12m 30s" is three facts where the reader
 * asked for one, and the third is never the one that mattered.
 */
function duration(seconds: number): string {
  const sign = seconds < 0 ? '-' : ''
  const total = Math.abs(seconds)

  if (total < MINUTE) return `${sign}${Math.round(total)}s`
  if (total < HOUR) {
    const minutes = Math.floor(total / MINUTE)
    const rest = Math.round(total % MINUTE)
    return rest === 0 ? `${sign}${minutes}m` : `${sign}${minutes}m ${rest}s`
  }
  if (total < DAY) {
    const hours = Math.floor(total / HOUR)
    const minutes = Math.round((total % HOUR) / MINUTE)
    return minutes === 0 ? `${sign}${hours}h` : `${sign}${hours}h ${minutes}m`
  }
  const days = Math.floor(total / DAY)
  const hours = Math.round((total % DAY) / HOUR)
  return hours === 0 ? `${sign}${days}d` : `${sign}${days}d ${hours}h`
}

function bytes(value: number, fractionDigits: number | undefined, locale?: string): string {
  const sign = value < 0 ? '-' : ''
  let size = Math.abs(value)
  let step = 0
  while (size >= 1024 && step < BYTE_STEPS.length - 1) {
    size /= 1024
    step += 1
  }
  const digits = fractionDigits ?? (step === 0 || size >= 100 ? 0 : 1)
  // A maximum without a minimum: 2048 bytes is "2 kB", not "2.0 kB". A
  // trailing zero on a size claims a precision the step conversion does not
  // have.
  return `${sign}${size.toLocaleString(locale, { maximumFractionDigits: digits })} ${BYTE_STEPS[step]}`
}

/**
 * A formatter for one axis, one tooltip, or one label.
 *
 * Returns a function rather than a string so it can be handed straight to
 * Recharts' `tickFormatter`, which is called once per tick and must not
 * rebuild an `Intl.NumberFormat` each time — constructing one is expensive
 * enough that doing it per tick shows up on a chart with a brush.
 *
 * @example
 * <BarChart.YAxis tickFormatter={formatNumber({ style: 'compact' })} />
 * @example
 * <LineChart.YAxis tickFormatter={formatNumber({ style: 'currency', currency: 'AUD' })} />
 */
export function formatNumber(options: NumberFormatOptions = {}): (value: number) => string {
  const { style = 'plain', locale, currency = 'USD', fractionDigits, unit } = options

  if (style === 'duration') return (value) => duration(value)
  if (style === 'bytes') return (value) => bytes(value, fractionDigits, locale)

  const intl = new Intl.NumberFormat(locale, {
    notation: style === 'compact' ? 'compact' : 'standard',
    compactDisplay: 'short',
    style: style === 'percent' ? 'percent' : style === 'currency' ? 'currency' : 'decimal',
    currency: style === 'currency' ? currency : undefined,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits ?? (style === 'compact' ? 1 : undefined),
  })

  if (!unit || style === 'currency') return (value) => intl.format(value)
  // A plain space, not a thin one: U+2009 is invisible in a diff and the
  // linter flags it, and at 11px on an axis the two are indistinguishable.
  return (value) => `${intl.format(value)} ${unit}`
}

/**
 * The default a chart uses when nothing is said: compact above four digits,
 * plain below it.
 *
 * The threshold is where an axis starts costing the plot real width. Below it,
 * "9,400" is more precise and no wider than "9.4K"; above it, the compact form
 * wins on both counts.
 */
export const defaultTick = (value: number): string =>
  Math.abs(value) >= 10_000 ? COMPACT(value) : PLAIN(value)

const COMPACT = formatNumber({ style: 'compact' })
const PLAIN = formatNumber({ style: 'plain' })
