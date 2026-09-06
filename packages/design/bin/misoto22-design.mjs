#!/usr/bin/env node
/**
 * The package's own documentation, for the reader that installed it.
 *
 * A website is the wrong source for an agent writing against a pinned version:
 * it documents whatever shipped last, the agent is holding whatever is in
 * `node_modules`, and neither side can see the disagreement. Everything printed
 * here is generated at build time from the source in the same tarball, so the
 * answer is always about the version actually installed.
 *
 * It is also the cheap half of the deal. `docs --installed` is a few hundred
 * tokens and says what exists; `docs <Component>` is under a thousand and says
 * everything about one of them. The alternative an agent reaches for otherwise
 * is the whole of `llms-full.txt`, which is fifty times that and mostly about
 * components it is not using.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const AGENT = join(ROOT, 'dist', 'agent')
const SKILL = join(ROOT, 'skills', 'misoto22-design')

const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

const USAGE = `@misoto22/design ${version}

  misoto22-design docs <Component>    One component, in full — props, types,
                                      keyboard, accessibility, examples.
  misoto22-design docs --list         Every component, one line each.
  misoto22-design docs --installed    This package's version and what it ships.
                       [--json]
  misoto22-design init [--agents-md]  Install the agent skill into this project
                                      under .claude/skills/, and optionally
                                      point AGENTS.md at it.

Docs on the web: https://ui.misoto22.com`

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

/** The emitted docs are a build artifact; a source checkout may not have them. */
function requireBuilt() {
  if (!existsSync(AGENT)) {
    fail(
      'No generated docs found. This package ships them in dist/agent/;\n' +
        'in a source checkout, run `pnpm build:agent` first.',
    )
  }
}

function componentNames() {
  return readdirSync(AGENT)
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map((file) => file.replace(/\.md$/, ''))
    .sort()
}

function catalog() {
  return JSON.parse(readFileSync(join(AGENT, 'catalog.json'), 'utf8'))
}

/**
 * What a skill injects at the top of a session: the version in this project and
 * the names it can ask about. Deliberately names-only — the point is that the
 * agent then fetches the one component it needs, rather than being handed all
 * fifty-two prop tables it does not.
 */
function installed(asJson) {
  requireBuilt()
  const { groups, components } = catalog()
  if (asJson) {
    const byGroup = Object.fromEntries(
      groups
        .map((group) => [group, components.filter((c) => c.group === group).map((c) => c.name)])
        .filter(([, names]) => names.length > 0),
    )
    process.stdout.write(
      `${JSON.stringify(
        {
          package: '@misoto22/design',
          version,
          components: byGroup,
          styles: [
            '@misoto22/design/styles.css',
            '@misoto22/design/tokens.css',
            '@misoto22/design/semantic.css',
            '@misoto22/design/keyframes.css',
          ],
          detail: 'npx misoto22-design docs <Component>',
        },
        null,
        2,
      )}\n`,
    )
    return
  }
  const lines = [`@misoto22/design ${version} — ${components.length} components`, '']
  for (const group of groups) {
    const names = components.filter((c) => c.group === group).map((c) => c.name)
    if (names.length > 0) lines.push(`${group}: ${names.join(', ')}`)
  }
  lines.push('', 'One in full: npx misoto22-design docs <Component>')
  process.stdout.write(`${lines.join('\n')}\n`)
}

function docs(args) {
  if (args.includes('--installed')) return installed(args.includes('--json'))
  requireBuilt()
  if (args.includes('--list')) {
    process.stdout.write(readFileSync(join(AGENT, 'index.md'), 'utf8'))
    return
  }

  const name = args.find((arg) => !arg.startsWith('-'))
  if (!name) fail(`Which component? Try one of:\n\n  ${componentNames().join(', ')}`)

  // What the caller holds is usually the identifier it just failed to import —
  // a part (`CardBody`, `TH`) or a type (`ButtonVariant`) rather than the
  // component that owns it. Resolve those rather than making it guess again.
  const owner = catalog().exports?.[name]
  const file = join(AGENT, `${owner ?? name}.md`)
  if (existsSync(file)) {
    if (owner && owner !== name) {
      process.stderr.write(`\`${name}\` is part of ${owner}.\n`)
    }
    process.stdout.write(readFileSync(file, 'utf8'))
    return
  }

  // A miss is usually a near miss — a habit from another library, or a part
  // name rather than the component that owns it. Say what exists instead.
  const wanted = name.toLowerCase()
  const near = componentNames().filter(
    (candidate) =>
      candidate.toLowerCase().startsWith(wanted.slice(0, 3)) ||
      wanted.startsWith(candidate.toLowerCase()),
  )
  fail(
    near.length > 0
      ? `No component named "${name}". Did you mean: ${near.join(', ')}?`
      : `No component named "${name}". Run \`misoto22-design docs --list\` for all ${componentNames().length}.`,
  )
}

const AGENTS_BLOCK = `
## @misoto22/design

UI comes from \`@misoto22/design\`. Read \`.claude/skills/misoto22-design/SKILL.md\`
before writing components against it — the names diverge from shadcn/ui in
several places, and colour is never written as a raw class.

- One component in full: \`npx misoto22-design docs <Component>\`
- Everything it ships: \`npx misoto22-design docs --installed\`
`

function init(args) {
  const target = join(process.cwd(), '.claude', 'skills', 'misoto22-design')
  if (!existsSync(SKILL)) fail('This build has no skills/ directory.')

  const existed = existsSync(target)
  mkdirSync(dirname(target), { recursive: true })
  cpSync(SKILL, target, { recursive: true })
  process.stdout.write(
    `${existed ? 'Updated' : 'Installed'} the skill at ${resolve(target)}\n`,
  )

  if (!args.includes('--agents-md')) {
    process.stdout.write('Pass --agents-md to also point AGENTS.md at it.\n')
    return
  }

  const agentsFile = join(process.cwd(), 'AGENTS.md')
  const current = existsSync(agentsFile) ? readFileSync(agentsFile, 'utf8') : '# AGENTS.md\n'
  if (current.includes('@misoto22/design')) {
    process.stdout.write('AGENTS.md already mentions the package; left alone.\n')
    return
  }
  writeFileSync(agentsFile, `${current.trimEnd()}\n${AGENTS_BLOCK}`)
  process.stdout.write(`Appended a section to ${resolve(agentsFile)}\n`)
}

const [command, ...args] = process.argv.slice(2)
switch (command) {
  case 'docs':
    docs(args)
    break
  case 'init':
    init(args)
    break
  case undefined:
  case '--help':
  case '-h':
    process.stdout.write(`${USAGE}\n`)
    break
  case '--version':
  case '-v':
    process.stdout.write(`${version}\n`)
    break
  default:
    fail(`Unknown command "${command}".\n\n${USAGE}`)
}
