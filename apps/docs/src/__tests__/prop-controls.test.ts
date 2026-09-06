import { describe, expect, it } from 'vitest'
import propsJson from '@/generated/props.json'
import { componentSource, type ComponentSource, type PropRow } from '@/lib/docs'
import { controlFor, steerableProps, type TypeAlias } from '@/lib/prop-controls'

const ALL = propsJson as unknown as Record<string, ComponentSource>

/** A prop row with only the fields a rule reads, so a case states its own point. */
function row(partial: Partial<PropRow> & { type: string }): PropRow {
  return { name: 'value', required: false, description: '', ...partial }
}

/** Every alias the package exports, which is how `StatusPill` reaches `StatusTone`. */
function everyAlias(): TypeAlias[] {
  return Object.values(ALL).flatMap((source) => source.exportedTypes)
}

function propsOf(dir: string, component: string): PropRow[] {
  const found = componentSource(dir).components.find((entry) => entry.name === component)
  if (!found) throw new Error(`${dir} does not export ${component}`)
  return found.props
}

describe('controlFor', () => {
  it('gives a boolean a switch seeded from its recorded default', () => {
    expect(controlFor(row({ type: 'boolean' }))).toEqual({ kind: 'boolean', fallback: false })
    expect(controlFor(row({ type: 'boolean', defaultValue: 'true' }))).toEqual({
      kind: 'boolean',
      fallback: true,
    })
    expect(controlFor(row({ type: 'boolean', defaultValue: 'false' }))).toEqual({
      kind: 'boolean',
      fallback: false,
    })
  })

  it('gives a union of string literals a select, unquoted', () => {
    expect(controlFor(row({ type: "'sm' | 'md' | 'lg'" }))).toEqual({
      kind: 'enum',
      options: ['sm', 'md', 'lg'],
      fallback: 'sm',
    })
    expect(controlFor(row({ type: "'sm' | 'md' | 'lg'", defaultValue: "'md'" }))).toEqual({
      kind: 'enum',
      options: ['sm', 'md', 'lg'],
      fallback: 'md',
    })
  })

  it('ignores a declared default the union does not contain', () => {
    expect(controlFor(row({ type: "'sm' | 'md'", defaultValue: "'huge'" })).kind).toBe('enum')
    expect(controlFor(row({ type: "'sm' | 'md'", defaultValue: "'huge'" }))).toHaveProperty(
      'fallback',
      'sm',
    )
  })

  it('reads a union written across several lines', () => {
    expect(controlFor(row({ type: "\n  | 'start'\n  | 'end'\n" })).kind).toBe('enum')
  })

  it('refuses a union that mixes a literal with anything else', () => {
    for (const type of [
      'boolean | DatePreset<Date>[]',
      'string | [string, string]',
      'string | null',
      'number | null',
      "Extract<Tone, 'a' | 'b'>",
    ]) {
      expect(controlFor(row({ type })), type).toEqual({ kind: 'none' })
    }
  })

  it('gives a number a stepper, and only trusts a numeric default', () => {
    expect(controlFor(row({ type: 'number' }))).toEqual({ kind: 'number', fallback: 0 })
    expect(controlFor(row({ type: 'number', defaultValue: '2' }))).toEqual({
      kind: 'number',
      fallback: 2,
    })
    expect(controlFor(row({ type: 'number', defaultValue: 'null' }))).toEqual({
      kind: 'number',
      fallback: 0,
    })
  })

  it('gives a string a text field, and only trusts a quoted default', () => {
    expect(controlFor(row({ type: 'string' }))).toEqual({ kind: 'text', fallback: '' })
    expect(controlFor(row({ type: 'string', defaultValue: "'Select…'" }))).toEqual({
      kind: 'text',
      fallback: 'Select…',
    })
    // A destructured default can be an identifier rather than a literal.
    expect(controlFor(row({ type: 'string', defaultValue: 'formatDate' }))).toEqual({
      kind: 'text',
      fallback: '',
    })
  })

  it('counts children, and leaves every other slot alone', () => {
    expect(controlFor(row({ name: 'children', type: 'ReactNode' }))).toEqual({
      kind: 'nodeCount',
      fallback: 3,
    })
    expect(controlFor(row({ name: 'children', type: 'React.ReactNode' })).kind).toBe('nodeCount')
    expect(controlFor(row({ name: 'title', type: 'ReactNode' }))).toEqual({ kind: 'none' })
  })

  it('refuses everything it cannot state outright', () => {
    for (const type of [
      '(value: string) => void',
      '() => void',
      '(date: Date) => string',
      'LucideIcon',
      'Ref<HTMLInputElement>',
      "ComponentProps<typeof Calendar>['disabled']",
      'Crumb[]',
      'string[]',
      'Date',
      'false',
    ]) {
      expect(controlFor(row({ type })), type).toEqual({ kind: 'none' })
    }
  })

  it('resolves a named union only when the caller supplies the alias', () => {
    const aliases: TypeAlias[] = [{ name: 'BadgeTone', definition: "'neutral' | 'outline'" }]
    expect(controlFor(row({ type: 'BadgeTone' }))).toEqual({ kind: 'none' })
    expect(controlFor(row({ type: 'BadgeTone', defaultValue: "'neutral'" }), aliases)).toEqual({
      kind: 'enum',
      options: ['neutral', 'outline'],
      fallback: 'neutral',
    })
  })
})

describe('steerableProps', () => {
  const rows: PropRow[] = [
    row({ name: 'onSelect', type: '(value: string) => void', required: true }),
    row({ name: 'size', type: "'sm' | 'md'" }),
    row({ name: 'caption', type: 'string', required: true }),
    row({ name: 'disabled', type: 'boolean' }),
    row({ name: 'align', type: 'string', required: true }),
  ]

  it('drops what has no control and sorts required first, then alphabetically', () => {
    expect(steerableProps(rows).map((entry) => entry.row.name)).toEqual([
      'align',
      'caption',
      'disabled',
      'size',
    ])
  })

  it('leaves the rows it was handed untouched', () => {
    const before = rows.map((entry) => entry.name)
    steerableProps(rows)
    expect(rows.map((entry) => entry.name)).toEqual(before)
  })
})

describe('the real extracted props', () => {
  it('reads Button the way its page needs', () => {
    const aliases = componentSource('Button').exportedTypes
    const controls = new Map(
      propsOf('Button', 'Button').map((entry) => [entry.name, controlFor(entry, aliases)]),
    )

    expect(controls.get('variant')).toEqual({
      kind: 'enum',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      fallback: 'primary',
    })
    expect(controls.get('size')).toEqual({
      kind: 'enum',
      options: ['sm', 'md', 'lg'],
      fallback: 'md',
    })
    expect(controls.get('loading')).toEqual({ kind: 'boolean', fallback: false })
    expect(controls.get('children')).toEqual({ kind: 'nodeCount', fallback: 3 })
    expect(controls.get('href')).toEqual({ kind: 'text', fallback: '' })
  })

  it('reads Input, whose only knob is a boolean', () => {
    const steerable = steerableProps(propsOf('Input', 'Input'), everyAlias())
    expect(steerable.map((entry) => entry.row.name)).toEqual(['invalid'])
    expect(steerable[0]?.control).toEqual({ kind: 'boolean', fallback: false })
  })

  it('reads Badge, whose required children sort ahead of its tone', () => {
    const steerable = steerableProps(propsOf('Badge', 'Badge'), everyAlias())
    expect(steerable.map((entry) => entry.row.name)).toEqual(['children', 'tone'])
    expect(steerable[0]?.control).toEqual({ kind: 'nodeCount', fallback: 3 })
    expect(steerable[1]?.control).toEqual({
      kind: 'enum',
      options: ['neutral', 'success', 'warning', 'danger', 'outline'],
      fallback: 'neutral',
    })
  })

  it('decides every prop in the package without throwing or inventing a fallback', () => {
    const aliases = everyAlias()
    let seen = 0

    for (const [dir, source] of Object.entries(ALL)) {
      for (const component of source.components) {
        for (const prop of component.props) {
          const control = controlFor(prop, aliases)
          const where = `${dir}.${component.name}.${prop.name}: ${prop.type}`
          seen += 1

          if (control.kind === 'enum') {
            expect(control.options.length, where).toBeGreaterThan(1)
            expect(control.options, where).toContain(control.fallback)
            // A quote that survived the split would reach a `<select>` verbatim.
            expect(control.options.some((option) => /['"]/.test(option)), where).toBe(false)
          }
          if (control.kind === 'number') expect(Number.isFinite(control.fallback), where).toBe(true)
          if (control.kind === 'text') expect(typeof control.fallback, where).toBe('string')
        }
      }
    }

    // The sweep is only evidence while there is something to sweep.
    expect(seen).toBeGreaterThan(100)
  })
})
