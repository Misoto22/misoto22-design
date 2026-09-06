/**
 * The arithmetic every figure shares: boxes, text extents, and the frame that
 * ends up around them.
 *
 * Everything here is a pure function of numbers already in the specification.
 * That is not a stylistic preference — it is what lets these figures render on
 * a server. A layout that measured real text would need a DOM, a layout that
 * relaxed a force graph would need to settle, and neither can produce the same
 * markup twice. Both would hydrate into a different picture than the one that
 * was sent, which for a diagram is worse than not rendering at all.
 */

/** A rectangle in the figure's user-unit space. */
export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export const centerOf = (box: Box): [number, number] => [box.x + box.w / 2, box.y + box.h / 2]

/** Grows a rectangle by `pad` on every side. */
export function inflate(box: Box, pad: number): Box {
  return { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 }
}

/** The smallest rectangle containing all of them. Returns null for an empty list. */
export function union(boxes: Box[]): Box | null {
  if (boxes.length === 0) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const box of boxes) {
    if (box.x < minX) minX = box.x
    if (box.y < minY) minY = box.y
    if (box.x + box.w > maxX) maxX = box.x + box.w
    if (box.y + box.h > maxY) maxY = box.y + box.h
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

/**
 * How wide a run of text is, without measuring it.
 *
 * A real measurement needs a DOM and the loaded face, and this module has
 * neither by design — so this is an estimate, and the honest thing is to say
 * what kind. Latin glyphs in the system's sans average close to 0.52em of
 * advance across ordinary label text; digits and capitals run wider; a CJK
 * ideograph is a full em by definition, as is a fullwidth punctuation mark.
 *
 * The estimate is used for two things and neither needs to be exact: choosing a
 * box wide enough that a label is not clipped, and deciding where a line's
 * label mask sits. Both fail gracefully — a box a few units too wide is
 * invisible, and a mask a few units too wide hides a little more of a line than
 * it had to.
 *
 * It is deliberately NOT used to justify, wrap mid-word, or letter-space
 * anything. Those need the real face.
 */
export function textWidth(text: string, fontSize: number): number {
  let em = 0
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0
    if (code > 0x2e7f) {
      // CJK, kana, hangul, fullwidth forms — one em each.
      em += 1
    } else if (character === ' ') {
      em += 0.26
    } else if (/[.,:;'`!|iljtIf()[\]{}]/.test(character)) {
      em += 0.31
    } else if (/[A-Z0-9@#%&WM]/.test(character)) {
      em += 0.62
    } else {
      em += 0.52
    }
  }
  return em * fontSize
}

/**
 * A label broken to fit a width, with a hard cap on how many lines it may take.
 *
 * Breaks on spaces for Latin and between characters for CJK, which has no
 * spaces to break on. A word longer than the whole line is left to overflow
 * rather than hyphenated: an identifier — `TenantMainMiddleware` — split across
 * two lines is harder to read than one that runs slightly wide, and the caller
 * sized the box from `textWidth` anyway.
 *
 * The last line is ellipsised when the text does not fit in `maxLines`, because
 * silently dropping the tail is how a diagram comes to say something it does
 * not mean.
 */
export function wrapText(
  text: string,
  fontSize: number,
  maxWidth: number,
  maxLines = 2,
): string[] {
  if (textWidth(text, fontSize) <= maxWidth) return [text]

  const lines: string[] = []
  let current = ''

  // Latin words stay whole; a CJK run is a sequence of individual break
  // opportunities, so each ideograph becomes its own token.
  const tokens = text.match(/[⺀-鿿豈-﫿＀-￯]|[^\s⺀-鿿]+|\s+/g) ?? [text]

  for (const token of tokens) {
    const candidate = current + token
    if (current !== '' && textWidth(candidate.trimEnd(), fontSize) > maxWidth) {
      lines.push(current.trimEnd())
      current = token.trimStart()
      if (lines.length === maxLines) break
    } else {
      current = candidate
    }
  }

  if (lines.length < maxLines && current.trim() !== '') lines.push(current.trimEnd())

  if (lines.length === maxLines) {
    // Anything still unplaced belongs to the last line, which must therefore
    // admit that it is truncated.
    const placed = lines.join('').replace(/\s+/g, '')
    const whole = text.replace(/\s+/g, '')
    if (placed.length < whole.length) {
      const last = lines[maxLines - 1] ?? ''
      lines[maxLines - 1] = `${clampToWidth(last, fontSize, maxWidth - textWidth('…', fontSize))}…`
    }
  }

  return lines
}

/** The longest prefix of `text` that fits, character by character. */
function clampToWidth(text: string, fontSize: number, maxWidth: number): string {
  let width = 0
  let out = ''
  for (const character of text) {
    const next = textWidth(character, fontSize)
    if (width + next > maxWidth) break
    width += next
    out += character
  }
  return out.trimEnd()
}

/**
 * The type scale inside a figure, in user units.
 *
 * Fixed numbers rather than tokens, because these are SVG geometry: a `<text>`
 * sized in `rem` inside a scaled `viewBox` changes size when the figure is
 * zoomed, which means a diagram at 200% is a different diagram. The figure
 * scales as one picture, so its type scales with it.
 */
export const TYPE = {
  /** A node's name. */
  label: 13,
  /** The line under it. */
  sub: 10.5,
  /** A mono chip: a tag, a classification, a step number. */
  chip: 9.5,
  /** A relationship's own wording. */
  edge: 10.5,
  /** A band, lane or stage heading. */
  band: 10.5,
} as const

/** Default box sizes per diagram type, in user units. */
export const BOX = {
  node: { w: 168, h: 62 },
  wide: { w: 200, h: 62 },
  participant: { w: 128, h: 46 },
} as const

/**
 * How tall a box has to be to hold what it was given.
 *
 * A declared height is a FLOOR, not a ceiling. When a specification asks for a
 * 64-unit box and then puts two lines of label, a sublabel and a tag chip in
 * it, honouring the 64 prints the tag over the sublabel — which reads as a
 * rendering fault rather than as a box that was asked to hold too much. Growing
 * the box is visible and correct; clipping is invisible and wrong.
 */
export function nodeHeight(
  labelLines: number,
  hasSub: boolean,
  hasTag = false,
  base: number = BOX.node.h,
): number {
  const content =
    20 + labelLines * (TYPE.label * 1.25) + (hasSub ? TYPE.sub * 1.5 : 0) + (hasTag ? 20 : 0)
  return Math.max(base, Math.ceil(content))
}

/** `viewBox` as the attribute wants it. */
export function viewBoxOf(box: Box): string {
  return `${round(box.x)} ${round(box.y)} ${round(box.w)} ${round(box.h)}`
}

/**
 * Coordinates rounded to a tenth.
 *
 * SVG happily accepts eighteen decimal places and puts every one of them in the
 * markup, which on a figure with two hundred line segments is a measurable
 * share of the document. A tenth of a user unit is well under a device pixel at
 * any zoom a reader will use.
 */
export function round(value: number): number {
  return Math.round(value * 10) / 10
}
