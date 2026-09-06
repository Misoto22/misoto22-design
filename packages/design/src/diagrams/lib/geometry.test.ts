import { describe, expect, it } from 'vitest'
import { inflate, round, textWidth, union, viewBoxOf, wrapText } from './geometry'
import { plateHeight, PLATE } from './marks'

describe('estimating a text extent', () => {
  it('gives a CJK ideograph a full em', () => {
    expect(textWidth('图', 10)).toBe(10)
    expect(textWidth('图表', 10)).toBe(20)
  })

  it('gives a capital more room than a lowercase letter', () => {
    expect(textWidth('W', 10)).toBeGreaterThan(textWidth('w', 10))
  })

  it('gives a narrow letter less', () => {
    expect(textWidth('i', 10)).toBeLessThan(textWidth('n', 10))
  })

  it('scales with the size', () => {
    expect(textWidth('Postgres', 20)).toBeCloseTo(textWidth('Postgres', 10) * 2)
  })
})

describe('wrapping a label', () => {
  it('leaves a label that fits on one line', () => {
    expect(wrapText('API', 13, 200)).toEqual(['API'])
  })

  it('breaks on a space', () => {
    const lines = wrapText('Load Balancer Frontend', 13, 90, 2)
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join(' ')).toContain('Load')
  })

  it('breaks CJK between characters, which have no spaces to break on', () => {
    const lines = wrapText('负载均衡器与网关', 13, 40, 2)
    expect(lines.length).toBe(2)
  })

  it('ellipsises rather than silently dropping the tail', () => {
    // Losing the end of a label is how a diagram comes to say something it does
    // not mean. The ellipsis is the admission that it was truncated.
    const lines = wrapText('An extremely long service name that will not fit at all', 13, 60, 2)
    expect(lines).toHaveLength(2)
    expect(lines[1]).toMatch(/…$/)
  })

  it('lets one unbreakable word overflow rather than splitting it', () => {
    // `TenantMainMiddleware` broken across two lines is harder to read than one
    // that runs slightly wide — and the caller sized the box from `textWidth`.
    expect(wrapText('TenantMainMiddleware', 13, 30, 2)).toEqual(['TenantMainMiddleware'])
  })
})

describe('boxes', () => {
  it('unions to the smallest rectangle containing them all', () => {
    expect(union([{ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 5, w: 10, h: 30 }])).toEqual({
      x: 0,
      y: 0,
      w: 30,
      h: 35,
    })
  })

  it('has nothing to union when there is nothing', () => {
    expect(union([])).toBeNull()
  })

  it('grows on every side', () => {
    expect(inflate({ x: 10, y: 10, w: 10, h: 10 }, 5)).toEqual({ x: 5, y: 5, w: 20, h: 20 })
  })

  it('writes a viewBox rounded to a tenth', () => {
    expect(viewBoxOf({ x: 0.123, y: 1.987, w: 10, h: 20 })).toBe('0.1 2 10 20')
  })

  it('rounds coordinates to a tenth', () => {
    expect(round(1.0 / 3)).toBe(0.3)
  })
})

describe('sizing a plate to its content', () => {
  it('treats a declared height as a floor, not a ceiling', () => {
    // A specification asking for 40 and then printing a name and a qualifier in
    // it gets a plate that holds them. Honouring the 40 would print the
    // qualifier through the bottom rule.
    expect(plateHeight(1, true, true, 40)).toBeGreaterThan(40)
  })

  it('keeps a declared height that is already big enough', () => {
    expect(plateHeight(1, false, true, 300)).toBe(300)
  })

  it('grows for a second line of name', () => {
    expect(plateHeight(2, true, true)).toBe(plateHeight(1, true, true) + PLATE.lineStep)
  })

  it('grows for a qualifier', () => {
    expect(plateHeight(1, true, true)).toBeGreaterThan(plateHeight(1, false, true))
  })

  it('is shorter without an eyebrow, which is the row it saves', () => {
    expect(plateHeight(1, true, false)).toBe(
      plateHeight(1, true, true) - PLATE.riseWithoutEyebrow,
    )
  })
})
