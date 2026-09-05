#!/usr/bin/env node
/**
 * Checks the surface a consumer actually meets: the tarball and its `exports`.
 *
 * Everything else in this repository tests the source. Nothing tested the
 * PACKAGE — the nine export paths, whether each resolves to a file that is
 * really in the tarball, and whether a TypeScript consumer gets types back. A
 * broken entry there is invisible in review, passes every unit test, and is
 * found by the first person who installs it.
 *
 * Two tools, because they answer different halves and neither covers the other.
 *
 * `publint` reads the whole `exports` map against the packed tarball, so it is
 * what catches a CSS layer that stopped being copied into dist/. It is also
 * what caught `repository.url` missing its `git+` prefix — the warning npm had
 * been printing on every publish and nobody had a place to notice.
 *
 * `attw` resolves the TypeScript entry points the way each module system would.
 * It only has an opinion about things with types, so the CSS exports are
 * excluded rather than reported as failures — a stylesheet has no declaration
 * file and is not supposed to. Discovery stays automatic for everything else,
 * so a new JS entry point is checked without anyone remembering to add it here.
 *
 * The `esm-only` profile is the honest description of this package: `type:
 * module`, no CJS build, `engines.node: ">=24"`. Without it attw reports two
 * intentional facts as defects — that Node 10 cannot see subpath exports, and
 * that a CJS caller needs a dynamic import.
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Export paths that are stylesheets: real, shipped, and untyped by design. */
const STYLESHEET_EXPORTS = [
  './styles.css',
  './tokens.css',
  './semantic.css',
  './keyframes.css',
  './fonts.css',
  './themes.css',
]

const CHECKS = [
  // `--strict` promotes publint's suggestions to failures. They are all
  // things that make a registry page or a consumer's resolver worse.
  { name: 'publint', args: ['publint', '--strict'] },
  {
    name: 'attw',
    args: [
      'attw',
      '--pack',
      '.',
      '--profile',
      'esm-only',
      '--exclude-entrypoints',
      ...STYLESHEET_EXPORTS,
    ],
  },
]

let failed = false

for (const check of CHECKS) {
  const result = spawnSync('pnpm', ['exec', ...check.args], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  })

  if (result.error) {
    console.error(`\n${check.name}: could not run — ${result.error.message}`)
    failed = true
    continue
  }
  if (result.status !== 0) {
    console.error(`\n${check.name}: failed with exit code ${result.status}`)
    failed = true
  }
}

process.exit(failed ? 1 : 0)
