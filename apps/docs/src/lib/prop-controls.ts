import type { PropRow } from '@/lib/docs'

/**
 * Which live control a documented prop gets on the Properties panel.
 *
 * The panel drives a real component, so a control that guesses wrong does not
 * produce a slightly-off row — it renders a broken preview, and the reader has
 * no way to tell whether the component or the documentation is at fault. Every
 * rule below is therefore written to REFUSE: `none` is the answer to anything
 * the type string does not state outright, and the read-only row the table
 * already shows is the fallback that costs nothing.
 *
 * The input is `type` exactly as `packages/design/scripts/extract-props.mjs`
 * wrote it — `member.type.getText(source)`, the source text of the annotation,
 * not a checker-resolved type. So this reads what the component author typed,
 * with everything that implies: an alias stays an alias, and formatting comes
 * along for the ride.
 */
export type PropControl =
  | { kind: 'boolean'; fallback: boolean }
  | { kind: 'enum'; options: string[]; fallback: string }
  | { kind: 'text'; fallback: string }
  | { kind: 'number'; fallback: number }
  /** `children` — how many child items the preview should render. */
  | { kind: 'nodeCount'; fallback: number }
  /** Not steerable: functions, generics, refs, shapes only a page can build. */
  | { kind: 'none' }

/** One exported type alias, shaped as `props.json` records it per directory. */
export interface TypeAlias {
  name: string
  definition: string
}

const QUOTED = /^(['"])(.*)\1$/

/** The text inside a string-literal type or a quoted default; undefined otherwise. */
function unquote(text: string): string | undefined {
  const match = QUOTED.exec(text.trim())
  return match ? match[2] : undefined
}

/**
 * A type expression with its source formatting flattened out.
 *
 * The extractor preserves source text verbatim, so a union broken across lines
 * in the component arrives here with its newlines and indentation attached.
 * Nothing in the package is written that way today, which is exactly why this
 * has to exist before one is: every comparison below is against a single-line
 * form, and the first multi-line union would fall through to `none` in silence.
 */
function flatten(type: string): string {
  return type.replace(/\s+/g, ' ').trim()
}

/**
 * A bare alias name swapped for what it stands for, once.
 *
 * The package writes its enums as exported aliases — `variant: ButtonVariant`,
 * never `variant: 'primary' | 'secondary' | …` — because the alias is part of
 * the surface a consumer imports. Reading the prop row alone therefore sees an
 * opaque identifier, and Button, Badge, Alert, Sheet, Table and the status
 * components would each lose the one control their page exists to show. The
 * definitions sit beside the components in `props.json`, so the caller hands
 * them over rather than this file reaching for generated data of its own.
 *
 * One substitution, not a fixpoint: every alias in this package resolves
 * straight to a literal union, and a chain deep enough to need a loop is one no
 * reader could follow in the table either.
 */
function resolve(type: string, aliases: readonly TypeAlias[]): string {
  const alias = aliases.find((entry) => entry.name === type)
  return alias ? flatten(alias.definition) : type
}

/**
 * The members of a union of string literals, or undefined for anything else.
 *
 * Splitting on a bare `|` ignores nesting, which would be wrong for a generic
 * carrying a union of its own — `Extract<Tone, 'a' | 'b'>` — were it not that
 * the fragments such a split yields (`Extract<Tone, 'a'`) are not quoted
 * literals, so the all-or-nothing check below throws the whole type out. A
 * union that survives this really is a plain list of literals; one that mixes
 * a literal with anything else does not, and does not get a Select.
 */
function literalUnion(type: string): [string, ...string[]] | undefined {
  if (!type.includes('|')) return undefined
  // A union spread over several lines is conventionally written with a leading
  // `|`, which splits into an empty first member and sinks the whole type.
  const body = type.startsWith('|') ? type.slice(1) : type

  const members: string[] = []
  for (const part of body.split('|')) {
    const member = unquote(part)
    if (member === undefined) return undefined
    members.push(member)
  }

  // A non-empty tuple, so the caller's fallback is a member of the union it
  // came from rather than an `?? ''` inventing an option nothing accepts.
  const [first, ...rest] = members
  return first === undefined ? undefined : [first, ...rest]
}

/**
 * The control for one prop, decided from its type and its recorded default.
 *
 * @param aliases the component's `exportedTypes`, so a named union resolves.
 *   `StatusTone` is declared by `StatusDot` and used by `StatusPill`, so a page
 *   wanting every enum should pass the union of all directories' aliases.
 */
export function controlFor(row: PropRow, aliases: readonly TypeAlias[] = []): PropControl {
  const type = resolve(flatten(row.type), aliases)
  const declared = row.defaultValue === undefined ? undefined : flatten(row.defaultValue)

  if (type === 'boolean') return { kind: 'boolean', fallback: declared === 'true' }

  const options = literalUnion(type)
  if (options) {
    const preferred = declared === undefined ? undefined : unquote(declared)
    return {
      kind: 'enum',
      options,
      // A default the union does not contain is a bug in the component, not a
      // reason to seed the panel with an option that cannot be selected back.
      fallback: preferred !== undefined && options.includes(preferred) ? preferred : options[0],
    }
  }

  if (type === 'number') {
    const parsed = Number(declared)
    const usable = declared !== undefined && declared !== '' && Number.isFinite(parsed)
    return { kind: 'number', fallback: usable ? parsed : 0 }
  }

  // Defaults are read out of the implementation's destructuring, so a `string`
  // prop can default to an identifier (`formatDate`) rather than to a literal.
  // Seeding a text field with the word `formatDate` would be a lie.
  if (type === 'string') return { kind: 'text', fallback: unquote(declared ?? '') ?? '' }

  // A `ReactNode` that is not `children` is a slot — a title, an icon, an
  // action — and the panel has nothing sensible to put in it. Only the child
  // list has an obvious knob, which is how many.
  if (row.name === 'children' && (type === 'ReactNode' || type === 'React.ReactNode')) {
    return { kind: 'nodeCount', fallback: 3 }
  }

  return { kind: 'none' }
}

/**
 * The props a component page can actually steer, in the order they should appear.
 *
 * Required first, then alphabetically — the same order `PropsTable` uses, and
 * for the same reason: the required set is the smallest thing a reader has to
 * understand to use the component at all. Two lists of the same props in two
 * different orders on one page would read as two different components.
 */
export function steerableProps(
  rows: PropRow[],
  aliases: readonly TypeAlias[] = [],
): { row: PropRow; control: PropControl }[] {
  return rows
    .map((row) => ({ row, control: controlFor(row, aliases) }))
    .filter((entry) => entry.control.kind !== 'none')
    .sort((a, b) => {
      if (a.row.required !== b.row.required) return a.row.required ? -1 : 1
      return a.row.name.localeCompare(b.row.name)
    })
}
