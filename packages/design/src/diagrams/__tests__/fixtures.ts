import type {
  ArchitectureSpec,
  DataflowSpec,
  LifecycleSpec,
  SequenceSpec,
  WorkflowSpec,
} from '../spec'

/**
 * One small, VALID specification per diagram type.
 *
 * Small on purpose: these are read by a person deciding whether a renderer is
 * behaving, and a fourteen-node fixture answers that question worse than a
 * three-node one. Each still exercises the parts a renderer can get wrong —
 * a boundary, a reversed plate, a return message, a classification, a terminal
 * state — because a fixture with only default nodes tests one branch of five.
 */

export const ARCHITECTURE: ArchitectureSpec = {
  meta: { title: 'Request path', subtitle: 'From the edge to the row it reads.' },
  components: [
    { id: 'edge', type: 'cloud', label: 'CloudFront', sublabel: 'CDN', row: 0, col: 0 },
    { id: 'api', type: 'backend', label: 'API', sublabel: 'FastAPI', row: 0, col: 1, tag: ':8000' },
    { id: 'db', type: 'database', label: 'Postgres', sublabel: 'primary', row: 0, col: 2 },
  ],
  boundaries: [{ kind: 'region', label: 'ap-southeast-2', wraps: ['api', 'db'] }],
  connections: [
    { id: 'edge-api', from: 'edge', to: 'api', label: 'HTTPS', variant: 'emphasis' },
    { id: 'api-db', from: 'api', to: 'db', label: 'SQL' },
  ],
  cards: [{ dot: 'cyan', title: 'Edge', items: ['All traffic is fronted by the CDN.'] }],
}

export const WORKFLOW: WorkflowSpec = {
  schema_version: 2,
  meta: { title: 'Release' },
  lanes: [
    { id: 'ci', label: 'CI' },
    { id: 'fail', label: 'Recovery', variant: 'exception' },
  ],
  phases: [{ id: 'build', label: 'Build', fromCol: 0, toCol: 1 }],
  nodes: [
    { id: 'test', lane: 'ci', col: 0, type: 'backend', label: 'Tests', sublabel: 'vitest' },
    { id: 'ship', lane: 'ci', col: 1, type: 'cloud', label: 'Deploy' },
    { id: 'roll', lane: 'fail', col: 1, type: 'security', label: 'Roll back' },
  ],
  mainPath: ['test', 'ship'],
  edges: [
    { id: 'green', from: 'test', to: 'ship', label: 'green' },
    { id: 'red', from: 'ship', to: 'roll', label: 'failed', role: 'error', variant: 'dashed' },
  ],
}

export const SEQUENCE: SequenceSpec = {
  meta: { title: 'Cache miss' },
  participants: [
    { id: 'app', type: 'frontend', label: 'Web', sublabel: 'React' },
    { id: 'api', type: 'backend', label: 'API' },
    { id: 'cache', type: 'database', label: 'Redis' },
  ],
  segments: [{ from: 130, to: 240, label: 'Request' }],
  messages: [
    { id: 'get', from: 'app', to: 'api', y: 150, label: 'GET /me', variant: 'emphasis' },
    { id: 'read', from: 'api', to: 'cache', y: 185, label: 'read' },
    { id: 'miss', from: 'cache', to: 'api', y: 220, label: 'miss', variant: 'return' },
  ],
  activations: [{ participant: 'api', from: 145, to: 230, type: 'backend' }],
}

export const DATAFLOW: DataflowSpec = {
  meta: { title: 'Event pipeline' },
  stages: [{ label: 'Sources' }, { label: 'Store' }],
  nodes: [
    { id: 'web', type: 'frontend', label: 'Web SDK', stage: 0, row: 0, tag: 'events' },
    { id: 'wh', type: 'database', label: 'Warehouse', stage: 1, row: 0, tag: 'curated' },
  ],
  flows: [{ id: 'load', from: 'web', to: 'wh', label: 'batch', classification: 'no PII' }],
}

export const LIFECYCLE: LifecycleSpec = {
  meta: { title: 'Job run' },
  lanes: [
    { id: 'main', label: 'Phases' },
    { id: 'exit', label: 'Terminal' },
  ],
  states: [
    { id: 'queued', type: 'start', label: 'Queued', lane: 'main', col: 0, step: '01' },
    { id: 'running', type: 'active', label: 'Running', lane: 'main', col: 1, step: '02' },
    { id: 'done', type: 'success', label: 'Done', lane: 'main', col: 2, step: '03' },
    { id: 'failed', type: 'failure', label: 'Failed', lane: 'exit', col: 0 },
  ],
  transitions: [
    { id: 'boom', from: 'running', to: 'failed', label: 'error', note: 'after 3 tries' },
  ],
}
