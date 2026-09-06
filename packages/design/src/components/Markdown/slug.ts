/**
 * A heading's text, as an anchor id.
 *
 * Exported because a table of contents has to arrive at the SAME id the
 * rendered heading got, and the alternative is building the list by reading it
 * back off the DOM — which a server render does not have.
 *
 * Letters and numbers survive in any script (`\p{L}`, not `a-z`), so a Chinese
 * or Greek heading keeps its characters instead of slugging away to nothing and
 * colliding with every other one on the page. `Markdown` deduplicates what does
 * collide by appending `-2`, `-3`, and so on in document order.
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}
