/**
 * Parses the package's own CSS into structured tokens.
 *
 * This lives in the PACKAGE, not in the documentation site, because the answer
 * it produces is not a documentation concern: a Satori card, a native app, a
 * Figma sync and a build script all need the token values, and none of them can
 * read a stylesheet. Shipping `dist/tokens.json` beside `dist/tokens.css` means
 * there is one parser and one answer rather than one per consumer.
 *
 * The documentation site is simply the first consumer.
 *
 * Comments are carried through, because in this system the comment above a
 * token is usually the only place the REASON for it is written down.
 */
import { readFileSync } from 'node:fs'

/** A CSS block: its selector, and its declarations in document order. */
function* blocks(css) {
  const pattern = /([^{}]+)\{([^{}]*)\}/g
  for (const [, selector, body] of css.matchAll(pattern)) {
    yield { selector: selector.trim(), body }
  }
}

/**
 * Splits a declaration body into entries, keeping the comment that immediately
 * precedes each one. A comment introducing a RUN of tokens (the usual style
 * here) is attached to the first of them and surfaced as a group heading.
 */
function parseBody(body) {
  const entries = []
  let pendingComment
  const pattern = /\/\*([\s\S]*?)\*\/|--([\w-]+):\s*([^;]+);/g
  for (const match of body.matchAll(pattern)) {
    const [, comment, name, value] = match
    if (comment !== undefined) {
      pendingComment = comment
        .split('\n')
        .map((line) => line.replace(/^\s*/, '').replace(/\s+$/, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      continue
    }
    entries.push({ name, value: value.trim(), comment: pendingComment })
    pendingComment = undefined
  }
  return entries
}

/**
 * Which foundations page a token belongs on. Derived from the name, so a token
 * added to the CSS lands somewhere without anyone updating a mapping — and an
 * unrecognised one lands in `other`, visibly, rather than vanishing.
 */
function classify(name, value) {
  if (/^(control-|field-)/.test(name)) return 'density'
  if (/^(fs-|sans|serif|mono|cjk-|lh-|ls-)/.test(name)) return 'type'
  if (/^radius/.test(name)) return 'radius'
  if (/^(ease|fast|mid|slow|duration)/.test(name)) return 'motion'
  if (/^z-/.test(name)) return 'layer'
  if (/^(pad|sec|maxw|col|row|w-|measure-|page-pad|scroll-offset|toc-)/.test(name)) return 'space'
  if (/^(focus|ring)/.test(name)) return 'focus'
  if (/^ico-/.test(name)) return 'icon'
  if (/^(shadow|lift|disabled-opacity)/.test(name)) return 'depth'
  if (/(^|-)(soft|wash)$/.test(name) || /^(paper|ink|stone|mist|rule|clay|red|forest|bar|ok|warn|danger|scrim|on-|feature|photo|background|foreground|secondary|accent|border|card|code|nav|success|warning|info|brand|overlay)/.test(name)) {
    return 'colour'
  }
  return value.startsWith('#') || value.startsWith('rgba') ? 'colour' : 'other'
}

/**
 * @param {{ tokens: string, semantic: string }} files absolute paths
 */
export function extractTokens(files) {
  const layers = {}

  for (const [layer, path] of Object.entries(files)) {
    const css = readFileSync(path, 'utf8')
    const light = []
    const dark = []
    for (const { selector, body } of blocks(css)) {
      const target = selector.includes("[data-mode='dark']") ? dark : light
      for (const entry of parseBody(body)) {
        target.push({ ...entry, category: classify(entry.name, entry.value) })
      }
    }
    // A token declared twice in the light layer (the file has more than one
    // `:root`) keeps its LAST declaration, matching how the browser resolves it.
    const dedupe = (entries) => [...new Map(entries.map((e) => [e.name, e])).values()]
    layers[layer] = { light: dedupe(light), dark: dedupe(dark) }
  }

  return layers
}
