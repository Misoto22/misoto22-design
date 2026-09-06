/**
 * The node shapes `Markdown` renders, and the contract a custom `parse`
 * function has to meet.
 *
 * Deliberately small. It is not an attempt at mdast: it is the set of blocks
 * this design system has an opinion about, which is the set `article.css`
 * already styles. Anything outside it — footnotes, tables, task lists,
 * definition lists, embedded HTML — is a `parse` away, and the point of naming
 * the shapes here rather than accepting a foreign AST is that a consumer
 * bringing markdown-it or remark maps into a surface the package can promise
 * to keep rendering.
 */

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/** A run of text, and the four things that can happen inside one. */
export type MarkdownInline =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'strong'; children: MarkdownInline[] }
  | { type: 'emphasis'; children: MarkdownInline[] }
  | { type: 'link'; href: string; children: MarkdownInline[] }
  | { type: 'image'; src: string; alt: string }

/**
 * A block.
 *
 * `list` items and `quote` children are blocks in turn, which is what makes a
 * nested list, or a fence inside a bullet, fall out of the same recursion
 * rather than needing a case of its own.
 */
export type MarkdownNode =
  | { type: 'heading'; level: MarkdownHeadingLevel; children: MarkdownInline[] }
  | { type: 'paragraph'; children: MarkdownInline[] }
  | { type: 'code'; value: string; lang?: string }
  | { type: 'list'; ordered: boolean; items: MarkdownNode[][] }
  | { type: 'quote'; children: MarkdownNode[] }
  | { type: 'rule' }
