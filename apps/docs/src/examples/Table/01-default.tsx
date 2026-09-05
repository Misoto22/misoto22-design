import { Badge, TBody, TD, TH, THead, TR, Table } from '@misoto22/design'

const ROWS = [
  { sha: 'a1b2c3d', branch: 'main', duration: '2m 14s', state: 'passed' },
  { sha: '9f8e7d6', branch: 'codex/ui-library', duration: '2m 41s', state: 'passed' },
  { sha: '4c5b6a7', branch: 'codex/photo-cache', duration: '1m 02s', state: 'failed' },
]

export function Example() {
  return (
    <Table caption="Recent deploys">
      <THead>
        <TR>
          <TH>Commit</TH>
          <TH>Branch</TH>
          <TH className="text-right">Duration</TH>
          <TH>State</TH>
        </TR>
      </THead>
      <TBody>
        {ROWS.map((row) => (
          <TR key={row.sha}>
            <TD className="font-mono text-xs">{row.sha}</TD>
            <TD>{row.branch}</TD>
            <TD className="text-right tabular-nums">{row.duration}</TD>
            <TD>
              <Badge tone={row.state === 'passed' ? 'success' : 'danger'}>{row.state}</Badge>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  )
}
