import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Facet } from './Facet'
import { buildPanels, niceDomain, statsOf } from './panels'
import { Sparkline } from '../Sparkline/Sparkline'

interface Row extends Record<string, unknown> {
  month: string
  channel: string
  visitors: number
}

/**
 * Three channels whose statistics disagree with each other on purpose: the
 * biggest peak, the biggest total and the highest last reading are three
 * different channels, so a sort that silently ignores its key cannot pass.
 */
const rows: Row[] = [
  { month: 'Jan', channel: 'Organic', visitors: 300 },
  { month: 'Feb', channel: 'Organic', visitors: 200 },
  { month: 'Mar', channel: 'Organic', visitors: 20 },
  { month: 'Jan', channel: 'Paid', visitors: 50 },
  { month: 'Feb', channel: 'Paid', visitors: 40 },
  { month: 'Mar', channel: 'Paid', visitors: 45 },
  { month: 'Jan', channel: 'Direct', visitors: 10 },
  { month: 'Feb', channel: 'Direct', visitors: 20 },
  { month: 'Mar', channel: 'Direct', visitors: 60 },
]

const options = { by: 'channel', value: 'visitors', xDataKey: 'month' } as const

/** Many groups, each flatter than the last, for the cap. */
const many: Row[] = Array.from({ length: 20 }, (_, group) =>
  ['Jan', 'Feb'].map((month) => ({
    month,
    channel: `Channel ${group + 1}`,
    visitors: (20 - group) * 10,
  })),
).flat()

const names = (data: Row[], overrides = {}) =>
  buildPanels(data, { ...options, ...overrides }).panels.map((panel) => panel.name)

describe('grouping', () => {
  it('makes one panel per distinct value of the split field', () => {
    const { panels, total } = buildPanels(rows, options)

    expect(total).toBe(3)
    expect(panels).toHaveLength(3)
    expect(panels.flatMap((panel) => panel.rows)).toHaveLength(rows.length)
  })

  it('keeps a group\'s rows together and in their original order', () => {
    const { panels } = buildPanels(rows, options)
    const organic = panels.find((panel) => panel.name === 'Organic')

    expect(organic?.rows.map((row) => row.month)).toEqual(['Jan', 'Feb', 'Mar'])
    expect(organic?.rows.every((row) => row.channel === 'Organic')).toBe(true)
  })

  it('drops a row that says nothing about which group it is in', () => {
    // A panel labelled "undefined" is a defect the reader is then asked to
    // interpret, and there is no honest answer to what it contains.
    const withHole = [...rows, { month: 'Jan', channel: null, visitors: 999 } as unknown as Row]

    expect(names(withHole)).toEqual(names(rows))
    expect(buildPanels(withHole, options).panels.flatMap((p) => p.rows)).toHaveLength(rows.length)
  })
})

describe('the shared domain', () => {
  it('hands every panel the same scale', () => {
    const { panels, domain } = buildPanels(rows, options)
    const distinct = new Set(panels.map((panel) => panel.domain.join(':')))

    // The entire point of the component. On independent scales Direct's 60 and
    // Organic's 300 draw the same shape, and the comparison the reader opened
    // the grid to make is not merely lost — it is inverted.
    expect(distinct.size).toBe(1)
    expect(domain).toEqual([0, 300])
  })

  it('covers the largest group, not the first one', () => {
    const [, max] = buildPanels(rows, options).domain ?? []

    expect(max).toBeGreaterThanOrEqual(300)
  })

  it('gives each panel its own scale only when asked', () => {
    const { panels, domain } = buildPanels(rows, { ...options, scales: 'independent' })
    const paid = panels.find((panel) => panel.name === 'Paid')
    const organic = panels.find((panel) => panel.name === 'Organic')

    expect(domain).toBeNull()
    expect(paid?.domain).not.toEqual(organic?.domain)
    expect(paid?.domain).toEqual([0, 50])
  })

  it('rounds the domain to numbers an axis can label', () => {
    // An exact extent of [0, 314] puts ticks at 78.5 and 157: the panels would
    // be comparable and the numbers unreadable, which is half a component.
    expect(niceDomain([0, 314])).toEqual([0, 350])
    expect(niceDomain([0, 41])).toEqual([0, 50])
  })

  it('starts at zero by default, and stops when the reading is elsewhere', () => {
    expect(niceDomain([18, 24])).toEqual([0, 25])
    expect(niceDomain([18, 24], { includeZero: false })).toEqual([18, 24])
  })

  it('gives a group whose values never move a span rather than no plot', () => {
    expect(niceDomain([7, 7], { includeZero: false })[0]).toBeLessThan(
      niceDomain([7, 7], { includeZero: false })[1],
    )
  })

  it('respects a pinned domain over both the data and the scales option', () => {
    const { panels } = buildPanels(rows, {
      ...options,
      scales: 'independent',
      domain: [0, 1000],
    })

    expect(panels.every((panel) => panel.domain[1] === 1000)).toBe(true)
  })
})

describe('statistics', () => {
  it('reads the last row that carried a number, not the last row', () => {
    // A trailing row of nulls is a gap in the data, not a series that fell to
    // zero, and sorting a grid by "where it ended up" must not confuse the two.
    const trailing = [
      { month: 'Jan', channel: 'A', visitors: 10 },
      { month: 'Feb', channel: 'A', visitors: 40 },
      { month: 'Mar', channel: 'A', visitors: null },
    ] as unknown as Row[]

    expect(statsOf(trailing, 'visitors').last).toBe(40)
    expect(statsOf(trailing, 'visitors').count).toBe(2)
  })

  it('answers zero rather than Infinity for a group with no numbers', () => {
    expect(statsOf([], 'visitors')).toMatchObject({ min: 0, max: 0, sum: 0, count: 0 })
  })
})

describe('sorting', () => {
  it('leads with the biggest peak, so eye order is rank order', () => {
    expect(names(rows)).toEqual(['Organic', 'Direct', 'Paid'])
  })

  it('sorts by total, which is a different question from the peak', () => {
    expect(names(rows, { sort: 'sum' })).toEqual(['Organic', 'Paid', 'Direct'])
  })

  it('sorts by where each group ended up', () => {
    expect(names(rows, { sort: 'last' })).toEqual(['Direct', 'Paid', 'Organic'])
  })

  it('sorts by name A to Z without being told the direction', () => {
    // A statistic reads biggest first and a name reads A to Z. Making the call
    // site say which is how every "sorted descending by name" grid happens.
    expect(names(rows, { sort: 'name' })).toEqual(['Direct', 'Organic', 'Paid'])
    expect(names(rows, { sort: 'name', order: 'desc' })).toEqual(['Paid', 'Organic', 'Direct'])
  })

  it('numbers groups the way a person reads them', () => {
    expect(names(many, { sort: 'name', limit: false }).slice(0, 3)).toEqual([
      'Channel 1',
      'Channel 2',
      'Channel 3',
    ])
  })

  it('takes an explicit order the data does not carry', () => {
    expect(names(rows, { sort: ['Paid', 'Direct', 'Organic'] })).toEqual([
      'Paid',
      'Direct',
      'Organic',
    ])
  })

  it('keeps a name the explicit order forgot rather than dropping it', () => {
    // A partial list is a partial instruction. Dropping the rest would lose
    // data to a typo in a prop.
    expect(names(rows, { sort: ['Paid'] })).toEqual(['Paid', 'Organic', 'Direct'])
  })

  it('takes a comparator over the groups own statistics', () => {
    expect(names(rows, { sort: (a, b) => a.stats.min - b.stats.min })).toEqual([
      'Direct',
      'Organic',
      'Paid',
    ])
  })

  it('leaves the data alone when asked for input order', () => {
    expect(names(rows, { sort: 'input' })).toEqual(['Organic', 'Paid', 'Direct'])
  })
})

describe('the cap', () => {
  it('does not silently render forty panels', () => {
    const { panels, total, hidden } = buildPanels(many, options)

    expect(total).toBe(20)
    expect(panels).toHaveLength(12)
    expect(hidden).toBe(8)
  })

  it('lifts the cap only when the call site says so', () => {
    expect(buildPanels(many, { ...options, limit: false }).panels).toHaveLength(20)
  })

  it('sums the tail into one panel rather than dropping it', () => {
    const { panels, hidden } = buildPanels(many, { ...options, limit: 3, overflow: 'fold' })
    const other = panels.at(-1)

    expect(panels).toHaveLength(4)
    expect(hidden).toBe(17)
    expect(other?.isOther).toBe(true)
    expect(other?.size).toBe(17)
  })

  it('folds the tail at each category, not into a pile of rows', () => {
    const { panels } = buildPanels(many, { ...options, limit: 18, overflow: 'fold' })
    const other = panels.at(-1)

    // Two source groups over two months is four rows; concatenating them gives
    // a series that doubles back on itself, which is a scribble rather than a
    // reading. Channels 19 and 20 hold 20 and 10 at each month.
    expect(other?.rows).toHaveLength(2)
    expect(other?.rows.map((row) => row.visitors)).toEqual([30, 30])
    expect(other?.rows.map((row) => row.month)).toEqual(['Jan', 'Feb'])
    expect(other?.rows.every((row) => row.channel === 'Other')).toBe(true)
  })

  it('scales to what is drawn, not to what the cap left out', () => {
    // The excluded groups are the small ones here; letting them into the
    // domain would only add dead space under every panel.
    const capped = buildPanels(many, { ...options, limit: 3 })
    const all = buildPanels(many, { ...options, limit: false })

    expect(capped.domain).toEqual(all.domain)
    expect(capped.panels.every((panel) => panel.domain === capped.panels[0]?.domain)).toBe(true)
  })
})

describe('the rendered grid', () => {
  const panel = (name: string, data: Row[], domain: [number, number]) => (
    <Sparkline
      label={`${name} visitors`}
      data={data.map((row) => row.visitors)}
      domain={domain}
    />
  )

  it('is one figure, named by its title', () => {
    render(
      <Facet title="Visitors by channel" data={rows} by="channel" value="visitors">
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    expect(screen.getByRole('figure', { name: 'Visitors by channel' })).toBeInTheDocument()
  })

  it('labels every panel, so a screen reader can tell them apart', () => {
    render(
      <Facet title="Visitors by channel" data={rows} by="channel" value="visitors" hideDataTable>
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(within(items[0] as HTMLElement).getByText('Organic')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Direct')).toBeInTheDocument()
  })

  it('keeps the panel name in the accessibility tree when it is not printed', () => {
    render(
      <Facet
        title="Visitors by channel"
        data={rows}
        by="channel"
        value="visitors"
        showPanelNames={false}
        hideDataTable
      >
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    // Hidden from sight, not from a screen reader: `sr-only` rather than a
    // branch that renders nothing.
    expect(screen.getByText('Organic')).toBeInTheDocument()
  })

  it('says how many groups are missing instead of dropping them quietly', () => {
    render(
      <Facet title="Visitors by channel" data={many} by="channel" value="visitors" limit={3}>
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    expect(screen.getByText('3 of 20 shown; 17 not drawn.')).toBeInTheDocument()
  })

  it('names the fold in the note when the tail is summed', () => {
    render(
      <Facet
        title="Visitors by channel"
        data={many}
        by="channel"
        value="visitors"
        xDataKey="month"
        limit={3}
        overflow="fold"
      >
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    expect(screen.getByText('3 of 20 shown; the other 17 are summed into Other.')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('prints one legend and one axis label rather than one per panel', () => {
    render(
      <Facet
        title="Visitors by channel"
        data={rows}
        by="channel"
        value="visitors"
        hideDataTable
        legend={<span>Visitors</span>}
        yLabel="Visitors per month"
        xLabel="Month"
      >
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    expect(screen.getAllByText('Visitors per month')).toHaveLength(1)
    expect(screen.getAllByText('Month')).toHaveLength(1)
  })

  it('says what happened instead of drawing an empty grid', () => {
    render(
      <Facet title="Visitors by channel" data={[]} by="channel" value="visitors">
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    expect(screen.getByText('No data in this range')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('keeps the figure named when there is nothing to draw', () => {
    render(
      <Facet title="Visitors by channel" data={[]} by="channel" value="visitors">
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    expect(screen.getByRole('figure', { name: 'Visitors by channel' })).toBeInTheDocument()
  })

  it('ships the rows as a table, once for the whole grid', () => {
    render(
      <Facet
        title="Visitors by channel"
        data={rows}
        by="channel"
        value="visitors"
        xDataKey="month"
      >
        {(group) => panel(group.name, group.rows, group.domain)}
      </Facet>,
    )

    const table = screen.getByRole('table', { name: 'Visitors by channel' })
    expect(within(table).getAllByRole('row')).toHaveLength(rows.length + 1)
  })
})
