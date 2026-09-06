import type { MarkdownInline } from './nodes'

/**
 * The schemes a link is allowed to carry, and the reason this function exists
 * at all.
 *
 * `Markdown` renders strings nobody on this side wrote — a comment, a README,
 * a model's answer — so the href is untrusted input arriving at a system
 * boundary and is validated there (HAR-SEC-002). A URL with no scheme is
 * relative and cannot reach a scheme handler, so it passes; a URL WITH one has
 * to be on this list, which is what turns `[click](javascript:…)` into plain
 * text instead of a working control.
 *
 * @returns the href, or `undefined` when it must not be linked.
 */
export function safeHref(raw: string): string | undefined {
  const href = raw.trim()
  if (href === '') return undefined
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href)
  if (!scheme) return href
  return ['http', 'https', 'mailto', 'tel'].includes((scheme[1] ?? '').toLowerCase())
    ? href
    : undefined
}

/**
 * Whether a validated href can leave this origin.
 *
 * `safeHref` decides what may be linked at all; this decides what a link is
 * allowed to take with it. Only `http` and `https` reach another site — a
 * relative href resolves against the page, and `mailto:` and `tel:` hand the
 * URL to a handler rather than to a document that could read a `Referer`.
 */
export function isOutbound(href: string): boolean {
  return /^https?:/i.test(href)
}

/**
 * Every inline construct, in one ordered alternation.
 *
 * Order is the precedence: an escape beats everything, a code span beats the
 * emphasis markers inside it, an image beats the link it otherwise looks like,
 * and `**` beats `*`. One pass with `matchAll` rather than a nest of
 * `String.replace` calls, because replace-based Markdown is how a link's URL
 * ends up italicised by an underscore in a query string.
 *
 * The `_` forms carry word-boundary guards and the `*` forms do not, which is
 * the rule every implementation converges on: `snake_case_name` is an
 * identifier, and `a*b*c` is emphasis.
 */
const INLINE = new RegExp(
  [
    // `\x60` is a backtick. Written as an escape because these are raw strings
    // in a template literal, where a real backtick needs escaping and the raw
    // form then keeps the backslash — which is a different pattern than the one
    // it looks like.
    String.raw`(?<escape>\\[\\\x60*_{}[\]()#+\-.!>])`,
    String.raw`(?<ticks>\x60+)(?<code>[\s\S]*?)\k<ticks>`,
    String.raw`!\[(?<alt>[^\]]*)\]\((?<src>[^)\s]+)\)`,
    String.raw`\[(?<text>[^\]]*)\]\((?<href>[^)\s]+)\)`,
    String.raw`\*\*(?<strongStar>[\s\S]+?)\*\*`,
    String.raw`(?<![A-Za-z0-9])__(?<strongUnderscore>[\s\S]+?)__(?![A-Za-z0-9])`,
    String.raw`\*(?<emphasisStar>[^*\n][\s\S]*?)\*`,
    String.raw`(?<![A-Za-z0-9])_(?<emphasisUnderscore>[^_\n][\s\S]*?)_(?![A-Za-z0-9])`,
  ].join('|'),
  'g',
)

/** One match, as the node it stands for. */
function tokenOf(groups: Record<string, string | undefined>): MarkdownInline {
  if (groups.escape !== undefined) return { type: 'text', value: groups.escape.slice(1) }
  if (groups.code !== undefined) return { type: 'code', value: groups.code.trim() }

  if (groups.src !== undefined) {
    const src = safeHref(groups.src)
    // A blocked image degrades to its own alt text, which is the description
    // the author wrote for exactly this situation.
    return src ? { type: 'image', src, alt: groups.alt ?? '' } : { type: 'text', value: groups.alt ?? '' }
  }

  if (groups.href !== undefined) {
    const href = safeHref(groups.href)
    const children = parseInline(groups.text ?? '')
    return href ? { type: 'link', href, children } : { type: 'text', value: groups.text ?? '' }
  }

  const strong = groups.strongStar ?? groups.strongUnderscore
  if (strong !== undefined) return { type: 'strong', children: parseInline(strong) }

  return {
    type: 'emphasis',
    children: parseInline(groups.emphasisStar ?? groups.emphasisUnderscore ?? ''),
  }
}

/** Adjacent text runs are one run; an empty one is nothing at all. */
function merge(nodes: MarkdownInline[]): MarkdownInline[] {
  const out: MarkdownInline[] = []
  for (const node of nodes) {
    const last = out[out.length - 1]
    if (node.type === 'text' && node.value === '') continue
    if (node.type === 'text' && last?.type === 'text') last.value += node.value
    else out.push(node)
  }
  return out
}

/** One run of text, as inline nodes. */
export function parseInline(text: string): MarkdownInline[] {
  const nodes: MarkdownInline[] = []
  let cursor = 0

  for (const match of text.matchAll(INLINE)) {
    const at = match.index
    if (at > cursor) nodes.push({ type: 'text', value: text.slice(cursor, at) })
    nodes.push(tokenOf(match.groups ?? {}))
    cursor = at + match[0].length
  }
  if (cursor < text.length) nodes.push({ type: 'text', value: text.slice(cursor) })

  return merge(nodes)
}
