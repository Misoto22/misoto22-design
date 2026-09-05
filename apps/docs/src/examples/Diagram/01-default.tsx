import { Diagram } from '@misoto22/design'

export function Example() {
  return (
    <Diagram
      spec={{
        caption: 'One request, from the edge to the row it reads.',
        edges: [
          { from: 'edge', to: 'app', label: 'HTTPS' },
          { from: 'app', to: 'data', label: 'SQL' },
        ],
        nodes: [
          { id: 'edge', label: 'Edge', note: 'CDN + WAF', footnote: 'Cached for 60s' },
          {
            id: 'app',
            label: 'Application',
            note: 'one process',
            direction: 'column',
            children: [
              { label: 'Router' },
              { label: 'Handlers', accent: true, note: 'where the work is' },
              { label: 'Serialisers' },
            ],
          },
          { id: 'data', label: 'Postgres', note: 'primary' },
        ],
      }}
    />
  )
}
