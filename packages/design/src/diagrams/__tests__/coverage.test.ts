import { describe, expect, it } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SURFACE_BY_DIR } from './surface'

const DIAGRAMS = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Everything under src/diagrams that is a component rather than a helper. */
const DIRECTORIES = readdirSync(DIAGRAMS)
  .filter((entry) => statSync(join(DIAGRAMS, entry)).isDirectory())
  .filter((entry) => entry !== 'lib' && entry !== '__tests__')
  .sort()

/**
 * The gate that makes "every diagram component is tested" a property of the
 * repository rather than a claim in a README.
 *
 * A new figure with no fixture fails here, and the fixture is what the axe,
 * server-render and theming suites all iterate — so adding a component without
 * testing it is not a thing someone can forget to do, it is a thing the build
 * refuses.
 */
describe('diagram test surface', () => {
  it('covers every component directory', () => {
    const missing = DIRECTORIES.filter((dir) => !SURFACE_BY_DIR.has(dir))
    expect(missing, 'add an entry to src/diagrams/__tests__/surface.tsx').toEqual([])
  })

  it('has no fixture for a component that no longer exists', () => {
    const stale = [...SURFACE_BY_DIR.keys()].filter((dir) => !DIRECTORIES.includes(dir))
    expect(stale).toEqual([])
  })
})
