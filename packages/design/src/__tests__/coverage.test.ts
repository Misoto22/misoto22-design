import { describe, expect, it } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SURFACE_BY_DIR } from './surface'

const COMPONENTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'components')

const DIRECTORIES = readdirSync(COMPONENTS)
  .filter((entry) => statSync(join(COMPONENTS, entry)).isDirectory())
  .sort()

/**
 * The gate that makes "every component is tested" a property of the repository
 * rather than a claim in a README.
 *
 * A new component with no fixture fails here, and the fixture is what the axe,
 * server-render and keyboard suites all iterate. So adding a component without
 * testing it is not a thing someone can forget to do — it is a thing the build
 * refuses.
 */
describe('test surface', () => {
  it('covers every component directory', () => {
    const missing = DIRECTORIES.filter((dir) => !SURFACE_BY_DIR.has(dir))
    expect(missing, 'add an entry to src/__tests__/surface.tsx').toEqual([])
  })

  it('has no fixture for a component that no longer exists', () => {
    const stale = [...SURFACE_BY_DIR.keys()].filter((dir) => !DIRECTORIES.includes(dir))
    expect(stale).toEqual([])
  })
})
