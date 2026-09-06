/**
 * CSS colour maths, with no dependency and no DOM.
 *
 * Adapted from DialKit (https://github.com/joshpuckett/dialkit), MIT licensed:
 *
 *   Copyright (c) 2026 Josh Puckett
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 * The working space is OKLCH, and that is the substantive choice here rather
 * than an implementation detail. A picker built on HSV hands a reader two
 * colours at the same "lightness" where one of them is visibly darker, because
 * HSV's lightness is a property of the numbers rather than of the eye. Every
 * decision in `ColorPicker` — where the handle sits, what the hue strip looks
 * like at this lightness, which colours are reachable at all — depends on a
 * space that is perceptually uniform, and OKLCH is the one CSS ships.
 *
 * The matrices are the CSS Color 4 reference implementation's, D65.
 * https://www.w3.org/TR/css-color-4/#color-conversion-code
 */

/** A colour in OKLCH: lightness 0–1, chroma, hue in degrees, alpha 0–1. */
export interface Color {
  l: number
  c: number
  h: number
  a: number
}

/** The notations this module reads and writes. */
export type ColorFormat = 'hex' | 'oklch' | 'p3'

/** The two RGB gamuts a colour can be fitted to. */
export type ColorSpace = 'srgb' | 'p3'

type Triple = [number, number, number]

export const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n))

export const wrapHue = (h: number) => ((h % 360) + 360) % 360

const multiply = (m: number[][], v: Triple): Triple =>
  m.map((row) => row.reduce((n, x, i) => n + x * (v[i] ?? 0), 0)) as Triple

/** sRGB transfer function, undone. Signed, so an out-of-gamut channel survives. */
const linearize = (v: number) =>
  Math.abs(v) <= 0.04045 ? v / 12.92 : Math.sign(v) * ((Math.abs(v) + 0.055) / 1.055) ** 2.4

const encode = (v: number) =>
  Math.abs(v) <= 0.0031308 ? 12.92 * v : Math.sign(v) * (1.055 * Math.abs(v) ** (1 / 2.4) - 0.055)

const RGB_XYZ = [
  [0.4123907993, 0.3575843394, 0.1804807884],
  [0.2126390059, 0.7151686788, 0.0721923154],
  [0.0193308187, 0.1191947798, 0.9505321522],
]
const P3_XYZ = [
  [0.4865709486, 0.2656676932, 0.1982172852],
  [0.2289745641, 0.6917385218, 0.0792869141],
  [0, 0.0451133819, 1.0439443689],
]
const XYZ_RGB = [
  [3.2409699419, -1.5373831776, -0.4986107603],
  [-0.9692436363, 1.8759675015, 0.0415550574],
  [0.0556300797, -0.2039769589, 1.0569715142],
]
const XYZ_P3 = [
  [2.4934969119, -0.9313836179, -0.4027107845],
  [-0.8294889696, 1.7626640603, 0.0236246858],
  [0.0358458302, -0.0761723893, 0.956884524],
]
const XYZ_LMS = [
  [0.819022438, 0.3619062601, -0.1288737815],
  [0.0329836539, 0.9292868616, 0.0361446664],
  [0.0481771894, 0.2642395318, 0.6335478285],
]
const LMS_XYZ = [
  [1.2268798734, -0.5578149966, 0.2813910502],
  [-0.0405757626, 1.1122868294, -0.0717110667],
  [-0.0763729497, -0.421493324, 1.5869240244],
]

/** Gamma-encoded RGB in 0–1 to OKLCH. */
export function rgbToColor(rgb: Triple, a = 1, space: ColorSpace = 'srgb'): Color {
  const xyz = multiply(space === 'p3' ? P3_XYZ : RGB_XYZ, rgb.map(linearize) as Triple)
  const [l, m, s] = multiply(XYZ_LMS, xyz).map(Math.cbrt) as Triple
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  // Below the threshold the hue is the angle of rounding error, not a hue. Left
  // in, a slider dragged to pure white would spin the strip through 360°.
  const grey = c < 1e-7
  return {
    l: clamp(L),
    c: grey ? 0 : c,
    h: grey ? 0 : wrapHue((Math.atan2(B, A) * 180) / Math.PI),
    a: clamp(a),
  }
}

/** OKLCH to gamma-encoded RGB in 0–1. May fall outside it — see `fitGamut`. */
export function colorToRgb(color: Color, space: ColorSpace = 'srgb'): Triple {
  const a = color.c * Math.cos((color.h * Math.PI) / 180)
  const b = color.c * Math.sin((color.h * Math.PI) / 180)
  const lms: Triple = [
    (color.l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (color.l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (color.l - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ]
  return multiply(space === 'p3' ? XYZ_P3 : XYZ_RGB, multiply(LMS_XYZ, lms)).map(encode) as Triple
}

export function inGamut(color: Color, space: ColorSpace = 'srgb'): boolean {
  return colorToRgb(color, space).every((n) => n >= -0.00001 && n <= 1.00001)
}

/**
 * Brings a colour inside a gamut by giving up CHROMA, and nothing else.
 *
 * The naive fix is to clip each channel at 0 and 1, which changes the hue and
 * the lightness together — a vivid blue clipped that way comes back purple and
 * darker. Bisecting on chroma keeps both, so what a reader loses is only the
 * saturation the display could never have shown them.
 */
export function fitGamut(color: Color, space: ColorSpace = 'srgb'): Color {
  if (inGamut(color, space)) return color
  let lo = 0
  let hi = color.c
  // Twenty halvings of a chroma under 0.5 lands well inside a 24-bit step.
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (inGamut({ ...color, c: mid }, space)) lo = mid
    else hi = mid
  }
  return { ...color, c: lo }
}

/** The most chroma a gamut holds at this lightness and hue — the plane's edge. */
export function maxChroma(l: number, h: number, space: ColorSpace = 'srgb'): number {
  if (l <= 0 || l >= 1) return 0
  return fitGamut({ l, c: 0.5, h, a: 1 }, space).c
}

/** Which notation a string is written in. Anything unrecognised reads as hex. */
export function colorFormat(value: string): ColorFormat {
  const text = value.trim()
  if (/^oklch\(/i.test(text)) return 'oklch'
  if (/^color\(display-p3\s/i.test(text)) return 'p3'
  return 'hex'
}

const round = (v: number, digits = 4) => Number(v.toFixed(digits))

/**
 * A colour as a CSS string.
 *
 * Hex and Display P3 are bounded output spaces, so the colour is fitted on the
 * way out; OKLCH is not, and writing an out-of-gamut OKLCH is legitimate — the
 * browser fits it to whatever the display actually has.
 */
export function formatColor(color: Color, format: ColorFormat): string {
  const alpha = color.a < 1 ? ` / ${round(color.a)}` : ''
  if (format === 'oklch') {
    return `oklch(${round(color.l)} ${round(color.c)} ${round(color.h, 2)}${alpha})`
  }
  const space: ColorSpace = format === 'p3' ? 'p3' : 'srgb'
  const rgb = colorToRgb(fitGamut(color, space), space)
  if (format === 'p3') {
    return `color(display-p3 ${rgb.map((n) => round(clamp(n), 5)).join(' ')}${alpha})`
  }
  const bytes = rgb.map((n) => Math.round(clamp(n) * 255))
  if (color.a < 1) bytes.push(Math.round(color.a * 255))
  return `#${bytes.map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(%|deg|grad|rad|turn)?$/i

/** One CSS numeric token, in the unit its channel allows. */
function number(value: string, percentScale = 1, hue = false): number | null {
  const match = NUMBER.exec(value)
  if (!match) return null
  const n = parseFloat(value)
  if (!Number.isFinite(n)) return null
  const unit = match[1]?.toLowerCase()
  if (hue) {
    if (unit === 'rad') return (n * 180) / Math.PI
    if (unit === 'turn') return n * 360
    if (unit === 'grad') return n * 0.9
    return !unit || unit === 'deg' ? n : null
  }
  if (unit === '%') return (n * percentScale) / 100
  return unit ? null : n
}

/**
 * An absolute CSS colour as OKLCH, or `null` when the string is not one.
 *
 * Hex, `rgb()`, `hsl()`, `oklch()` and `color(display-p3 …)`, in both the
 * comma and the space syntax. Named colours are deliberately absent: resolving
 * them needs a table of a hundred and forty-eight entries or a DOM, and a
 * picker that accepts "rebeccapurple" but not "papayawhip" is worse than one
 * that accepts neither.
 */
export function parseColor(value: string): Color | null {
  const text = value.trim().toLowerCase()
  if (text === 'transparent') return { l: 0, c: 0, h: 0, a: 0 }

  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.test(text)) {
    const short = text.slice(1)
    const hex = short.length <= 4 ? [...short].map((c) => c + c).join('') : short
    const bytes = (hex.match(/../g) ?? []).map((c) => parseInt(c, 16) / 255)
    return rgbToColor(bytes.slice(0, 3) as Triple, bytes[3] ?? 1)
  }

  const match = /^(oklch|rgb|rgba|hsl|hsla|color)\(([^()]*)\)$/.exec(text)
  if (!match) return null
  const kind = match[1] ?? ''
  let body = (match[2] ?? '').trim()

  const p3 = kind === 'color'
  if (p3) {
    if (!body.startsWith('display-p3 ')) return null
    body = body.slice(11).trim()
  }

  // The comma syntax is the legacy one, and it never applied to `oklch()` or
  // `color()`; mixing it with the modern `/` alpha is not a colour either.
  const legacy = body.includes(',')
  if (legacy && (p3 || kind === 'oklch' || body.includes('/'))) return null

  const parts = legacy ? body.split(',').map((x) => x.trim()) : body.split(/\s*\/\s*/)
  if (!legacy && parts.length > 2) return null
  const channels = legacy ? parts.slice(0, 3) : (parts[0] ?? '').split(/\s+/)
  if (channels.length !== 3) return null
  if (legacy && parts.length !== 3 && parts.length !== 4) return null
  // Legacy rgb() is all percentages or all numbers, never a mixture.
  if (
    legacy &&
    kind.startsWith('rgb') &&
    channels.some((c) => c.endsWith('%')) &&
    !channels.every((c) => c.endsWith('%'))
  ) {
    return null
  }

  const alphaText = legacy ? parts[3] : parts[1]
  const alpha = alphaText === undefined ? 1 : number(alphaText)
  if (alpha === null) return null

  if (kind === 'oklch') {
    const l = number(channels[0] ?? '')
    // 100% chroma is 0.4 by the specification, not 1.
    const c = number(channels[1] ?? '', 0.4)
    const h = number(channels[2] ?? '', 1, true)
    if (l === null || c === null || h === null) return null
    return { l: clamp(l), c: Math.max(0, c), h: wrapHue(h), a: clamp(alpha) }
  }

  if (kind.startsWith('hsl')) {
    const h = number(channels[0] ?? '', 1, true)
    const s = number(channels[1] ?? '')
    const l = number(channels[2] ?? '')
    if (h === null || s === null || l === null) return null
    if (!channels[1]?.endsWith('%') || !channels[2]?.endsWith('%')) return null
    const sat = clamp(s)
    const light = clamp(l)
    const amount = sat * Math.min(light, 1 - light)
    const channel = (n: number) => {
      const k = (n + wrapHue(h) / 30) % 12
      return light - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    }
    return rgbToColor([channel(0), channel(8), channel(4)], alpha)
  }

  const values = channels.map((c) => number(c, p3 ? 1 : 255))
  if (values.some((n) => n === null)) return null
  return rgbToColor(
    values.map((n) => (p3 ? (n ?? 0) : clamp((n ?? 0) / 255))) as Triple,
    alpha,
    p3 ? 'p3' : 'srgb',
  )
}
