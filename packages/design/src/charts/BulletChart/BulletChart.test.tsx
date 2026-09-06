import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BulletChart } from './BulletChart'

/** Every mark of one kind, in document order. */
function marks(container: HTMLElement, slot: string): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`)]
}

/**
 * A mark's extent along the inline axis, as a percentage of its track.
 *
 * Read off the inline style rather than off a class, because the geometry IS
 * the encoding here: the bar's length is the measurement, and a percentage
 * that is wrong is a chart that is wrong.
 */
function inlineSize(mark: HTMLElement): string {
  return mark.style.getPropertyValue('inline-size')
}

function inlineStart(mark: HTMLElement): string {
  return mark.style.getPropertyValue('inset-inline-start')
}

describe('the scale', () => {
  it('places the measure as a share of its own domain', () => {
    const { container } = render(
      <BulletChart
        title="Service levels"
        data={[{ name: 'Uptime', value: 75, target: 90 }]}
        domain={[0, 100]}
      />,
    )

    expect(inlineSize(marks(container, 'bullet-bar')[0]!)).toBe('75%')
    expect(inlineStart(marks(container, 'bullet-target')[0]!)).toBe('90%')
  })

  it('clamps a measure that runs past the end of its scale', () => {
    const { container } = render(
      <BulletChart title="Service levels" data={[{ name: 'Signups', value: 150 }]} domain={[0, 100]} />,
    )

    // A bar drawn past its own track would overflow the row and read as a
    // longer bar than the scale can express. Clamping keeps the picture inside
    // the scale; the printed number is what says how far past it went.
    expect(inlineSize(marks(container, 'bullet-bar')[0]!)).toBe('100%')
    const table = screen.getByRole('table', { name: 'Service levels' })
    expect(within(table).getByRole('row', { name: /Signups/ })).toHaveTextContent('150')
  })

  it('gives each measure its own scale when it carries one', () => {
    const { container } = render(
      <BulletChart
        title="Service levels"
        data={[
          { name: 'Uptime', value: 99, domain: [95, 100] },
          { name: 'Signups', value: 20, domain: [0, 100] },
        ]}
      />,
    )

    // The same 99 and 20 on one shared scale would be a full bar and a stub.
    // Per-measure domains are the whole reason a latency can sit above a
    // conversion rate in one chart.
    const bars = marks(container, 'bullet-bar')
    expect(inlineSize(bars[0]!)).toBe('80%')
    expect(inlineSize(bars[1]!)).toBe('20%')
  })
})

describe('the qualitative bands', () => {
  it('turns two bounds into three bands that partition the scale', () => {
    const { container } = render(
      <BulletChart
        title="Service levels"
        data={[{ name: 'Uptime', value: 70 }]}
        ranges={[50, 80]}
        domain={[0, 100]}
      />,
    )

    // `ranges` are upper bounds, so [50, 80] on a 0–100 scale is 0–50, 50–80,
    // 80–100 — the last band always running to the top of the scale, or the
    // reader is left with a strip of unexplained ground at the end of the row.
    const bands = marks(container, 'bullet-band')
    expect(bands.map(inlineStart)).toEqual(['0%', '50%', '80%'])
    expect(bands.map(inlineSize)).toEqual(['50%', '30%', '20%'])
  })

  it('drops a bound that falls outside the scale rather than drawing a band nobody can see', () => {
    const { container } = render(
      <BulletChart
        title="Service levels"
        data={[{ name: 'Uptime', value: 70, ranges: [50, 400] }]}
        domain={[0, 100]}
      />,
    )

    expect(marks(container, 'bullet-band')).toHaveLength(2)
  })

  it('draws no target rule when a measure has none', () => {
    const { container } = render(
      <BulletChart title="Service levels" data={[{ name: 'Uptime', value: 70 }]} domain={[0, 100]} />,
    )

    expect(marks(container, 'bullet-target')).toHaveLength(0)
  })
})

describe('the table view', () => {
  it('carries every measure, its target and its band bounds', () => {
    render(
      <BulletChart
        title="Service levels"
        data={[{ name: 'Uptime', value: 99.4, target: 99.9, ranges: [98, 99.5] }]}
        domain={[95, 100]}
      />,
    )

    // The graphic itself is out of the accessibility tree — it repeats what
    // the row already prints — so this table is the whole reading for someone
    // who cannot see it, and it has to carry the context too, not just the
    // number.
    const table = screen.getByRole('table', { name: 'Service levels' })
    const row = within(table).getByRole('row', { name: /Uptime/ })
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      '99.4',
      '99.9',
      '98, 99.5',
    ])
  })
})

describe('the empty state', () => {
  it('says what happened instead of drawing an empty stack of rows', () => {
    render(<BulletChart title="Service levels" data={[]} />)

    expect(screen.getByText('No data in this range')).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: 'Service levels' })).toBeInTheDocument()
  })
})

describe('the target rule', () => {
  it('stays inside the track when the target is the bottom of the scale', () => {
    // "Open incidents, target 0" is the measure whose whole point is the
    // distance from its target, and a half-width pull put half the rule outside
    // the track — where `overflow-hidden` took it, and the row drew no target.
    const { container } = render(
      <BulletChart
        title="Incidents"
        data={[{ name: 'Open incidents', value: 3, target: 0, ranges: [1, 4], scale: [0, 8] }]}
      />,
    )
    const rule = container.querySelector('[data-slot="bullet-target"]') as HTMLElement
    expect(rule).toBeInTheDocument()
    expect(rule.style.insetInlineStart).toBe('0%')
    expect(rule.style.marginInlineStart).toBe('0px')
  })

  it('stays inside it at the top of the scale too', () => {
    const { container } = render(
      <BulletChart
        title="Uptime"
        data={[{ name: 'Uptime', value: 99, target: 100, ranges: [98, 99.5], scale: [98, 100] }]}
      />,
    )
    const rule = container.querySelector('[data-slot="bullet-target"]') as HTMLElement
    expect(rule.style.insetInlineStart).toBe('100%')
    expect(rule.style.marginInlineStart).toBe('-2px')
  })

  it('pulls back by its own width in proportion to where it sits', () => {
    // The rule that makes both ends work: flush at 0, flush at 1, and centred
    // on its position everywhere between. Read off the rendered share rather
    // than a hard-coded domain, since the domain widens to hold the data.
    const { container } = render(
      <BulletChart
        title="Budget"
        data={[{ name: 'Error budget', value: 38, target: 50, ranges: [25, 60] }]}
      />,
    )
    const rule = container.querySelector('[data-slot="bullet-target"]') as HTMLElement
    const share = Number.parseFloat(rule.style.insetInlineStart) / 100
    expect(share).toBeGreaterThan(0)
    expect(share).toBeLessThan(1)
    expect(Number.parseFloat(rule.style.marginInlineStart)).toBeCloseTo(-2 * share, 4)
  })
})
