import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error — a build script, run here for the data it derives.
import { extractTokens } from '../../scripts/extract-tokens.mjs'

interface Entry {
  name: string
  value: string
  comment?: string
  category: string
}

interface Layer {
  light: Entry[]
  dark: Entry[]
}

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * A fixture rather than the real stylesheet, because the subject here is the
 * SHAPE of a comment — leading, trailing, last in its block — and each shape
 * has to be assertable on its own. The real CSS is checked further down, on
 * the tokens that were actually published wrong.
 */
const FIXTURE = `:root {
  /* A heading for the run below. */
  --run-first: 1rem;
  --run-second: 2rem;
  --own-note: 3rem; /* its own trailing note */
  --after-trailing: 4rem;
  /* A leading note of its own. */
  --both-notes: 5rem; /* the nearer note wins */
  --overridden: 6rem; /* the first declaration */
  --last-in-block: 7rem; /* nothing follows it */
}

[data-density='compact'] {
  --own-note: 0.5rem; /* the compact value */
  --compact-only: 0.25rem; /* declared nowhere else */
}

:root {
  --overridden: 8rem; /* the second declaration */
}

[data-mode='dark'] {
  --dark-ink: #ffffff; /* dark ink */
}
`

let directory: string
let fixture: Layer
let real: Layer

const find = (entries: Entry[], name: string) => entries.find((entry) => entry.name === name)

beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'extract-tokens-'))
  const path = join(directory, 'fixture.css')
  writeFileSync(path, FIXTURE)
  fixture = extractTokens({ tokens: path }).tokens as Layer
  real = extractTokens({ tokens: join(PACKAGE, 'src', 'styles', 'tokens.css') }).tokens as Layer
})

afterAll(() => {
  rmSync(directory, { recursive: true, force: true })
})

describe('comment attribution', () => {
  it('attaches a leading comment to the first token of the run it introduces', () => {
    expect(find(fixture.light, 'run-first')?.comment).toBe('A heading for the run below.')
    expect(find(fixture.light, 'run-second')?.comment).toBeUndefined()
  })

  it('keeps a trailing comment on the declaration it follows', () => {
    expect(find(fixture.light, 'own-note')?.comment).toBe('its own trailing note')
  })

  it('does not carry a trailing comment on to the next declaration', () => {
    expect(find(fixture.light, 'after-trailing')?.comment).toBeUndefined()
  })

  it('prefers the note nearest the token when it has both', () => {
    expect(find(fixture.light, 'both-notes')?.comment).toBe('the nearer note wins')
  })

  it('keeps the trailing comment of the last declaration in a block', () => {
    expect(find(fixture.light, 'last-in-block')?.comment).toBe('nothing follows it')
  })

  it('reads the dark layer the same way', () => {
    expect(find(fixture.dark, 'dark-ink')).toMatchObject({
      value: '#ffffff',
      comment: 'dark ink',
    })
  })
})

describe('conditional declarations', () => {
  it('publishes the unconditional value, not the one behind an opt-in attribute', () => {
    expect(find(fixture.light, 'own-note')?.value).toBe('3rem')
  })

  it('records a token once, whichever selector redeclared it', () => {
    expect(fixture.light.filter((entry) => entry.name === 'own-note')).toHaveLength(1)
  })

  it('still surfaces a token that only a conditional selector declares', () => {
    expect(find(fixture.light, 'compact-only')?.value).toBe('0.25rem')
  })

  it('keeps the last of two unconditional declarations, as the browser does', () => {
    expect(find(fixture.light, 'overridden')).toMatchObject({
      value: '8rem',
      comment: 'the second declaration',
    })
  })
})

describe('the real stylesheet', () => {
  // The rows the documentation site published wrong: every trailing-comment
  // token carried the note of the one above it.
  it.each([
    ['radius-lg', 'cards, dialogs, menu panels'],
    ['radius-pill', 'capsules and counters'],
    ['radius-frame', 'a frame 16px outside a panel'],
    ['fs-lead', 'band heading 30 → 42px'],
    ['fs-sub', 'card sub-head 21 → 25px'],
    ['fs-item', 'in-card title 18 → 20px'],
  ])('notes --%s with its own comment', (name, comment) => {
    expect(find(real.light, name)?.comment).toBe(comment)
  })

  it.each([
    ['control-h-sm', '2.25rem'],
    ['control-h-md', '2.75rem'],
    ['control-h-lg', '3rem'],
    ['field-px', '0.875rem'],
    ['table-pad-y', '0.875rem'],
  ])('publishes --%s at its comfortable default', (name, value) => {
    expect(find(real.light, name)?.value).toBe(value)
  })

  it('notes the medium control with the target size it clears', () => {
    expect(find(real.light, 'control-h-md')?.comment).toBe('44px — WCAG 2.5.5')
  })
})
