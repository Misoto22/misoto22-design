import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Switch,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@misoto22/design'

/**
 * One small screen, rendered once per theme.
 *
 * Deliberately not a colour swatch: a theme that only changed hues would look
 * fine as five squares, and the point of this page is that the corners, the
 * rules, the face and the row height move too. Those only show on real
 * furniture, so this carries the pieces that read them — a bordered card, a
 * ruled table, a control with a radius, and a heading in whichever face the
 * theme picked.
 */
export function ThemeSpecimen() {
  return (
    <div className="flex flex-col gap-4 bg-(--paper) p-4">
      <Card>
        <CardHeader>
          <CardTitle>Deploys</CardTitle>
          <Badge tone="success">passing</Badge>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <Table caption="Recent deploys" borders="grid" density="compact">
            <THead>
              <TR>
                <TH>Branch</TH>
                <TH align="end">Build</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD>main</TD>
                <TD align="end" className="tabular-nums">2m 14s</TD>
              </TR>
              <TR>
                <TD>codex/themes</TD>
                <TD align="end" className="tabular-nums">1m 02s</TD>
              </TR>
            </TBody>
          </Table>
          <Input aria-label="Filter" placeholder="branch…" />
          <label className="flex items-center gap-2.5 text-[13px] text-(--ink-2)">
            <Switch defaultChecked aria-label="Notify on failure" />
            Notify on failure
          </label>
        </CardBody>
      </Card>
      <div className="flex gap-2">
        <Button size="sm">Deploy</Button>
        <Button size="sm" variant="secondary">
          History
        </Button>
      </div>
    </div>
  )
}
