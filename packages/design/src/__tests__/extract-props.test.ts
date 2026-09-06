import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error — a build script, run here for the data it derives.
import { extractProps } from '../../scripts/extract-props.mjs'

interface Component {
  name: string
  description?: string
  props: { name: string; description?: string }[]
}

interface Source {
  components: Component[]
}

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * A fixture rather than the real components, because the subject is the SHAPE
 * of a `{@link}` — one closing a sentence, one in the middle of it, a
 * component's own note, and a comment with no link at all — and each shape has
 * to be assertable on its own. The rows that actually shipped "See ." are
 * checked against the real source further down.
 */
const FIXTURE = `
export type WidgetLayout = 'inline' | 'stacked'

export interface WidgetProps {
  /** How it sits relative to its label. See {@link WidgetLayout}. */
  layout?: WidgetLayout
  /** The panel paired to a {@link WidgetLayout} by matching \`value\`. */
  pair?: string
  /** Nothing linked here. */
  plain?: string
}

/** A widget. Render it with {@link WIDGET_CLASS}. */
export function Widget(props: WidgetProps) {
  return null
}
`

let directory: string
let fixture: Source
let real: Record<string, Source>

const prop = (source: Source, component: string, name: string) =>
  source.components.find((entry) => entry.name === component)?.props.find((p) => p.name === name)

beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'extract-props-'))
  mkdirSync(join(directory, 'Widget'))
  writeFileSync(join(directory, 'Widget', 'Widget.tsx'), FIXTURE)
  fixture = extractProps(directory).Widget as Source
  real = extractProps(join(PACKAGE, 'src', 'components')) as Record<string, Source>
})

afterAll(() => {
  rmSync(directory, { recursive: true, force: true })
})

describe('{@link} in a doc comment', () => {
  it('survives as its bare identifier when it closes a sentence', () => {
    expect(prop(fixture, 'Widget', 'layout')?.description).toBe(
      'How it sits relative to its label. See WidgetLayout.',
    )
  })

  it('keeps the words on both sides of it', () => {
    expect(prop(fixture, 'Widget', 'pair')?.description).toBe(
      'The panel paired to a WidgetLayout by matching `value`.',
    )
  })

  it('leaves a comment without one alone', () => {
    expect(prop(fixture, 'Widget', 'plain')?.description).toBe('Nothing linked here.')
  })

  it('reads a component note the same way', () => {
    expect(fixture.components.find((entry) => entry.name === 'Widget')?.description).toBe(
      'A widget. Render it with WIDGET_CLASS.',
    )
  })
})

describe('the real components', () => {
  // The rows the documentation site published as a dangling full stop: the
  // link was dropped and the sentence around it kept its punctuation.
  it.each([
    ['DescriptionList', 'DescriptionList', 'layout', 'DescriptionListLayout'],
    ['Field', 'Field', 'layout', 'FieldLayout'],
    ['Table', 'Table', 'borders', 'TableBorders'],
    ['Text', 'Text', 'size', 'TextSize'],
    ['Text', 'Text', 'tone', 'TextTone'],
    ['Timestamp', 'Timestamp', 'format', 'TimestampFormat'],
    ['Toolbar', 'Toolbar', 'position', 'ToolbarPosition'],
  ])('names %s.%s#%s as %s', (dir, component, name, identifier) => {
    expect(prop(real[dir]!, component, name)?.description).toContain(`See ${identifier}.`)
  })

  it('names the class an ErrorState action is rendered with', () => {
    expect(prop(real.ErrorState!, 'ErrorState', 'action')?.description).toBe(
      'The way back. Render it with ERROR_ACTION_CLASS.',
    )
  })

  it('publishes no description with a hole where a link was', () => {
    const holes: string[] = []
    for (const [dir, source] of Object.entries(real)) {
      for (const component of source.components) {
        const entries: [string, string | undefined][] = [
          [`${dir}.${component.name}`, component.description],
          ...component.props.map(
            (p) => [`${dir}.${component.name}#${p.name}`, p.description] as [string, string?],
          ),
        ]
        for (const [key, description] of entries) {
          // A dropped link leaves the space it stood in: " ." at the end of a
          // sentence, or a gap mid-sentence. A run of spaces at the start of a
          // line is a numbered list's indent, not a hole.
          if (description && / [.,;]|\S {2}/.test(description)) holes.push(key)
        }
      }
    }
    expect(holes).toEqual([])
  })
})
