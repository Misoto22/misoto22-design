import { describe, expect, it } from 'vitest'
import { clampToRange, decimalsForStep, parseNumber, snapToStep } from './numeric'

describe('decimalsForStep', () => {
  it('reads the precision off a decimal step', () => {
    expect(decimalsForStep(1)).toBe(0)
    expect(decimalsForStep(0.1)).toBe(1)
    expect(decimalsForStep(0.001)).toBe(3)
  })

  it('reads it off an exponential one, which has no point to split on', () => {
    // `String(0.0000001)` is "1e-7". Split on '.', that is zero decimals, and
    // every snapped value would round to a whole number.
    expect(decimalsForStep(1e-7)).toBe(7)
  })

  it('treats a step that is not a step as no precision at all', () => {
    expect(decimalsForStep(0)).toBe(0)
    expect(decimalsForStep(Number.NaN)).toBe(0)
  })
})

describe('snapToStep', () => {
  it('rounds to the nearest step', () => {
    expect(snapToStep(37, 5, 0)).toBe(35)
    expect(snapToStep(38, 5, 0)).toBe(40)
  })

  it('measures from the minimum, the way the HTML step algorithm does', () => {
    // From 5 in tens, the reachable values are 5, 15, 25 — not 10 and 20.
    expect(snapToStep(12, 10, 5)).toBe(15)
  })

  it('rounds the result to the step, so binary float error never reaches a readout', () => {
    expect(snapToStep(0.30000000000000004, 0.1, 0)).toBe(0.3)
    expect(snapToStep(1.2999999999, 0.1, 1)).toBe(1.3)
  })

  it('leaves the value alone when there is no usable step', () => {
    expect(snapToStep(37.4, 0, 0)).toBe(37.4)
  })
})

describe('clampToRange', () => {
  it('holds a value inside the range', () => {
    expect(clampToRange(5, 10, 20)).toBe(10)
    expect(clampToRange(25, 10, 20)).toBe(20)
    expect(clampToRange(15, 10, 20)).toBe(15)
  })

  it('works against an unbounded end', () => {
    expect(clampToRange(-40, Number.NEGATIVE_INFINITY, 0)).toBe(-40)
  })
})

describe('parseNumber', () => {
  it('reads a number out of the surrounding space', () => {
    expect(parseNumber(' 12 ')).toBe(12)
    expect(parseNumber('-1.5')).toBe(-1.5)
  })

  it('reports an empty box as nothing rather than as zero', () => {
    // `Number('')` is 0. Left to it, clearing the box commits zero on the
    // keystroke that emptied it.
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('   ')).toBeNull()
  })

  it('reports a half-typed number as nothing', () => {
    expect(parseNumber('-')).toBeNull()
    expect(parseNumber('1.2.3')).toBeNull()
    expect(parseNumber('Infinity')).toBeNull()
  })
})
