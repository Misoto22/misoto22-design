import { describe, expect, it } from 'vitest'
import { LAWS, ORIGINAL_SET } from '../principles'
import { COMPONENTS } from '../registry'

describe('the laws', () => {
  it('are numbered in order, with no gaps', () => {
    expect(LAWS.map((law) => law.n)).toEqual(
      LAWS.map((_, index) => String(index + 1).padStart(2, '0')),
    )
  })

  it('each say what they rule out', () => {
    // A principle that only says what to aim for settles no argument, which is
    // the page's own claim about itself.
    expect(LAWS.filter((law) => !law.rules_out.trim())).toEqual([])
  })

  /**
   * The demonstrations on the principles page are built from this set. If a
   * name here stopped existing the page would still render — with a component
   * that is no longer part of the system standing in for the argument.
   */
  it('name only primitives the library still ships', () => {
    const dirs = new Set(COMPONENTS.map((entry) => entry.dir))
    expect(ORIGINAL_SET.filter((name) => !dirs.has(name))).toEqual([])
  })
})
