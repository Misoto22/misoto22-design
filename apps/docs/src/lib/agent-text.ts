import propsData from '@/generated/props.json'
import examplesData from '@/generated/examples.json'
import { COMPONENTS, type ComponentEntry } from '@/content/registry'
import { FOUNDATIONS } from '@/content/foundations'
import { TEMPLATES } from '@/content/templates'
import { LAWS } from '@/content/principles'
import catalog from '@/generated/catalog'

/**
 * The site, written for a reader that does not render CSS.
 *
 * A documentation site is two audiences now. The HTML answers the first: it is
 * laid out, it is navigable, it shows the component running. The second reads
 * a fetch response, and everything that makes the first version good — the
 * live preview, the syntax highlighting, the sidebar — is noise to it, while
 * the things it needs most (every prop with its type, the whole example
 * source, the keyboard contract) are the parts spread thinnest across a page.
 *
 * So this is not a scrape of the HTML. It is the same generated data the pages
 * read, arranged for one long sequential read.
 *
 * The format follows llmstxt.org: `/llms.txt` is an index of links,
 * `/llms-full.txt` is everything inline, and each component has its own file
 * so an agent can fetch one component rather than the whole system.
 */

const SITE = 'https://ui.misoto22.com'

/**
 * The theme axes, as the package derives them from its own stylesheets.
 *
 * Written out by hand here until it said there was a `data-accent` attribute,
 * which there has never been, and did not mention `data-surface="glass"`,
 * which there is. A list of someone else's file goes stale silently; this one
 * did, and an agent reading it set an attribute that does nothing.
 */
const THEME_AXES = catalog.themeAxes as { axis: string; values: string[]; unset: string | null }[]

interface PropRow {
  name: string
  type: string
  required?: boolean
  defaultValue?: string
  description?: string
}

interface ComponentSource {
  name: string
  description?: string
  props?: PropRow[]
  passthrough?: string[]
  reexport?: string
}

const PROPS = propsData as unknown as Record<string, { components: ComponentSource[] }>
const EXAMPLES = examplesData as unknown as Record<
  string,
  { id: string; title?: string; snippet: string }[]
>

/** A JSDoc block reflows to one paragraph: the line breaks were for a column. */
const flow = (text: string | undefined) => text?.replace(/\s*\n\s*/g, ' ').trim() ?? ''

function propTable(rows: PropRow[]): string {
  if (rows.length === 0) return ''
  const lines = rows.map((row) => {
    const parts = [
      `- \`${row.name}\``,
      row.required ? '(required)' : '',
      `— \`${row.type}\``,
      row.defaultValue ? `default \`${row.defaultValue}\`` : '',
    ].filter(Boolean)
    const head = parts.join(' ')
    const note = flow(row.description)
    return note ? `${head}. ${note}` : `${head}.`
  })
  return lines.join('\n')
}

/** One component, as the whole of what the site knows about it. */
export function componentText(entry: ComponentEntry): string {
  const source = PROPS[entry.dir]
  const examples = EXAMPLES[entry.dir] ?? []
  const out: string[] = [
    `# ${entry.name}`,
    '',
    `${entry.summary}`,
    '',
    `- Group: ${entry.group}`,
    `- Import: \`import { ${entry.name} } from '@misoto22/design'\``,
    `- Page: ${SITE}/components/${entry.slug}/`,
  ]

  if (entry.related?.length) out.push(`- Related: ${entry.related.join(', ')}`)
  out.push('')

  if (entry.when) out.push('## When to reach for it', '', entry.when, '')

  if (entry.accessibility?.length) {
    out.push('## Accessibility', '', ...entry.accessibility.map((line) => `- ${line}`), '')
  }

  if (entry.keyboard?.length) {
    out.push(
      '## Keyboard',
      '',
      ...entry.keyboard.map((row) => `- ${row.keys.join(' / ')} — ${row.does}`),
      '',
    )
  }

  for (const part of source?.components ?? []) {
    out.push(`## ${part.name}`, '')
    if (part.reexport) out.push(`Re-export of \`${part.reexport}\`.`, '')
    if (part.description) out.push(flow(part.description), '')
    if (part.props?.length) out.push('### Props', '', propTable(part.props), '')
    if (part.passthrough?.length) {
      out.push(`Also accepts: ${part.passthrough.map((name) => `\`${name}\``).join(', ')}.`, '')
    }
  }

  for (const example of examples) {
    out.push(`## Example — ${example.title ?? example.id}`, '', '```tsx', example.snippet, '```', '')
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n')
}

/** The index: what this is, and where everything lives. */
export function indexText(): string {
  const out: string[] = [
    '# misoto22 design',
    '',
    '> A monochrome design system for software, writing and photography:',
    '> portable CSS tokens and accessible React primitives. Paper ground,',
    '> near-black mark, and status is the only chroma in the file.',
    '',
    `Install: \`npm install @misoto22/design\`. Styles: \`import '@misoto22/design/styles.css'\`.`,
    'Every component is a client-safe React 19 component; the token layer is',
    'plain CSS and works without React at all.',
    '',
    '## The laws',
    '',
    ...LAWS.flatMap((law) => [
      `${Number(law.n)}. **${law.title}** ${flow(law.body)}`,
      `   Rules out: ${flow(law.rules_out)}`,
    ]),
    '',
    '## Theming',
    '',
    'Attributes that re-point tokens the package already defines. No component',
    'reads any of them, and none of them introduces a token.',
    '',
    ...THEME_AXES.map(
      (axis) =>
        `- \`${axis.axis}\`: ${axis.values.join(' | ')}${axis.unset ? ` (unset = ${axis.unset})` : ''}`,
    ),
    '',
    'An unset attribute is the default; nothing is anchored to `:root`, so an',
    'axis set on any element applies to the subtree below it. There is no',
    '`data-accent` attribute — `--accent` is a custom property, re-pointed in CSS.',
    '',
    '## Components',
    '',
    ...COMPONENTS.map(
      (entry) =>
        `- [${entry.name}](${SITE}/components/${entry.slug}/llms.txt): ${entry.summary}`,
    ),
    '',
    '## Foundations',
    '',
    ...FOUNDATIONS.map((page) => `- [${page.title}](${SITE}/foundations/${page.slug}/): ${flow(page.summary)}`),
    '',
    '## Templates',
    '',
    ...TEMPLATES.map((template) => `- [${template.name}](${SITE}/templates/${template.slug}/): ${template.summary}`),
    '',
    '## Optional',
    '',
    `- [Everything, inline](${SITE}/llms-full.txt) — every component in one file.`,
    `- [Themes](${SITE}/themes/) — the five presets, rendered.`,
    `- [Changelog](${SITE}/changelog/)`,
  ]
  return out.join('\n')
}

/** Everything, for a reader that would rather fetch once. */
export function fullText(): string {
  return [indexText(), '', '---', '', ...COMPONENTS.map(componentText)].join('\n')
}
