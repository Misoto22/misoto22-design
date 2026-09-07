import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { RadarChart, type ChartConfig } from '../index'

const config = {
  current: { label: 'Current' },
  target: { label: 'Target' },
} satisfies ChartConfig

const data = [
  { skill: 'Design', current: 80, target: 95 },
  { skill: 'Build', current: 62, target: 90 },
  { skill: 'Ship', current: 74, target: 88 },
]

function chart(props: { fillOpacity?: number; isClickable?: boolean } = {}) {
  return (
    <RadarChart title="Team profile" config={config} data={data} angleDataKey="skill">
      <RadarChart.PolarAngleAxis dataKey="skill" />
      <RadarChart.Radar dataKey="current" variant="filled" {...props} />
    </RadarChart>
  )
}

/**
 * The default fill is a CSS `calc()` wearing a number's type, because
 * `--chart-fill` holds a different value on each ground and the component must
 * not know which ground it is on. Multiplying that string by the dim factor
 * turned it into NaN — which React drops with a warning, leaving the SVG
 * default of `fill-opacity: 1`. So every filled radar painted at full strength
 * instead of 0.31, two overlapping series hid each other, and the only signal
 * was a console line naming an attribute rather than a component.
 */
describe('a filled radar', () => {
  const warn = vi.spyOn(console, 'error').mockImplementation(() => {})
  beforeEach(() => warn.mockClear())
  afterEach(() => warn.mockClear())

  const fill = (container: HTMLElement) =>
    container.querySelector('.recharts-radar-polygon path')?.getAttribute('fill-opacity')

  it('reaches the attribute as a calc, not as NaN', () => {
    const { container } = render(chart())

    expect(fill(container)).toMatch(/^calc\(var\(--chart-fill\) \* [\d.]+\)$/)
    expect(fill(container)).not.toBe('NaN')
  })

  it('says nothing to the console while doing it', () => {
    render(chart())

    const complaints = warn.mock.calls.filter((call) => String(call[0]).includes('NaN'))
    expect(complaints).toEqual([])
  })

  /**
   * The dim factor folds into the calc rather than multiplying it, or the
   * string is coerced and the bug is back in the one state that needs it most:
   * a dimmed fill is what makes the picked series readable.
   */
  it('folds the dim factor into the calc rather than multiplying it', () => {
    const { container } = render(chart({ isClickable: true }))

    expect(fill(container)).toMatch(/^calc\(var\(--chart-fill\) \* [\d.]+\)$/)
  })

  /** A caller who passes a number still gets a number. */
  it('leaves an explicit opacity a number', () => {
    const { container } = render(chart({ fillOpacity: 0.5 }))

    expect(fill(container)).toBe('0.5')
  })
})
