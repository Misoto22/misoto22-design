import { WorkflowFigure } from '@misoto22/design/diagrams'

export function Example() {
  return (
    <WorkflowFigure
      spec={{
        schema_version: 2,
        meta: { title: 'Release', subtitle: 'Green tests ship; a red deploy rolls back.' },
        lanes: [
          { id: 'ci', label: 'CI' },
          { id: 'recover', label: 'Recovery', variant: 'exception' },
        ],
        phases: [
          { id: 'verify', label: 'Verify', fromCol: 0, toCol: 1 },
          { id: 'ship', label: 'Ship', fromCol: 2, toCol: 2 },
        ],
        nodes: [
          { id: 'lint', lane: 'ci', col: 0, type: 'backend', label: 'Lint', sublabel: 'eslint' },
          { id: 'test', lane: 'ci', col: 1, type: 'backend', label: 'Tests', sublabel: 'vitest' },
          { id: 'deploy', lane: 'ci', col: 2, type: 'cloud', label: 'Deploy', sublabel: 'Cloudflare' },
          { id: 'roll', lane: 'recover', col: 2, type: 'security', label: 'Roll back', sublabel: 'previous build' },
        ],
        mainPath: ['lint', 'test', 'deploy'],
        edges: [
          { id: 'a', from: 'lint', to: 'test' },
          { id: 'b', from: 'test', to: 'deploy', label: 'green' },
          { id: 'c', from: 'deploy', to: 'roll', label: 'health check failed', role: 'error', variant: 'dashed' },
        ],
      }}
    />
  )
}
