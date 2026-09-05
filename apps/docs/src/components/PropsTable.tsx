import { Badge, TBody, TD, TH, THead, TR, Table } from '@misoto22/design'

export interface PropRow {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: string
}

export interface PropsTableProps {
  /** The component these props belong to — used for the table's caption. */
  name: string
  rows: PropRow[]
  /** Type expressions the extractor chose not to enumerate. */
  passthrough: string[]
}

/**
 * A component's props, parsed out of its source.
 *
 * Required props sort first, then alphabetically. That is not cosmetic: the
 * required set is the smallest thing a reader has to understand to use the
 * component at all, and burying `caption` between `className` and `showCaption`
 * hides the one prop that will otherwise be forgotten.
 */
export function PropsTable({ name, rows, passthrough }: PropsTableProps) {
  const sorted = [...rows].sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  if (sorted.length === 0 && passthrough.length === 0) {
    return (
      <p className="m-0 text-sm text-(--ink-3-aa)">
        Takes no props of its own.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sorted.length > 0 && (
        <Table caption={`${name} props`}>
          <THead>
            <TR>
              <TH>Prop</TH>
              <TH>Type</TH>
              <TH>Default</TH>
              <TH>Description</TH>
            </TR>
          </THead>
          <TBody>
            {sorted.map((row) => (
              <TR key={row.name}>
                <TD className="whitespace-nowrap align-top">
                  <span className="font-mono text-xs text-(--ink)">{row.name}</span>
                  {row.required && (
                    <Badge tone="outline" className="ml-2 align-middle">
                      required
                    </Badge>
                  )}
                </TD>
                <TD className="align-top">
                  <code className="font-mono text-xs text-(--ink-2)">{row.type}</code>
                </TD>
                <TD className="align-top">
                  {row.defaultValue ? (
                    <code className="font-mono text-xs text-(--ink-2)">{row.defaultValue}</code>
                  ) : (
                    <span aria-hidden className="text-(--rule-2)">
                      —
                    </span>
                  )}
                </TD>
                <TD className="max-w-(--measure-record) align-top text-[13px] leading-relaxed">
                  {row.description || <span className="text-(--ink-3-aa)">—</span>}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      {passthrough.length > 0 && (
        <p className="m-0 text-[13px] leading-relaxed text-(--ink-3-aa)">
          Also accepts everything in{' '}
          {passthrough.map((entry, index) => (
            <span key={entry}>
              {index > 0 && ', '}
              <code className="font-mono text-xs text-(--ink-2)">{entry}</code>
            </span>
          ))}
          . Those are forwarded to the underlying element and are not listed row by row.
        </p>
      )}
    </div>
  )
}
