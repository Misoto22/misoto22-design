import { describe, expect, it } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error — plain ESM data, typed by JSDoc rather than by a declaration.
import { AXIS_DEFAULTS, CATALOG, GROUPS, slugOf } from '../../agent/catalog.mjs'
// @ts-expect-error — a build script, run here for the fact it derives.
import { themeAxes } from '../../scripts/theme-axes.mjs'

interface CatalogEntry {
  name: string
  group: string
  summary: string
  when?: string
  accessibility?: string[]
  keyboard?: { keys: string[]; does: string }[]
  related?: string[]
}

const entries = CATALOG as CatalogEntry[]
const groups = GROUPS as string[]
const axisDefaults = AXIS_DEFAULTS as Record<string, string>
const derivedAxes = themeAxes() as Record<string, string[]>

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Two trees, because the package ships two entries. `src/charts` holds the
 * data-visualisation half behind its own export, and its shared pieces live in
 * `lib/` — lowercase, which is how they are told apart from a component: every
 * component directory is a PascalCase name, and nothing else in either tree is.
 */
const componentDirs = (dir: string) =>
  readdirSync(join(SRC, dir))
    .filter((entry) => /^[A-Z]/.test(entry))
    .filter((entry) => statSync(join(SRC, dir, entry)).isDirectory())

const SOURCE_DIRS = [...componentDirs('components'), ...componentDirs('charts')]

/**
 * The catalog is the one hand-written file in the package, which makes it the
 * one file that can fall out of step with the source beside it. It is also what
 * `scripts/emit-agent.mjs` turns into the offline documentation an agent reads,
 * so a wrong entry here is not a blank page — it is a confident answer about a
 * component that does not exist.
 *
 * The identity checks matter more than they look. `name` is the ONLY identifier
 * the catalog authors: the directory is the name and the site's slug is the
 * name in kebab-case, and both the emitter and the documentation site rely on
 * that. The moment one component breaks the rule, the derivation has to become
 * a third authored field everywhere, which is the duplication this replaced.
 */
describe('agent catalog', () => {
  it('names a real component directory for every entry', () => {
    const known = new Set(SOURCE_DIRS)
    expect(entries.filter((entry) => !known.has(entry.name)).map((entry) => entry.name)).toEqual([])
  })

  it('describes every component the package ships', () => {
    const described = new Set(entries.map((entry) => entry.name))
    expect(SOURCE_DIRS.filter((dir) => !described.has(dir))).toEqual([])
  })

  it('keeps the slug derivable from the name', () => {
    // Nothing reads this back — the point is that the derivation stays total,
    // because the site's URLs and every cross-link are built from it.
    const undeviable = entries.filter((entry) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugOf(entry.name)))
    expect(undeviable.map((entry) => entry.name)).toEqual([])
  })

  it('uses unique names and unique slugs', () => {
    const names = entries.map((entry) => entry.name)
    expect(new Set(names).size).toBe(names.length)
    const slugs = names.map(slugOf)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('places every entry in a declared group', () => {
    const declared = new Set(groups)
    expect(entries.filter((entry) => !declared.has(entry.group)).map((entry) => entry.name)).toEqual(
      [],
    )
  })

  it('declares no empty group', () => {
    // An empty group renders a heading over nothing, in the sidebar and in the
    // emitted index alike.
    const used = new Set(entries.map((entry) => entry.group))
    expect(groups.filter((group) => !used.has(group))).toEqual([])
  })

  it('only cross-links to components that exist', () => {
    const slugs = new Set(entries.map((entry) => slugOf(entry.name)))
    const broken = entries.flatMap((entry) =>
      (entry.related ?? [])
        .filter((slug) => !slugs.has(slug))
        .map((slug) => `${slugOf(entry.name)} → ${slug}`),
    )
    expect(broken).toEqual([])
  })

  it('gives every entry a summary that is one line', () => {
    const bad = entries.filter((entry) => !entry.summary || entry.summary.includes('\n'))
    expect(bad.map((entry) => entry.name)).toEqual([])
  })

  it('gives every keyboard row at least one key and something it does', () => {
    const bad = entries.flatMap((entry) =>
      (entry.keyboard ?? [])
        .filter((row) => row.keys.length === 0 || !row.does)
        .map(() => entry.name),
    )
    expect(bad).toEqual([])
  })

  it('explains exactly the theme axes the stylesheets define', () => {
    // The half that cannot be derived is what an UNSET axis gives you, so that
    // half is authored — and this is what stops it describing an axis the CSS
    // does not have. It described `data-accent` for months, which is an
    // attribute that has never existed and that an agent could set all day.
    expect(Object.keys(axisDefaults).sort()).toEqual(Object.keys(derivedAxes).sort())
  })

  it('finds a value for every axis', () => {
    // An axis with no values is a selector that was renamed out from under the
    // regex, which would silently shrink the emitted documentation.
    const empty = Object.entries(derivedAxes).filter(([, values]) => values.length === 0)
    expect(empty.map(([axis]) => axis)).toEqual([])
  })
})
