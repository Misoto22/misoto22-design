import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { WaterfallChart, type WaterfallStep } from './WaterfallChart'

/**
 * The cascade, read back out of the table view the chart also renders: one row
 * per step, its signed change and the running total it leaves behind. The
 * arithmetic is the chart, so this is where it gets checked.
 */
function cascade(title: string): [string, string, string][] {
  const table = screen.getByRole('table', { name: title })
  return within(table)
    .getAllByRole('row')
    .filter((row) => within(row).queryAllByRole('rowheader').length > 0)
    .map((row) => {
      const name = within(row).getAllByRole('rowheader')[0]?.textContent ?? ''
      const [change, total] = within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent ?? '')
      return [name, change ?? '', total ?? '']
    })
}

function bridge(steps: WaterfallStep[]) {
  return (
    <WaterfallChart title="Bridge" data={steps}>
      <WaterfallChart.XAxis />
      <WaterfallChart.YAxis />
      <WaterfallChart.Bars />
    </WaterfallChart>
  )
}

describe('the running total', () => {
  it('walks the deltas from the opening total to the closing one', () => {
    render(
      bridge([
        { name: 'FY24', value: 1200, type: 'total' },
        { name: 'New', value: 340 },
        { name: 'Churn', value: -180 },
        { name: 'FY25', type: 'total' },
      ]),
    )

    // The closing bar carries no value of its own, so it is whatever the
    // deltas add up to. A hand-typed end total can disagree with the steps
    // above it, and the chart would draw the disagreement without saying so.
    expect(cascade('Bridge')).toEqual([
      ['FY24', '1,200', '1,200'],
      ['New', '340', '1,540'],
      ['Churn', '-180', '1,360'],
      ['FY25', '0', '1,360'],
    ])
  })

  it('lets a total reset the running figure rather than adding to it', () => {
    render(
      bridge([
        { name: 'Open', value: 100, type: 'total' },
        { name: 'Adjust', value: 50 },
        { name: 'Restated', value: 900, type: 'total' },
        { name: 'Growth', value: 100 },
      ]),
    )

    // A restatement, a subtotal, a new opening balance: a `total` plants the
    // running figure at an absolute number, and everything after it builds
    // from there — 900, not 1,050.
    expect(cascade('Bridge')).toEqual([
      ['Open', '100', '100'],
      ['Adjust', '50', '150'],
      // The gap the restatement closes, which is the fact worth surfacing when
      // an explicit total does not match the steps that led to it.
      ['Restated', '750', '900'],
      ['Growth', '100', '1,000'],
    ])
  })

  it('carries a total straight through negative territory', () => {
    render(
      bridge([
        { name: 'Open', value: 100, type: 'total' },
        { name: 'Loss', value: -260 },
        { name: 'Close', type: 'total' },
      ]),
    )

    expect(cascade('Bridge')).toEqual([
      ['Open', '100', '100'],
      ['Loss', '-260', '-160'],
      ['Close', '0', '-160'],
    ])
  })
})

describe('the connectors', () => {
  it('joins each step to the next one, and stops at the last', () => {
    const { container } = render(
      bridge([
        { name: 'Open', value: 100, type: 'total' },
        { name: 'New', value: 40 },
        { name: 'Close', type: 'total' },
      ]),
    )

    // Three steps, two joins. A connector leaving the last bar would point at
    // a step that does not exist, which is how a reader ends up looking for a
    // fourth category on the axis.
    expect(container.querySelectorAll('line[stroke="var(--chart-cursor)"]')).toHaveLength(2)
  })

  it('leaves them out when the order carries no sequence', () => {
    const { container } = render(
      <WaterfallChart
        title="Bridge"
        data={[
          { name: 'Open', value: 100, type: 'total' },
          { name: 'New', value: 40 },
        ]}
      >
        <WaterfallChart.Bars connectors={false} />
      </WaterfallChart>,
    )

    expect(container.querySelectorAll('line[stroke="var(--chart-cursor)"]')).toHaveLength(0)
  })
})

describe('the bars', () => {
  it('draws one per step, including a step that moved nothing', () => {
    const { container } = render(
      bridge([
        { name: 'Open', value: 100, type: 'total' },
        { name: 'Flat', value: 0 },
        { name: 'Close', type: 'total' },
      ]),
    )

    // A zero delta has no height to draw. It still gets a bar, or the cascade
    // loses a category and the axis stops matching the marks.
    expect(container.querySelectorAll('.recharts-bar-rectangle rect')).toHaveLength(3)
  })

  it('gives a fall the same length as a rise of the same size', () => {
    const { container } = render(
      bridge([
        { name: 'Open', value: 100, type: 'total' },
        { name: 'Up', value: 40 },
        { name: 'Down', value: -40 },
      ]),
    )

    // A floating bar's range has to be handed over low end first, or the
    // engine reads it backwards and every decrease in the cascade collapses to
    // a hairline — which looks like a step that did nothing rather than one
    // that went the other way.
    const [, rise, fall] = [...container.querySelectorAll('.recharts-bar-rectangle rect')].map(
      (rect) => Number(rect.getAttribute('height')),
    )
    expect(fall).toBeCloseTo(rise!, 5)
  })

  it('draws the baseline the totals stand on', () => {
    const { container } = render(
      bridge([
        { name: 'Open', value: 100, type: 'total' },
        { name: 'Loss', value: -260 },
      ]),
    )

    // Without a visible zero the floating bars have to be taken on trust, and
    // a cascade that crosses into negative territory has nothing marking where
    // it did so.
    expect(container.querySelector('.recharts-reference-line')).toBeInTheDocument()
  })

  it('prints the signed change on each step when asked', () => {
    const { container } = render(
      <WaterfallChart
        title="Bridge"
        data={[
          { name: 'Open', value: 100, type: 'total' },
          { name: 'Churn', value: -30 },
        ]}
      >
        <WaterfallChart.Bars showValues />
      </WaterfallChart>,
    )

    // An intermediate bar floats with no baseline under it, so its length is
    // the one thing a reader cannot get off the axis — and the sign is what
    // says which way the cascade went.
    const labels = [...container.querySelectorAll('text')].map((node) => node.textContent)
    expect(labels).toContain('-30')
    expect(labels).toContain('100')
  })
})

describe('the empty state', () => {
  it('says what happened instead of drawing empty axes', () => {
    render(bridge([]))

    expect(screen.getByText('No data in this range')).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: 'Bridge' })).toBeInTheDocument()
  })
})
