import { describe, expect, it } from 'vitest'
import {
  colorFormat,
  fitGamut,
  formatColor,
  inGamut,
  maxChroma,
  parseColor,
} from './color'

/** Two colours the same to within a 24-bit channel. */
const close = (a: number, b: number, tolerance = 0.004) => Math.abs(a - b) <= tolerance

describe('parseColor', () => {
  it('reads hex in every length', () => {
    expect(parseColor('#000')).toEqual({ l: 0, c: 0, h: 0, a: 1 })
    expect(parseColor('#ffffff')?.l).toBeCloseTo(1, 3)
    expect(parseColor('#00000080')?.a).toBeCloseTo(0.502, 2)
  })

  it('reads rgb, hsl and oklch, in both syntaxes', () => {
    const legacy = parseColor('rgb(255, 0, 0)')
    const modern = parseColor('rgb(255 0 0)')
    expect(legacy).toEqual(modern)
    expect(parseColor('hsl(0 100% 50%)')?.h).toBeCloseTo(legacy?.h ?? -1, 1)
    expect(parseColor('oklch(0.7 0.15 240)')).toEqual({ l: 0.7, c: 0.15, h: 240, a: 1 })
  })

  it('reads a percentage chroma against 0.4, as the specification says', () => {
    expect(parseColor('oklch(0.7 50% 240)')?.c).toBeCloseTo(0.2, 5)
  })

  it('refuses a named colour rather than half-supporting them', () => {
    expect(parseColor('rebeccapurple')).toBeNull()
  })

  it('refuses the comma syntax where CSS never allowed it', () => {
    expect(parseColor('oklch(0.7, 0.15, 240)')).toBeNull()
    expect(parseColor('rgb(255, 0, 0 / 0.5)')).toBeNull()
  })

  it('refuses a mixture of percentages and numbers in legacy rgb', () => {
    expect(parseColor('rgb(100%, 0, 0)')).toBeNull()
  })

  it('gives a grey no hue, because it has none to give', () => {
    // The angle of a rounding error is not a hue, and a picker that trusts it
    // spins its hue strip when the handle passes through the neutral column.
    expect(parseColor('#808080')?.c).toBe(0)
    expect(parseColor('#808080')?.h).toBe(0)
  })
})

describe('formatColor', () => {
  it('round-trips a hex colour', () => {
    const parsed = parseColor('#a78bfa')
    expect(parsed).not.toBeNull()
    expect(formatColor(parsed!, 'hex')).toBe('#a78bfa')
  })

  it('writes the alpha channel only when there is one', () => {
    const opaque = parseColor('#a78bfa')!
    expect(formatColor(opaque, 'hex')).toHaveLength(7)
    expect(formatColor({ ...opaque, a: 0.5 }, 'hex')).toHaveLength(9)
    expect(formatColor({ ...opaque, a: 0.5 }, 'oklch')).toContain(' / 0.5')
  })

  it('writes each notation in its own syntax', () => {
    const colour = parseColor('#a78bfa')!
    expect(formatColor(colour, 'oklch')).toMatch(/^oklch\(/)
    expect(formatColor(colour, 'p3')).toMatch(/^color\(display-p3 /)
  })
})

describe('colorFormat', () => {
  it('names the notation a string is written in, and falls back to hex', () => {
    expect(colorFormat('oklch(0.7 0.1 240)')).toBe('oklch')
    expect(colorFormat('color(display-p3 1 0 0)')).toBe('p3')
    expect(colorFormat('rgb(255 0 0)')).toBe('hex')
  })
})

describe('fitGamut', () => {
  it('gives up chroma and keeps lightness and hue', () => {
    // The naive fix is to clip each channel, which moves the hue and darkens
    // the colour together — a vivid blue comes back purple.
    const wild = { l: 0.7, c: 0.4, h: 240, a: 1 }
    expect(inGamut(wild)).toBe(false)
    const fitted = fitGamut(wild)
    expect(fitted.l).toBe(wild.l)
    expect(fitted.h).toBe(wild.h)
    expect(fitted.c).toBeLessThan(wild.c)
    expect(inGamut(fitted)).toBe(true)
  })

  it('leaves a colour that already fits exactly as it was', () => {
    const tame = { l: 0.5, c: 0.05, h: 120, a: 1 }
    expect(fitGamut(tame)).toBe(tame)
  })
})

describe('maxChroma', () => {
  it('is zero at both ends, where there is no colour to have', () => {
    expect(maxChroma(0, 240)).toBe(0)
    expect(maxChroma(1, 240)).toBe(0)
  })

  it('is wider in Display P3 than in sRGB', () => {
    expect(maxChroma(0.6, 140, 'p3')).toBeGreaterThan(maxChroma(0.6, 140, 'srgb'))
  })

  it('is the edge: one step past it leaves the gamut', () => {
    const edge = maxChroma(0.6, 140)
    expect(inGamut({ l: 0.6, c: edge, h: 140, a: 1 })).toBe(true)
    expect(inGamut({ l: 0.6, c: edge + 0.01, h: 140, a: 1 })).toBe(false)
    expect(close(edge, edge)).toBe(true)
  })
})
