import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Heatmap, type HeatmapCell } from './Heatmap'

const COLUMNS = ['00', '03', '06']
const ROWS = ['Mon', 'Tue']
const CELLS: HeatmapCell[] = ROWS.flatMap((row) =>
  COLUMNS.map((column) => ({ row, column, value: 1 })),
)

describe('the table layout', () => {
  it('lays the grid out as a fixed table, so a cell with no visible content still keeps a width', () => {
    // Every cell's printed reading is `sr-only`, so automatic layout has no
    // content to size a DATA column by and hands the row-header column all the
    // slack instead — measured in a consumer at 1440px, 919 of 1035px went to
    // the header and every one of a year's 392 calendar cells came out at 0px.
    // `table-fixed` stops the algorithm from reading cell content at all,
    // dividing the table's own width among the columns instead.
    const { container } = render(<Heatmap title="Load" columns={COLUMNS} rows={ROWS} cells={CELLS} />)

    expect(container.querySelector('table')).toHaveClass('table-fixed')
  })

  it('gives the row-header column its own width, since fixed layout cannot read one off a hidden cell', () => {
    // The corner cell in the table's first row is `sr-only` — `position:
    // absolute` — and fixed layout only ever reads a column's width from a
    // cell in that row, so a width placed there is never seen by the column it
    // sits in. A `col` is read regardless of which cell in the column, or which
    // row, is hidden.
    const { container } = render(<Heatmap title="Load" columns={COLUMNS} rows={ROWS} cells={CELLS} />)

    const [rowHeaderCol] = container.querySelectorAll('colgroup col')
    expect(rowHeaderCol).toHaveClass('w-20')
  })
})
