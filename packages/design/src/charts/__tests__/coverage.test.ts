import { describe, expect, it } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHART_SURFACE_BY_DIR } from './surface'

const CHARTS = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Directories holding a chart. `lib` is shared machinery, not a chart. */
const DIRECTORIES = readdirSync(CHARTS)
  .filter((entry) => statSync(join(CHARTS, entry)).isDirectory())
  .filter((entry) => entry !== 'lib' && entry !== '__tests__')
  .sort()

/**
 * The same gate `src/__tests__/coverage.test.ts` applies to components, applied
 * to charts. A new chart with no fixture fails here, and the fixture is what the
 * axe and server-render suites iterate — so shipping an untested chart is not
 * something a reviewer has to notice.
 */
describe('chart test surface', () => {
  it('covers every chart directory', () => {
    const missing = DIRECTORIES.filter((dir) => !CHART_SURFACE_BY_DIR.has(dir))
    expect(missing, 'add an entry to src/charts/__tests__/surface.tsx').toEqual([])
  })

  it('has no fixture for a chart that no longer exists', () => {
    const stale = [...CHART_SURFACE_BY_DIR.keys()].filter((dir) => !DIRECTORIES.includes(dir))
    expect(stale).toEqual([])
  })
})
