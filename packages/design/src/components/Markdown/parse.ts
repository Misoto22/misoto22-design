import { parseInline } from './inline'
import type { MarkdownHeadingLevel, MarkdownNode } from './nodes'

/**
 * The block grammar, as the six line shapes it recognises.
 *
 * Line-based rather than character-based, which is what keeps this small enough
 * to live in a design system: Markdown's blocks are decided by how a line
 * STARTS, and the interesting half — emphasis, links, code spans — is the
 * inline pass, which runs once per block.
 */
const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)\s*$/
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/
const RULE = /^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/
const QUOTE = /^ {0,3}>\s?(.*)$/
const ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/

/**
 * A line, or the empty string past the end.
 *
 * `noUncheckedIndexedAccess` is on, and every scanner below walks off the end
 * of the array by construction — reading one line ahead is how a list decides
 * whether a blank line ended it. An empty string matches none of the patterns,
 * which is exactly the answer wanted there.
 */
const lineAt = (lines: string[], index: number): string => lines[index] ?? ''

const opensBlock = (line: string): boolean =>
  HEADING.test(line) || RULE.test(line) || FENCE.test(line) || QUOTE.test(line) || ITEM.test(line)

/** A fence closes on the same character, at the same length or longer. */
const closesFence = (line: string, marker: string): boolean =>
  new RegExp(`^ {0,3}${marker.charAt(0)}{${marker.length},}\\s*$`).test(line)

function takeFence(lines: string[], start: number, out: MarkdownNode[]): number {
  const fence = FENCE.exec(lineAt(lines, start))
  if (!fence) return start + 1
  const [, marker = '', info = ''] = fence

  const body: string[] = []
  let i = start + 1
  while (i < lines.length && !closesFence(lineAt(lines, i), marker)) {
    body.push(lineAt(lines, i))
    i += 1
  }
  out.push({ type: 'code', value: body.join('\n'), lang: info || undefined })

  // An unclosed fence runs to the end of the document rather than throwing.
  // That is what CommonMark specifies, and it is also the exact shape of a
  // model's answer that hit its token limit mid-snippet.
  return i < lines.length ? i + 1 : i
}

function takeQuote(lines: string[], start: number, out: MarkdownNode[]): number {
  const body: string[] = []
  let i = start
  while (i < lines.length) {
    const quoted = QUOTE.exec(lineAt(lines, i))
    if (!quoted) break
    body.push(quoted[1] ?? '')
    i += 1
  }
  // Recursive, so a list, a fence or a nested quote inside a blockquote is the
  // same code path rather than five more cases.
  out.push({ type: 'quote', children: parseBlocks(body) })
  return i
}

function takeList(lines: string[], start: number, out: MarkdownNode[]): number {
  const first = ITEM.exec(lineAt(lines, start))
  if (!first) return start + 1

  const baseIndent = (first[1] ?? '').length
  const ordered = /\d/.test(first[2] ?? '')
  const items: MarkdownNode[][] = []
  let current: string[] | undefined
  let indent = 0
  let i = start

  while (i < lines.length) {
    const line = lineAt(lines, i)
    const item = ITEM.exec(line)
    const [, gap = '', bullet = '', rest = ''] = item ?? []

    if (item && gap.length <= baseIndent) {
      // A bullet directly under a number is a second list, not a stray item.
      if (ordered !== /\d/.test(bullet)) break
      if (current) items.push(parseBlocks(current))
      indent = gap.length + bullet.length + 1
      current = [rest]
      i += 1
      continue
    }
    if (current !== undefined && (line.trim() === '' || line.startsWith(' '.repeat(indent)))) {
      current.push(line.slice(indent))
      i += 1
      continue
    }
    break
  }

  if (current) items.push(parseBlocks(current))
  out.push({ type: 'list', ordered, items })
  return i
}

function takeParagraph(lines: string[], start: number, out: MarkdownNode[]): number {
  const body: string[] = []
  let i = start
  for (let line = lineAt(lines, i); i < lines.length; line = lineAt(lines, i)) {
    if (line.trim() === '' || opensBlock(line)) break
    body.push(line.trim())
    i += 1
  }
  if (body.length === 0) return start + 1

  // Soft line breaks join with a space, which is what Markdown means by them:
  // a paragraph hard-wrapped at 80 columns is one paragraph.
  out.push({ type: 'paragraph', children: parseInline(body.join(' ')) })
  return i
}

function parseBlocks(lines: string[]): MarkdownNode[] {
  const out: MarkdownNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lineAt(lines, i)
    const heading = HEADING.exec(line)

    if (line.trim() === '') i += 1
    else if (FENCE.test(line)) i = takeFence(lines, i, out)
    else if (heading) {
      out.push({
        type: 'heading',
        level: (heading[1] ?? '#').length as MarkdownHeadingLevel,
        children: parseInline(heading[2] ?? ''),
      })
      i += 1
    } else if (RULE.test(line)) {
      out.push({ type: 'rule' })
      i += 1
    } else if (QUOTE.test(line)) i = takeQuote(lines, i, out)
    else if (ITEM.test(line)) i = takeList(lines, i, out)
    else i = takeParagraph(lines, i, out)
  }
  return out
}

/**
 * A Markdown string, as nodes.
 *
 * The supported subset, stated so nobody has to find its edges by experiment:
 * ATX headings, paragraphs, fenced code with an info string, blockquotes,
 * ordered and unordered lists including nesting, thematic breaks — and inline
 * emphasis, strong, code spans, links, images and backslash escapes.
 *
 * What is NOT here, and is deliberate: tables, footnotes, task lists, setext
 * headings, reference links, hard line breaks, and raw HTML. Raw HTML is the
 * one that matters — it is left as text rather than rendered, so this path has
 * no `dangerouslySetInnerHTML` anywhere in it and cannot be talked into one. A
 * document that needs the rest brings its own parser through `Markdown`'s
 * `parse` prop.
 *
 * Never throws. Malformed input is not an error condition here — it is Tuesday
 * — so an unterminated fence, a stray bracket or an empty string each produce
 * the nodes they can and no more.
 */
export function parseMarkdown(source: string): MarkdownNode[] {
  if (typeof source !== 'string' || source.trim() === '') return []
  return parseBlocks(source.replace(/\r\n?/g, '\n').split('\n'))
}
