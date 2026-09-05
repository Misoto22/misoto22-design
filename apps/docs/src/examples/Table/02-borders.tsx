import { TBody, TD, TH, THead, TR, Table, type TableBorders } from '@misoto22/design'

const OPTIONS: { value: TableBorders; note: string }[] = [
  { value: 'rows', note: 'the default — read down a column' },
  { value: 'grid', note: 'dense numbers, columns kept apart' },
  { value: 'bordered', note: 'loose on a page, not inside a card' },
  { value: 'bordered-grid', note: 'both' },
]

export function Example() {
  return (
    <div className="flex w-full flex-col gap-8">
      {OPTIONS.map((option) => (
        <div key={option.value} className="flex flex-col gap-2">
          <p className="m-0 eyebrow text-(--ink-3-aa)">
            {option.value} — {option.note}
          </p>
          <Table caption={`${option.value} example`} borders={option.value} density="compact">
            <THead>
              <TR>
                <TH>Region</TH>
                <TH align="end">Orders</TH>
                <TH align="end">Revenue</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD>Australia</TD>
                <TD align="end" className="tabular-nums">1,204</TD>
                <TD align="end" className="tabular-nums">$48,210</TD>
              </TR>
              <TR>
                <TD>Japan</TD>
                <TD align="end" className="tabular-nums">862</TD>
                <TD align="end" className="tabular-nums">$31,940</TD>
              </TR>
            </TBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
